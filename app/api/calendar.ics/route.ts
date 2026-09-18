import { neon } from "@neondatabase/serverless";
import { calendarToken } from "@/lib/calendar-token";

// 구글/애플 캘린더 구독용 ICS 피드: /api/calendar.ics?token=…
export const dynamic = "force-dynamic";

function ics(d: Date) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
function day(d: Date) { return d.toISOString().slice(0, 10).replace(/-/g, ""); }
function esc(s: string) { return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => "\\" + m); }
function fold(line: string) { const out: string[] = []; let s = line; while (s.length > 72) { out.push(s.slice(0, 72)); s = " " + s.slice(72); } out.push(s); return out.join("\r\n"); }

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const expected = calendarToken();
  if (!expected || token !== expected) return new Response("unauthorized", { status: 401 });
  if (!process.env.DATABASE_URL) return new Response("no db", { status: 503 });
  const rows = await neon(process.env.DATABASE_URL)`SELECT * FROM events WHERE starts_at > now() - interval '1 year' ORDER BY starts_at`;
  const host = new URL(req.url).host;
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//eonyong-page//calendar//KO", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "X-WR-CALNAME:정언용 일정", "X-WR-TIMEZONE:Asia/Seoul", "REFRESH-INTERVAL;VALUE=DURATION:PT15M", "X-PUBLISHED-TTL:PT15M"];
  for (const e of rows as Record<string, unknown>[]) {
    const st = new Date(e.starts_at as string); const en = e.ends_at ? new Date(e.ends_at as string) : new Date(st.getTime() + 36e5);
    lines.push("BEGIN:VEVENT", `UID:event-${e.id}@${host}`, `DTSTAMP:${ics(new Date(e.updated_at as string))}`);
    if (e.all_day) { const next = new Date(st); next.setUTCDate(next.getUTCDate() + 1); lines.push(`DTSTART;VALUE=DATE:${day(st)}`, `DTEND;VALUE=DATE:${day(e.ends_at ? en : next)}`); }
    else lines.push(`DTSTART:${ics(st)}`, `DTEND:${ics(en)}`);
    lines.push(fold(`SUMMARY:${esc(String(e.title))}`));
    if (e.location) lines.push(fold(`LOCATION:${esc(String(e.location))}`));
    if (e.note) lines.push(fold(`DESCRIPTION:${esc(String(e.note))}`));
    if (Number.isInteger(e.remind_min)) lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(String(e.title))}`, `TRIGGER:-PT${e.remind_min}M`, "END:VALARM");
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n") + "\r\n", { headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "no-store", "content-disposition": 'inline; filename="calendar.ics"' } });
}
