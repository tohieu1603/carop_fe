"use client";
import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import { useBlogPost } from "@/hooks/api/blog";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, error } = useBlogPost(slug);

  if (isLoading) {
    return (
      <main className="container" style={{ padding: "32px 0", maxWidth: 720 }}>
        <div style={{ color: "var(--ink-500)", fontSize: 14 }}>Đang tải...</div>
      </main>
    );
  }

  if (error || !data) {
    notFound();
  }

  const post = data;

  return (
    <main className="container" style={{ padding: "32px 0", maxWidth: 720 }}>
      <Link href="/blog" style={{ fontSize: 13, color: "var(--ink-500)" }}>← Tin tức</Link>
      <div style={{ fontSize: 12, color: "var(--green-700)", fontWeight: 600, marginTop: 16 }}>{post.category}</div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>{post.title}</h1>
      <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 8 }}>
        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("vi-VN") : ""}
        {post.readTime ? ` · ${post.readTime} phút đọc` : ""}
      </div>
      <div style={{ height: 320, background: "linear-gradient(135deg, var(--green-200), var(--green-500))", borderRadius: 12, marginTop: 24 }} />
      {post.contentHtml ? (
        <div
          style={{ fontSize: 17, lineHeight: 1.7, marginTop: 24, color: "var(--ink-700)" }}
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      ) : (
        <div style={{ fontSize: 17, lineHeight: 1.7, marginTop: 24, color: "var(--ink-700)" }}>
          <p>{post.excerpt}</p>
          {post.content && <p style={{ marginTop: 16 }}>{post.content}</p>}
        </div>
      )}
    </main>
  );
}
