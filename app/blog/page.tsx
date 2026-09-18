import Link from "next/link";
import { listPosts, hasDb } from "@/lib/db";
import { Arrow } from "@/components/logs";

export const dynamic = "force-dynamic";
export const metadata = { title: "블로그" };

export default async function BlogIndex() {
  const posts = await listPosts();
  return (
    <main className="wrap" style={{ paddingBlock: "48px 72px" }}>
      <div className="eyebrow">Notes</div>
      <h1 className="h2" style={{ marginTop: 12 }}>블로그</h1>
      <p className="body" style={{ margin: "10px 0 32px", maxWidth: "40em" }}>CI/CT, 자동화 스크립트, 임베디드 도구를 다루며 남긴 기록입니다.</p>
      {posts.length === 0 ? (
        <div className="letter">
          <div>
            <h2 className="h3">{hasDb() ? "아직 올린 글이 없습니다." : "글 저장소를 준비하는 중입니다."}</h2>
            <p className="body" style={{ marginTop: 10 }}>그동안은 네이버 블로그에서 글을 보실 수 있습니다.</p>
          </div>
          <a className="arrow" href="https://blog.naver.com/pacho_" target="_blank" rel="noopener">blog.naver.com/pacho_ <Arrow /></a>
        </div>
      ) : (
        <div className="post-list">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="post-row">
              <time dateTime={p.created_at}>{new Date(p.created_at).toLocaleDateString("ko-KR")}</time>
              <div><h3>{p.title}</h3>{p.summary && <p>{p.summary}</p>}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
