"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, getKey } from "@/lib/admin-client";
import { renderMarkdown } from "@/lib/md";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9가-힣\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

function Editor() {
  const router = useRouter();
  const params = useSearchParams();
  const editing = params.get("slug");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [summary, setSummary] = useState("");
  const [cover, setCover] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-editor", "1");
    return () => document.documentElement.removeAttribute("data-editor");
  }, []);

  useEffect(() => {
    if (!getKey()) { router.replace("/admin"); return; }
    if (!editing) return;
    api(`/api/posts?slug=${editing}`).then((p) => {
      setTitle(p.title); setSlug(p.slug); setSlugTouched(true); setTags(p.tags ?? []); setSummary(p.summary ?? "");
      setCover(p.cover_url ?? ""); setBody(p.body_md); setPublished(p.published);
    }).catch((e) => setStatus((e as Error).message));
  }, [editing, router]);

  useEffect(() => { if (!slugTouched) setSlug(slugify(title)); }, [title, slugTouched]);

  const html = useMemo(() => renderMarkdown(body), [body]);
  const validSlug = /^[a-z0-9-]{1,80}$/.test(slug);

  function addTag(raw: string) {
    const t = raw.trim().replace(/,$/, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }
  function wrap(before: string, after = before) {
    const el = ta.current; if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const sel = body.slice(s, e) || "텍스트";
    const next = body.slice(0, s) + before + sel + after + body.slice(e);
    setBody(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + sel.length); });
  }
  function linePrefix(prefix: string) {
    const el = ta.current; if (!el) return;
    const s = el.selectionStart;
    const lineStart = body.lastIndexOf("\n", s - 1) + 1;
    setBody(body.slice(0, lineStart) + prefix + body.slice(lineStart));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + prefix.length, s + prefix.length); });
  }
  async function save(publish: boolean) {
    if (!title.trim() || !body.trim()) { setStatus("제목과 본문을 입력하세요."); return; }
    if (!validSlug) { setStatus("URL 슬러그는 영문 소문자·숫자·하이픈만 가능합니다."); return; }
    setBusy(true); setStatus("");
    try {
      await api("/api/posts", { method: "POST", body: JSON.stringify({ slug, title: title.trim(), summary: summary.trim() || null, body_md: body, cover_url: cover.trim() || null, tags, published: publish }) });
      setPublished(publish); setShowPublish(false);
      setStatus(publish ? "출간했습니다." : "임시 저장했습니다.");
      if (!editing) router.replace(`/admin/write?slug=${slug}`);
    } catch (e) { setStatus((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="ed">
      <div className="ed-pane ed-left">
        <input id="post-title" className="ed-title" placeholder="제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="ed-bar" />
        <div className="ed-tags">
          {tags.map((t) => <button key={t} className="tag" onClick={() => setTags(tags.filter((x) => x !== t))} title="클릭하면 제거">{t}</button>)}
          <input id="post-tags" className="ed-taginput" placeholder="태그를 입력하세요 (Enter)" value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } if (e.key === "Backspace" && !tagInput && tags.length) setTags(tags.slice(0, -1)); }} />
        </div>
        <div className="ed-tools">
          <button onClick={() => linePrefix("# ")}>H1</button><button onClick={() => linePrefix("## ")}>H2</button><button onClick={() => linePrefix("### ")}>H3</button>
          <span className="sep" />
          <button onClick={() => wrap("**")}><b>B</b></button><button onClick={() => wrap("`")}>{"<>"}</button>
          <span className="sep" />
          <button onClick={() => linePrefix("- ")}>목록</button><button onClick={() => wrap("```\n", "\n```")}>코드</button>
          <button onClick={() => wrap("[", "](https://)")}>링크</button><button onClick={() => wrap("![", "](https://)")}>이미지</button>
        </div>
        <textarea id="post-body" ref={ta} className="ed-body" placeholder="당신의 이야기를 적어보세요... (마크다운 지원)" value={body} onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Tab") { e.preventDefault(); wrap("  ", ""); } }} />
        <div className="ed-foot">
          <button className="btn-ghost" onClick={() => router.push("/admin")}>← 나가기</button>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {status && <span className="mono" style={{ fontSize: 12, color: "var(--ink2)" }}>{status}</span>}
            <button className="btn-ghost" disabled={busy} onClick={() => save(false)}>임시저장</button>
            <button className="btn-primary" disabled={busy} onClick={() => setShowPublish(true)}>{published ? "수정 출간" : "출간하기"}</button>
          </div>
        </div>
      </div>
      <div className="ed-pane ed-right">
        <h1 className="ed-prev-title">{title || "제목"}</h1>
        {tags.length > 0 && <div className="ed-prev-tags">{tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>}
        <article className="prose" dangerouslySetInnerHTML={{ __html: html || "<p style='color:var(--ink2)'>미리보기가 여기에 표시됩니다.</p>" }} />
      </div>

      {showPublish && (
        <div className="ed-modal" onClick={() => setShowPublish(false)}>
          <div className="ed-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="h3">출간 설정</h2>
            <label className="ed-lbl">요약 (목록·검색·공유에 표시)</label>
            <textarea id="post-summary" className="inp" rows={3} maxLength={150} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="글을 짧게 소개하세요" />
            <div className="mono" style={{ fontSize: 11, textAlign: "right", color: "var(--ink2)" }}>{summary.length}/150</div>
            <label className="ed-lbl">대표 이미지 URL (선택)</label>
            <input id="post-cover" className="inp" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="https://…/image.jpg" />
            {cover && <img src={cover} alt="" style={{ marginTop: 8, maxHeight: 140, objectFit: "cover", width: "100%", border: "1px solid var(--rule)" }} />}
            <label className="ed-lbl">URL 슬러그</label>
            <div className="ed-slug"><span className="mono">/blog/</span><input id="post-slug" className="inp mono" value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }} /></div>
            {!validSlug && <p className="body" style={{ color: "#B42318", fontSize: 13 }}>영문 소문자·숫자·하이픈만 사용할 수 있습니다.</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button className="btn-ghost" onClick={() => setShowPublish(false)}>취소</button>
              <button className="btn-primary" disabled={busy || !validSlug} onClick={() => save(true)}>출간하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WritePage() {
  return <Suspense fallback={null}><Editor /></Suspense>;
}
