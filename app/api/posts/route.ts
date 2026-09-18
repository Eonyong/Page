import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// 글 작성/수정 API. 헤더 `x-admin-key`가 ADMIN_KEY와 같아야 동작.
// 예) curl -X POST https://<site>/api/posts -H "x-admin-key: $ADMIN_KEY" -H "content-type: application/json" \
//      -d '{"slug":"hello","title":"첫 글","body_md":"# 안녕하세요","published":true}'
export async function POST(req: Request) {
  const key = req.headers.get("x-admin-key");
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });
  const b = await req.json().catch(() => null);
  if (!b || typeof b.slug !== "string" || typeof b.title !== "string" || typeof b.body_md !== "string" || !/^[a-z0-9-]{1,80}$/.test(b.slug))
    return NextResponse.json({ error: "slug(a-z0-9-), title, body_md 필요" }, { status: 400 });
  const sql = neon(process.env.DATABASE_URL);
  const tags: string[] = Array.isArray(b.tags) ? b.tags.filter((t: unknown) => typeof t === "string") : [];
  const rows = await sql`
    INSERT INTO posts (slug, title, summary, body_md, cover_url, tags, published)
    VALUES (${b.slug}, ${b.title}, ${b.summary ?? null}, ${b.body_md}, ${b.cover_url ?? null}, ${tags}, ${Boolean(b.published)})
    ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, body_md = EXCLUDED.body_md,
      cover_url = EXCLUDED.cover_url, tags = EXCLUDED.tags, published = EXCLUDED.published, updated_at = now()
    RETURNING id, slug, published`;
  return NextResponse.json(rows[0]);
}
