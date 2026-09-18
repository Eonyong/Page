// 구글 애드센스 ads.txt — 환경변수 ADSENSE_PUBLISHER_ID (예: pub-1234567890123456) 설정 시 제공
export function GET() {
  const pub = process.env.ADSENSE_PUBLISHER_ID ?? process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.replace(/^ca-/, "");
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : "";
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
