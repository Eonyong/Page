import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { calendarToken } from "@/lib/calendar-token";

function auth(req: Request) {
  if (!process.env.ADMIN_KEY || req.headers.get("x-admin-key") !== process.env.ADMIN_KEY) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });
  return null;
}

// GET ?from=ISO&to=ISO  → 기간 내 일정 + 구독 링크 토큰
export async function GET(req: Request) {
  const denied = auth(req); if (denied) return denied;
  const u = new URL(req.url);
  const from = u.searchParams.get("from") ?? new Date(Date.now() - 45 * 864e5).toISOString();
  const to = u.searchParams.get("to") ?? new Date(Date.now() + 90 * 864e5).toISOString();
  const sql = neon(process.env.DATABASE_URL as string);
  const rows = await sql`SELECT * FROM events WHERE starts_at >= ${from} AND starts_at < ${to} ORDER BY starts_at`;
  return NextResponse.json({ events: rows, token: calendarToken() });
}

// POST { id?, title, starts_at, ends_at?, all_day?, location?, note?, remind_min? }
export async function POST(req: Request) {
  const denied = auth(req); if (denied) return denied;
  const b = await req.json().catch(() => null);
  if (!b || typeof b.title !== "string" || !b.title.trim() || typeof b.starts_at !== "string" || isNaN(Date.parse(b.starts_at)))
    return NextResponse.json({ error: "title, starts_at(ISO) 필요" }, { status: 400 });
  const sql = neon(process.env.DATABASE_URL as string);
  const ends = b.ends_at && !isNaN(Date.parse(b.ends_at)) ? b.ends_at : null;
  const remind = Number.isInteger(b.remind_min) ? b.remind_min : null;
  const v = { title: b.title.trim(), starts: b.starts_at, ends, allDay: Boolean(b.all_day), loc: b.location?.trim() || null, note: b.note?.trim() || null, remind };
  const rows = Number.isInteger(b.id)
    ? await sql`UPDATE events SET title=${v.title}, starts_at=${v.starts}, ends_at=${v.ends}, all_day=${v.allDay}, location=${v.loc}, note=${v.note}, remind_min=${v.remind}, updated_at=now() WHERE id=${b.id} RETURNING *`
    : await sql`INSERT INTO events (title, starts_at, ends_at, all_day, location, note, remind_min) VALUES (${v.title}, ${v.starts}, ${v.ends}, ${v.allDay}, ${v.loc}, ${v.note}, ${v.remind}) RETURNING *`;
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: Request) {
  const denied = auth(req); if (denied) return denied;
  const b = await req.json().catch(() => null);
  if (!b || !Number.isInteger(b.id)) return NextResponse.json({ error: "id 필요" }, { status: 400 });
  await neon(process.env.DATABASE_URL as string)`DELETE FROM events WHERE id=${b.id}`;
  return NextResponse.json({ ok: true });
}
