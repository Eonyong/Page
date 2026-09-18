import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// 1회용 스키마 초기화: POST /api/setup (x-admin-key 필요). 여러 번 실행해도 안전(IF NOT EXISTS).
export async function POST(req: Request) {
  if (!process.env.ADMIN_KEY || req.headers.get("x-admin-key") !== process.env.ADMIN_KEY) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 503 });
  const sql = neon(process.env.DATABASE_URL);
  await sql`CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, summary TEXT, body_md TEXT NOT NULL,
    cover_url TEXT, tags TEXT[] DEFAULT '{}', published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now())`;
  await sql`CREATE INDEX IF NOT EXISTS posts_published_idx ON posts (published, created_at DESC)`;
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM posts`;
  return NextResponse.json({ ok: true, posts: count });
}

// GET: 상태 확인 (키 불필요) — DB 연결 여부와 테이블 존재 여부만 알려줌
export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json({ db: false, table: false });
  try {
    const rows = await neon(process.env.DATABASE_URL)`SELECT to_regclass('public.posts') IS NOT NULL AS ok`;
    return NextResponse.json({ db: true, table: Boolean(rows[0]?.ok) });
  } catch (e) { return NextResponse.json({ db: true, table: false, error: (e as Error).message }, { status: 500 }); }
}
