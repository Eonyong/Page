// 글 본문 글꼴 선택지 (Google Fonts). key는 DB posts.font에 저장됨.
export const FONTS: { key: string; label: string; family: string; kind: "serif" | "sans" }[] = [
  { key: "myeongjo", label: "나눔명조", family: '"Nanum Myeongjo", serif', kind: "serif" },
  { key: "gowun-batang", label: "고운바탕", family: '"Gowun Batang", serif', kind: "serif" },
  { key: "noto-serif", label: "본명조 (Noto Serif KR)", family: '"Noto Serif KR", serif', kind: "serif" },
  { key: "noto-sans", label: "본고딕 (Noto Sans KR)", family: '"Noto Sans KR", sans-serif', kind: "sans" },
  { key: "gowun-dodum", label: "고운돋움", family: '"Gowun Dodum", sans-serif', kind: "sans" },
  { key: "plex", label: "IBM Plex Sans KR", family: '"IBM Plex Sans KR", sans-serif', kind: "sans" },
  { key: "nanum-gothic", label: "나눔고딕", family: '"Nanum Gothic", sans-serif', kind: "sans" },
];
export const DEFAULT_FONT = "noto-sans";
export function fontFamily(key?: string | null) { return (FONTS.find((f) => f.key === key) ?? FONTS.find((f) => f.key === DEFAULT_FONT)!).family; }
export const FONT_LINK = "https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&family=Noto+Sans+KR:wght@400;500;700&family=JetBrains+Mono:wght@400;500&family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&family=Noto+Serif+KR:wght@400;600&family=IBM+Plex+Sans+KR:wght@400;500;600&family=Nanum+Gothic:wght@400;700&display=swap";
