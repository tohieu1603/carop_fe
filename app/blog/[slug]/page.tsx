"use client";
import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import { useBlogPost, useBlogList } from "@/hooks/api/blog";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, error } = useBlogPost(slug);

  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <main className="container" style={{ padding: "32px 0", maxWidth: 720 }}>
          <div style={{ color: "var(--ink-500)", fontSize: 14 }}>Dang tai...</div>
        </main>
      </>
    );
  }

  if (error || !data) {
    notFound();
  }

  const post = data;

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ padding: "32px 0 64px", maxWidth: 760 }}>
        <Link href="/blog" style={{ fontSize: 13, color: "var(--ink-500)" }}>← Tin tuc</Link>

        {post.category && (
          <div style={{ fontSize: 12, color: "var(--green-700)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 16 }}>
            {post.category}
          </div>
        )}
        <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 8, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          {post.title}
        </h1>
        {post.excerpt && (
          <p style={{ fontSize: 18, color: "var(--ink-600)", marginTop: 12, lineHeight: 1.6 }}>{post.excerpt}</p>
        )}
        <div style={{ fontSize: 13, color: "var(--ink-400)", marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
          {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString("vi-VN")}</span>}
          {post.readTime && <><span>·</span><span>{post.readTime} phut doc</span></>}
        </div>

        {/* Cover */}
        <div style={{ height: 360, background: "linear-gradient(135deg, var(--green-200), var(--green-600))", borderRadius: 14, marginTop: 24 }} />

        {/* Content */}
        <div style={{ marginTop: 32 }}>
          {post.contentHtml ? (
            <div
              className="prose"
              style={{ fontSize: 17, lineHeight: 1.8, color: "var(--ink-700)" }}
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          ) : (
            <div style={{ fontSize: 17, lineHeight: 1.8, color: "var(--ink-700)" }}>
              {post.excerpt && <p>{post.excerpt}</p>}
              {post.content && <p style={{ marginTop: 16 }}>{post.content}</p>}
            </div>
          )}
        </div>

        {/* Related posts */}
        <RelatedPosts category={post.category} currentSlug={slug} />
      </main>
      <SiteFooter />
    </>
  );
}

function RelatedPosts({ category, currentSlug }: { category?: string; currentSlug: string }) {
  const q = useBlogList({ category: category || undefined, limit: 4 });
  const posts = (q.data?.items ?? []).filter((p) => p.slug !== currentSlug).slice(0, 3);

  if (!posts.length) return null;

  return (
    <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Bai viet lien quan</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="card"
            style={{ overflow: "hidden", textDecoration: "none", color: "inherit" }}
          >
            <div style={{ height: 100, background: "linear-gradient(135deg, var(--green-200), var(--green-400))" }} />
            <div style={{ padding: 12 }}>
              {p.category && <div style={{ fontSize: 10, color: "var(--green-700)", fontWeight: 600 }}>{p.category}</div>}
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{p.title}</div>
              <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 6 }}>
                {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("vi-VN") : ""}
                {p.readTime ? ` · ${p.readTime} phut` : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
