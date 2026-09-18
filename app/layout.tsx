import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")),
  title: { default: "정언용 · 자동화 스튜디오", template: "%s · 정언용" },
  description: "차량 임베디드 SW 현장의 CI/CD/CT 구축, Python 자동화, 현황 대시보드 작업 일지와 문의처",
  openGraph: { title: "정언용 · 자동화 스튜디오", description: "CI/CD/CT 구축 · Python 자동화 · 대시보드 — 작업 일지", images: ["/assets/og.jpg"], type: "website" },
  icons: { icon: "/assets/favicon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&family=Noto+Sans+KR:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <header className="wrap header">
          <Link href="/" className="serif" style={{ fontWeight: 800, fontSize: 18, textDecoration: "none" }}>
            정언용 <span className="mono" style={{ fontWeight: 400, fontSize: 12, color: "var(--ink2)", marginLeft: 6 }}>automation · ci/ct</span>
          </Link>
          <nav className="nav">
            <Link href="/#logs">작업 일지</Link>
            <Link href="/#work">맡길 수 있는 일</Link>
            <Link href="/#how">진행 순서</Link>
            <Link href="/blog">블로그</Link>
            <Link href="/#contact">문의</Link>
          </nav>
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
