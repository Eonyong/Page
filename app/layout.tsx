import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import { FONT_LINK } from "@/lib/fonts";

const ADSENSE = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")),
  title: { default: "pacho · 자동화 스튜디오", template: "%s · pacho" },
  description: "차량 임베디드 SW 현장의 CI/CD/CT 구축, Python 자동화, 현황 대시보드 작업 일지와 문의처",
  openGraph: { title: "pacho · 자동화 스튜디오", description: "CI/CD/CT 구축 · Python 자동화 · 대시보드 — 작업 일지", images: ["/assets/og.jpg"], type: "website" },
  icons: { icon: [{ url: "/favicon.ico" }, { url: "/icon.svg", type: "image/svg+xml" }, { url: "/assets/favicon.png", sizes: "512x512", type: "image/png" }], apple: "/apple-touch-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONT_LINK} rel="stylesheet" />
      </head>
      <body>
        {ADSENSE && (
          <Script async strategy="afterInteractive" crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE}`} />
        )}
        <aside className="rail" aria-label="바로가기">
          <span className="burger" aria-hidden="true"><i /><i /><i /></span>
          <nav className="soc">
            <a href="https://blog.naver.com/pacho_" target="_blank" rel="noopener">Blog</a>
            <a href="https://github.com/Eonyong" target="_blank" rel="noopener">GitHub</a>
            <a href="mailto:eyjeong1202@gmail.com">Mail</a>
          </nav>
        </aside>
        <header className="wrap header">
          <Link href="/" style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-.02em", textDecoration: "none" }}>
            pacho<span style={{ color: "var(--ink2)" }}>.</span>
          </Link>
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/#logs">작업 일지</Link>
            <Link href="/#work">서비스</Link>
            <Link href="/#how">진행 순서</Link>
            <Link href="/blog">블로그</Link>
          </nav>
          <Link href="/#contact" className="btn-primary" style={{ padding: "12px 22px" }}>프로젝트 문의</Link>
        </header>
        <div className="wrap rule" />
        {children}
        <footer className="wrap footer">
          <span>© 2026 정언용 · Embedded / DevOps automation · Seoul</span>
          <span>static · no tracking</span>
        </footer>
      </body>
    </html>
  );
}
