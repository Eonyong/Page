"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getKey } from "@/lib/admin-client";
import { holidayName } from "@/lib/holidays";

type Ev = { id: number; title: string; starts_at: string; ends_at: string | null; all_day: boolean; location: string | null; note: string | null; remind_min: number | null };
type Draft = { id?: number; title: string; date: string; start: string; end: string; all_day: boolean; location: string; note: string; remind_min: string };

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const REMINDS = [["", "알림 없음"], ["0", "정각"], ["10", "10분 전"], ["30", "30분 전"], ["60", "1시간 전"], ["1440", "하루 전"]];

function emptyDraft(date: string): Draft { return { title: "", date, start: "10:00", end: "11:00", all_day: false, location: "", note: "", remind_min: "30" }; }
function toDraft(e: Ev): Draft {
  const s = new Date(e.starts_at), en = e.ends_at ? new Date(e.ends_at) : null;
  return { id: e.id, title: e.title, date: ymd(s), start: hm(s), end: en ? hm(en) : hm(new Date(s.getTime() + 36e5)), all_day: e.all_day, location: e.location ?? "", note: e.note ?? "", remind_min: e.remind_min == null ? "" : String(e.remind_min) };
}

export default function CalendarPage() {
  const router = useRouter();
  const today = ymd(new Date());
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState(today);
  const [events, setEvents] = useState<Ev[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [status, setStatus] = useState("");
  const [showSub, setShowSub] = useState(false);

  const load = useCallback(async () => {
    const from = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1).toISOString();
    const to = new Date(cursor.getFullYear(), cursor.getMonth() + 2, 1).toISOString();
    try { const r = await api(`/api/events?from=${from}&to=${to}`); setEvents(r.events); setToken(r.token); }
    catch (e) { setStatus((e as Error).message); if ((e as Error).message === "unauthorized") router.replace("/admin"); }
  }, [cursor, router]);
  useEffect(() => { if (!getKey()) { router.replace("/admin"); return; } void load(); }, [load, router]);

  const byDay = useMemo(() => { const m: Record<string, Ev[]> = {}; for (const e of events) (m[ymd(new Date(e.starts_at))] ||= []).push(e); return m; }, [events]);
  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first); start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [cursor]);
  const upcoming = useMemo(() => events.filter((e) => new Date(e.starts_at) >= new Date(Date.now() - 864e5)).slice(0, 8), [events]);

  async function save() {
    if (!draft || !draft.title.trim()) { setStatus("제목을 입력하세요."); return; }
    const starts = draft.all_day ? new Date(`${draft.date}T00:00:00`) : new Date(`${draft.date}T${draft.start}:00`);
    const ends = draft.all_day ? null : new Date(`${draft.date}T${draft.end}:00`);
    if (ends && ends <= starts) { setStatus("종료 시간이 시작보다 빨라요."); return; }
    try {
      await api("/api/events", { method: "POST", body: JSON.stringify({ id: draft.id, title: draft.title, starts_at: starts.toISOString(), ends_at: ends?.toISOString() ?? null, all_day: draft.all_day, location: draft.location, note: draft.note, remind_min: draft.remind_min === "" ? null : Number(draft.remind_min) }) });
      setDraft(null); setStatus("저장했습니다."); await load();
    } catch (e) { setStatus((e as Error).message); }
  }
  async function remove(id: number) {
    if (!confirm("이 일정을 삭제할까요?")) return;
    await api("/api/events", { method: "DELETE", body: JSON.stringify({ id }) }); setDraft(null); await load();
  }
  const subUrl = token && typeof window !== "undefined" ? `${window.location.origin}/api/calendar.ics?token=${token}` : "";
  const fmt = (e: Ev) => e.all_day ? "종일" : `${hm(new Date(e.starts_at))}${e.ends_at ? "–" + hm(new Date(e.ends_at)) : ""}`;

  return (
    <main className="wrap" style={{ paddingBlock: "36px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap" }}>
        <div><div className="eyebrow">Admin · Calendar</div><h1 className="h2" style={{ marginTop: 10 }}>일정</h1></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn-ghost" onClick={() => setShowSub(true)}>휴대폰 캘린더에 연동</button>
          <Link href="/admin" className="btn-ghost">글 관리</Link>
          <button className="btn-primary" onClick={() => setDraft(emptyDraft(selected))}>+ 새 일정</button>
        </div>
      </div>

      <div className="cal">
        <section className="cal-grid-wrap">
          <div className="cal-head">
            <button className="cal-nav" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="이전 달">‹</button>
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 700 }}>{cursor.getFullYear()}년 {cursor.getMonth() + 1}월</h2>
            <button className="cal-nav" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="다음 달">›</button>
            <button className="btn-ghost" style={{ marginLeft: 8, padding: "6px 10px", fontSize: 13 }} onClick={() => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); setSelected(today); }}>오늘</button>
          </div>
          <div className="cal-grid">
            {WEEK.map((w, i) => <div key={w} className="cal-dow" style={{ color: i === 0 ? "#B42318" : i === 6 ? "var(--accent)" : undefined }}>{w}</div>)}
            {cells.map((d) => {
              const k = ymd(d); const inMonth = d.getMonth() === cursor.getMonth(); const evs = byDay[k] ?? [];
              const hol = holidayName(k); const dow = d.getDay(); const red = hol || dow === 0; const blue = !red && dow === 6;
              return (
                <button key={k} className={`cal-cell ${inMonth ? "" : "dim"} ${k === selected ? "sel" : ""} ${k === today ? "today" : ""} ${red ? "red" : ""} ${blue ? "blue" : ""}`} onClick={() => setSelected(k)} onDoubleClick={() => setDraft(emptyDraft(k))}>
                  <span className="cal-num">{d.getDate()}</span>
                  {hol && <span className="cal-hol">{hol}</span>}
                  <span className="cal-evs">{evs.slice(0, 3).map((e) => <span key={e.id} className={`cal-ev ${e.all_day ? "all" : ""}`}>{e.title}</span>)}{evs.length > 3 && <span className="cal-more">+{evs.length - 3}</span>}</span>
                </button>
              );
            })}
          </div>
          <p className="mono" style={{ fontSize: 11.5, color: "var(--ink2)", marginTop: 10 }}>날짜 클릭 = 선택 · 더블클릭 = 바로 일정 추가</p>
        </section>

        <aside className="cal-side">
          {draft ? (
            <div className="cal-form">
              <h3 className="h3" style={{ fontSize: 20 }}>{draft.id ? "일정 수정" : "새 일정"}</h3>
              <input id="ev-title" className="inp" placeholder="제목" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} autoFocus />
              <input id="ev-date" className="inp" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
              <label className="cal-check"><input type="checkbox" checked={draft.all_day} onChange={(e) => setDraft({ ...draft, all_day: e.target.checked })} /> 종일</label>
              {!draft.all_day && <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" }}>
                <input id="ev-start" className="inp" type="time" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} /><span>–</span>
                <input id="ev-end" className="inp" type="time" value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} />
              </div>}
              <input id="ev-loc" className="inp" placeholder="장소 (선택)" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
              <textarea id="ev-note" className="inp" rows={3} placeholder="메모 (선택)" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
              <select id="ev-remind" className="inp" value={draft.remind_min} onChange={(e) => setDraft({ ...draft, remind_min: e.target.value })}>
                {REMINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 6 }}>
                {draft.id ? <button className="lnk danger" onClick={() => remove(draft.id!)}>삭제</button> : <span />}
                <div style={{ display: "flex", gap: 8 }}><button className="btn-ghost" onClick={() => setDraft(null)}>취소</button><button className="btn-primary" onClick={save}>저장</button></div>
              </div>
            </div>
          ) : (
            <>
              <div className="cal-side-head">
                <div><div className="mono" style={{ fontSize: 12, color: holidayName(selected) ? "#B42318" : "var(--ink2)" }}>{selected.replace(/-/g, ".")} ({WEEK[new Date(selected + "T00:00:00").getDay()]}){holidayName(selected) ? ` · ${holidayName(selected)}` : ""}</div>
                  <h3 className="h3" style={{ fontSize: 20 }}>{(byDay[selected] ?? []).length ? `일정 ${(byDay[selected] ?? []).length}건` : "일정 없음"}</h3></div>
                <button className="btn-ghost" style={{ padding: "6px 10px", fontSize: 13 }} onClick={() => setDraft(emptyDraft(selected))}>+ 추가</button>
              </div>
              <ul className="cal-list">
                {(byDay[selected] ?? []).map((e) => (
                  <li key={e.id}><button className="cal-item" onClick={() => setDraft(toDraft(e))}>
                    <span className="mono" style={{ fontSize: 12, color: "var(--accent)" }}>{fmt(e)}</span>
                    <span style={{ fontWeight: 600 }}>{e.title}</span>
                    {e.location && <span className="body" style={{ fontSize: 13 }}>{e.location}</span>}
                  </button></li>
                ))}
              </ul>
              <div className="eyebrow" style={{ marginTop: 28 }}>다가오는 일정</div>
              <ul className="cal-list" style={{ marginTop: 8 }}>
                {upcoming.length === 0 && <li className="body" style={{ fontSize: 14 }}>예정된 일정이 없습니다.</li>}
                {upcoming.map((e) => (
                  <li key={e.id}><button className="cal-item" onClick={() => { setSelected(ymd(new Date(e.starts_at))); setDraft(toDraft(e)); }}>
                    <span className="mono" style={{ fontSize: 12, color: "var(--ink2)" }}>{ymd(new Date(e.starts_at)).slice(5).replace("-", ".")} · {fmt(e)}</span>
                    <span>{e.title}</span>
                  </button></li>
                ))}
              </ul>
            </>
          )}
          {status && <p className="mono" style={{ fontSize: 12, color: "var(--ink2)", marginTop: 12 }}>{status}</p>}
        </aside>
      </div>

      {showSub && (
        <div className="ed-modal" onClick={() => setShowSub(false)}>
          <div className="ed-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="h3">휴대폰 캘린더에 연동</h2>
            <p className="body" style={{ fontSize: 14 }}>아래 주소를 '구독'하면 여기서 만든 일정이 구글·애플 캘린더에 나타나고, 그 앱이 알림을 보냅니다. 주소는 비밀이니 공유하지 마세요.</p>
            <div className="ed-slug" style={{ marginTop: 6 }}><input className="inp mono" readOnly value={subUrl} onFocus={(e) => e.currentTarget.select()} style={{ fontSize: 12 }} /></div>
            <button className="btn-ghost" style={{ justifySelf: "start" }} onClick={() => { navigator.clipboard?.writeText(subUrl); setStatus("주소를 복사했습니다."); }}>주소 복사</button>
            <div className="body" style={{ fontSize: 14, display: "grid", gap: 10, marginTop: 8 }}>
              <div><b>애플 캘린더 (iPhone)</b><br />설정 → 캘린더 → 계정 → 계정 추가 → 기타 → <b>구독 캘린더 추가</b> → 주소 붙여넣기. 일정에 설정한 알림(예: 30분 전)이 그대로 옵니다.</div>
              <div><b>구글 캘린더</b><br />PC에서 calendar.google.com → 왼쪽 '다른 캘린더' + → <b>URL로 추가</b> → 주소 붙여넣기. 갱신 주기가 수 시간 걸릴 수 있고, 알림은 구글 캘린더의 해당 캘린더 설정에서 기본 알림을 지정해야 옵니다.</div>
              <div><b>맥 캘린더</b><br />파일 → 새로운 캘린더 구독 → 주소 붙여넣기 → 자동 새로 고침 15분.</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}><button className="btn-primary" onClick={() => setShowSub(false)}>닫기</button></div>
          </div>
        </div>
      )}
    </main>
  );
}
