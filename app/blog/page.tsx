"use client";
import Link from "next/link";
import { useBlogList } from "@/hooks/api/blog";

export default function BlogPage() {
  const { data, isLoading, error } = useBlogList({});
  const posts = data?.items ?? [];

  return (
    <main className="container" style={{ padding: "32px 0" }}>
      <Link href="/" style={{ fontSize: 13, color: "var(--ink-500)" }}>← Trang chủ</Link>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 12 }}>Tin tức & hướng dẫn</h1>
      {error && (
        <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 12 }}>Không tải được bài viết.</div>
      )}
      {isLoading && (
        <div style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 12 }}>Đang tải...</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginTop: 24 }}>
        {posts.map(p => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card" style={{ overflow: "hidden", textDecoration: "none", color: "inherit" }}>
            <div style={{ height: 140, background: "linear-gradient(135deg, var(--green-200), var(--green-500))" }} />
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: "var(--green-700)", fontWeight: 600 }}>{p.category}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: "var(--ink-600)", marginTop: 8 }}>{p.excerpt}</p>
              <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 12 }}>
                {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("vi-VN") : ""}
                {p.readTime ? ` · ${p.readTime} phút đọc` : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
