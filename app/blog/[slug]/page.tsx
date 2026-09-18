import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost } from "@/lib/db";
import { renderMarkdown } from "@/lib/md";
import { AdSlot } from "@/components/ads";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return (
    <main className="wrap" style={{ paddingBlock: "48px 72px" }}>
      <Link href="/blog" className="link" style={{ fontSize: 14 }}>← 블로그</Link>
      <div className="mono" style={{ fontSize: 12.5, color: "var(--ink2)", marginTop: 28 }}>
        {new Date(post.created_at).toLocaleDateString("ko-KR")}{post.tags?.length ? ` · ${post.tags.join(" · ")}` : ""}
      </div>
      <h1 className="h2" style={{ marginTop: 10 }}>{post.title}</h1>
      {post.summary && <p className="lede" style={{ marginTop: 14 }}>{post.summary}</p>}
      {post.cover_url && <div className="frame" style={{ marginTop: 28 }}><img className="photo" src={post.cover_url} alt="" /></div>}
      <article className="prose" style={{ marginTop: 32 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body_md) }} />
      <div style={{ marginTop: 40, maxWidth: "70ch" }}><AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_POST} /></div>
    </main>
  );
}
