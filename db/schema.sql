-- 블로그 글 테이블 (Neon SQL Editor에서 1회 실행)
CREATE TABLE IF NOT EXISTS posts (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  summary     TEXT,
  body_md     TEXT NOT NULL,
  cover_url   TEXT,
  tags        TEXT[] DEFAULT '{}',
  published   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts (published, created_at DESC);
