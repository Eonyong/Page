import { createHash } from "crypto";
// 구독 링크용 토큰: ADMIN_KEY에서 파생(ADMIN_KEY 자체는 URL에 노출하지 않음). CALENDAR_TOKEN 환경변수로 직접 지정도 가능.
export function calendarToken() {
  if (process.env.CALENDAR_TOKEN) return process.env.CALENDAR_TOKEN;
  if (!process.env.ADMIN_KEY) return null;
  return createHash("sha256").update("calendar:" + process.env.ADMIN_KEY).digest("hex").slice(0, 32);
}
