import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// 관리자 API. 모든 요청은 `x-admin-key` 헤더가 ADMIN_KEY와 같아야 동작.
function auth(req: Request) {
  const key = req.headers.get("x-admin-key");
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });
  return null;
}

// GET: 초안 포함 전체 목록 (관리 화면용). ?slug=xxx 면 단건.
export async function GET(req: Request) {
  const denied = auth(req); if (denied) return denied;
  const sql = neon(process.env.DATABASE_URL as string);
  const slug = new URL(req.url).searchParams.get("slug");
  if (slug) {
    const rows = await sql`SELECT * FROM posts WHERE slug = ${slug} LIMIT 1`;
    return rows[0] ? NextResponse.json(rows[0]) : NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const rows = await sql`SELECT id, slug, title, summary, tags, published, created_at, updated_at FROM posts ORDER BY updated_at DESC LIMIT 200`;
  return NextResponse.json(rows);
}

// POST: 생성/수정 (같은 slug면 덮어씀)
export async function POST(req: Request) {
  const denied = auth(req); if (denied) return denied;
  const b = await req.json().catch(() => null);
  if (!b || typeof b.slug !== "string" || typeof b.title !== "string" || typeof b.body_md !== "string" || !/^[a-z0-9-]{1,80}$/.test(b.slug))
    return NextResponse.json({ error: "slug(a-z0-9-), title, body_md 필요" }, { status: 400 });
  const sql = neon(process.env.DATABASE_URL as string);
  const tags: string[] = Array.isArray(b.tags) ? b.tags.filter((t: unknown) => typeof t === "string") : [];
  const font: string | null = typeof b.font === "string" && /^[a-z-]{1,30}$/.test(b.font) ? b.font : null;
  const rows = await sql`
    INSERT INTO posts (slug, title, summary, body_md, cover_url, tags, font, published)
    VALUES (${b.slug}, ${b.title}, ${b.summary ?? null}, ${b.body_md}, ${b.cover_url ?? null}, ${tags}, ${font}, ${Boolean(b.published)})
    ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, body_md = EXCLUDED.body_md,
      cover_url = EXCLUDED.cover_url, tags = EXCLUDED.tags, font = EXCLUDED.font, published = EXCLUDED.published, updated_at = now()
    RETURNING id, slug, published`;
  return NextResponse.json(rows[0]);
}

// DELETE: { slug }
export async function DELETE(req: Request) {
  const denied = auth(req); if (denied) return denied;
  const b = await req.json().catch(() => null);
  if (!b || typeof b.slug !== "string") return NextResponse.json({ error: "slug 필요" }, { status: 400 });
  const sql = neon(process.env.DATABASE_URL as string);
  await sql`DELETE FROM posts WHERE slug = ${b.slug}`;
  return NextResponse.json({ ok: true });
}
