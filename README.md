# eonyong-site

정언용 포트폴리오 + 블로그. Next.js 15 (App Router), Vercel 배포, Neon Postgres.

## 로컬 실행
```bash
npm install
cp .env.example .env.local   # DATABASE_URL, ADMIN_KEY 채우기
npm run dev
```

## 블로그 DB 준비
1. Vercel 프로젝트 → Storage → Neon 연결 (DATABASE_URL 자동 주입)
2. Neon SQL Editor에서 `db/schema.sql` 실행
3. Vercel 환경변수에 `ADMIN_KEY` 추가 후 재배포

## 글 올리기
```bash
curl -X POST https://<도메인>/api/posts -H "x-admin-key: $ADMIN_KEY" -H "content-type: application/json" \
  -d '{"slug":"first-post","title":"첫 글","summary":"요약","body_md":"# 제목\n본문…","tags":["ci"],"published":true}'
```
같은 slug로 다시 보내면 수정됩니다. 본문은 마크다운(제목/목록/코드/이미지/링크).
