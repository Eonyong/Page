"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getKey, setKey, clearKey } from "@/lib/admin-client";

type Row = { id: number; slug: string; title: string; summary: string | null; tags: string[]; published: boolean; updated_at: string };

export default function Admin() {
  const [key, setK] = useState("");
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState("");

  async function load() {
    try { setRows(await api("/api/posts")); setAuthed(true); setErr(""); }
    catch (e) { setAuthed(false); setErr((e as Error).message); }
  }
  useEffect(() => { if (getKey()) void load(); }, []);

  async function login(e: React.FormEvent) { e.preventDefault(); setKey(key.trim()); await load(); }
  async function remove(slug: string) {
    if (!confirm(`'${slug}' 글을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    await api("/api/posts", { method: "DELETE", body: JSON.stringify({ slug }) }); await load();
  }
  async function toggle(r: Row) {
    const full = await api(`/api/posts?slug=${r.slug}`);
    await api("/api/posts", { method: "POST", body: JSON.stringify({ ...full, published: !r.published }) }); await load();
  }

  if (!authed) return (
    <main className="wrap" style={{ paddingBlock: "64px 96px", maxWidth: 480 }}>
      <div className="eyebrow">Admin</div>
      <h1 className="h2" style={{ marginTop: 12 }}>관리자 로그인</h1>
      <form onSubmit={login} style={{ display: "grid", gap: 12, marginTop: 24 }}>
        <input id="admin-key" type="password" value={key} onChange={(e) => setK(e.target.value)} placeholder="ADMIN_KEY" className="inp" autoFocus />
        <button className="btn-primary" type="submit">들어가기</button>
        {err && <p className="body" style={{ color: "#B42318" }}>{err === "unauthorized" ? "키가 틀립니다." : err}</p>}
      </form>
    </main>
  );

  return (
    <main className="wrap" style={{ paddingBlock: "48px 96px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap" }}>
        <div><div className="eyebrow">Admin</div><h1 className="h2" style={{ marginTop: 12 }}>내 글 {rows.length}</h1></div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/admin/write" className="btn-primary">새 글 쓰기</Link>
          <button className="btn-ghost" onClick={() => { clearKey(); setAuthed(false); }}>로그아웃</button>
        </div>
      </div>
      <div className="post-list" style={{ marginTop: 28 }}>
        {rows.length === 0 && <p className="body" style={{ padding: "24px 0" }}>아직 글이 없습니다. 첫 글을 써보세요.</p>}
        {rows.map((r) => (
          <div key={r.id} className="post-row" style={{ gridTemplateColumns: "1fr", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 20 }}>
                <Link href={`/admin/write?slug=${r.slug}`} style={{ textDecoration: "none" }}>{r.title}</Link>
                <span className={`pill ${r.published ? "on" : ""}`}>{r.published ? "공개" : "초안"}</span>
              </h3>
              <span className="mono" style={{ fontSize: 12, color: "var(--ink2)" }}>{new Date(r.updated_at).toLocaleString("ko-KR")}</span>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 13.5 }}>
              <Link href={`/admin/write?slug=${r.slug}`} className="link">수정</Link>
              {r.published && <Link href={`/blog/${r.slug}`} className="link" target="_blank">보기</Link>}
              <button className="lnk" onClick={() => toggle(r)}>{r.published ? "비공개로" : "공개로"}</button>
              <button className="lnk danger" onClick={() => remove(r.slug)}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
