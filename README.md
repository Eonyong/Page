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

## 글쓰기 화면
- `/admin` → ADMIN_KEY 입력 → 글 목록(초안/공개, 수정·삭제·공개 전환)
- `/admin/write` → velog 스타일 분할 에디터 (왼쪽 마크다운, 오른쪽 실시간 미리보기) → 임시저장 / 출간하기(요약·대표 이미지·슬러그 설정)

## 구글 애드센스
Vercel 환경변수만 넣으면 됩니다 (없으면 광고 코드 자체가 렌더되지 않음).
| 변수 | 값 | 비고 |
|---|---|---|
| `NEXT_PUBLIC_ADSENSE_CLIENT` | `ca-pub-XXXXXXXXXXXXXXXX` | 애드센스 계정 → 사이트 코드에 있는 client 값. 설정 시 전 페이지에 스크립트 삽입 |
| `NEXT_PUBLIC_ADSENSE_SLOT_POST` | 광고 단위 ID (숫자) | 글 본문 하단 광고 |
| `NEXT_PUBLIC_ADSENSE_SLOT_LIST` | 광고 단위 ID (숫자) | 블로그 목록 하단 광고 |
| `ADSENSE_PUBLISHER_ID` | `pub-XXXXXXXXXXXXXXXX` | `/ads.txt` 자동 제공 (생략 시 CLIENT에서 유추) |

다른 위치에 광고를 넣으려면 `import { AdSlot } from "@/components/ads"` 후 `<AdSlot slot="…" />`.

## 일정 캘린더 (관리자 전용)
- `/admin/calendar` — 월간 달력 + 오른쪽 일정 목록. 날짜 더블클릭으로 추가, 일정 클릭으로 수정/삭제. 알림(분 단위) 설정 가능.
- 휴대폰 연동: 화면의 "휴대폰 캘린더에 연동" → 구독 주소(`/api/calendar.ics?token=…`)를 구글/애플 캘린더에 구독 추가. 토큰은 ADMIN_KEY에서 파생되며 `CALENDAR_TOKEN` 환경변수로 바꿀 수 있음(바꾸면 재구독 필요).
