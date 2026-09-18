import { neon } from "@neondatabase/serverless";

export type Post = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  body_md: string;
  cover_url: string | null;
  tags: string[];
  created_at: string;
};

export function hasDb() {
  return Boolean(process.env.DATABASE_URL);
}

function sql() {
  return neon(process.env.DATABASE_URL as string);
}

export async function listPosts(): Promise<Post[]> {
  if (!hasDb()) return [];
  const rows = await sql()`
    SELECT id, slug, title, summary, body_md, cover_url, tags, created_at
    FROM posts WHERE published = true ORDER BY created_at DESC LIMIT 50`;
  return rows as Post[];
}

export async function getPost(slug: string): Promise<Post | null> {
  if (!hasDb()) return null;
  const rows = await sql()`
    SELECT id, slug, title, summary, body_md, cover_url, tags, created_at
    FROM posts WHERE slug = ${slug} AND published = true LIMIT 1`;
  return (rows[0] as Post) ?? null;
}
