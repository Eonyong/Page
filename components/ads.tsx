"use client";
import { useEffect } from "react";

// 애드센스 설정: Vercel 환경변수 NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
// 광고 단위 slot ID는 <AdSlot slot="1234567890" /> 로 전달 (애드센스 → 광고 → 광고 단위에서 발급)
const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export function adsEnabled() { return Boolean(CLIENT); }

export function AdSlot({ slot, format = "auto", style }: { slot?: string; format?: string; style?: React.CSSProperties }) {
  useEffect(() => {
    if (!CLIENT) return;
    try { ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle ||= []).push({}); } catch {}
  }, []);
  if (!CLIENT) return null;
  return (
    <ins className="adsbygoogle" style={{ display: "block", ...style }} data-ad-client={CLIENT}
      data-ad-slot={slot} data-ad-format={format} data-full-width-responsive="true" />
  );
}
