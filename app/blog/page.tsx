"use client";
import Link from "next/link";
import { useState } from "react";
import { useBlogList } from "@/hooks/api/blog";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

const CATEGORIES = ["Mua xe", "Ban xe", "Kiem dinh", "Phap ly", "Kinh nghiem"];

export default function BlogPage() {
  const [category, setCategory] = useState("");
  const featured = useBlogList({ featured: "true", limit: 3 });
  const all = useBlogList({ category: category || undefined, limit: 20 });
  const featuredPosts = featured.data?.items ?? [];
  const posts = all.data?.items ?? [];

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ padding: "32px 0 64px" }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--ink-500)" }}>← Trang chu</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 12 }}>Tin tuc & huong dan</h1>

        {/* Featured carousel */}
        {featuredPosts.length > 0 && (
          <div style={{ marginTop: 24, marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green-700)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
              Noi bat
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {featuredPosts.slice(0, 3).map((p, i) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="card"
                  style={{
                    overflow: "hidden",
                    textDecoration: "none",
                    color: "inherit",
                    gridColumn: i === 0 ? "span 2" : undefined,
                  }}
                >
                  <div style={{ height: i === 0 ? 200 : 140, background: `linear-gradient(135deg, var(--green-${300 + i * 100}), var(--green-700))`, position: "relative" }}>
                    <div style={{ position: "absolute", top: 10, left: 10, background: "var(--green-700)", color: "white", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
                      NOI BAT
                    </div>
                  </div>
                  <div style={{ padding: 16 }}>
                    {p.category && <div style={{ fontSize: 11, color: "var(--green-700)", fontWeight: 600 }}>{p.category}</div>}
                    <h3 style={{ fontSize: i === 0 ? 18 : 15, fontWeight: 700, marginTop: 6, marginBottom: 0 }}>{p.title}</h3>
                    {p.excerpt && <p style={{ fontSize: 13, color: "var(--ink-600)", marginTop: 6, marginBottom: 0 }}>{p.excerpt}</p>}
                    <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 10 }}>
                      {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("vi-VN") : ""}
                      {p.readTime ? ` · ${p.readTime} phut doc` : ""}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <button
            onClick={() => setCategory("")}
            style={{ padding: "6px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600, border: "1px solid var(--border)", background: category === "" ? "var(--green-700)" : "white", color: category === "" ? "white" : "var(--ink-700)", cursor: "pointer" }}
          >
            Tat ca
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{ padding: "6px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600, border: "1px solid var(--border)", background: category === c ? "var(--green-700)" : "white", color: category === c ? "white" : "var(--ink-700)", cursor: "pointer" }}
            >
              {c}
            </button>
          ))}
        </div>

        {all.error && (
          <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 12 }}>Khong tai duoc bai viet.</div>
        )}
        {all.isLoading && (
          <div style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 12 }}>Dang tai...</div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {posts.map(p => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="card" style={{ overflow: "hidden", textDecoration: "none", color: "inherit" }}>
              <div style={{ height: 140, background: "linear-gradient(135deg, var(--green-200), var(--green-500))" }} />
              <div style={{ padding: 16 }}>
                {p.category && <div style={{ fontSize: 11, color: "var(--green-700)", fontWeight: 600 }}>{p.category}</div>}
                <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 6, marginBottom: 0 }}>{p.title}</h3>
                {p.excerpt && <p style={{ fontSize: 13, color: "var(--ink-600)", marginTop: 8, marginBottom: 0 }}>{p.excerpt}</p>}
                <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 12 }}>
                  {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("vi-VN") : ""}
                  {p.readTime ? ` · ${p.readTime} phut doc` : ""}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!all.isLoading && posts.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--ink-500)", padding: 40 }}>
            Chua co bai viet nao trong muc nay.
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
