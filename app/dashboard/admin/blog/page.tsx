"use client";

import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable } from "@/components/dashboard/DataTable";
import { RequireRole } from "@/components/RequireRole";
import { useAdminDeleteBlog, useBlogList } from "@/hooks/api/blog";

export default function AdminBlogPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const list = useBlogList({ limit: 20 });
  const del = useAdminDeleteBlog();
  return (
    <>
      <PageHeader
        title="Bài viết"
        actions={
          <Link href="/dashboard/admin/blog/new" className="btn btn-primary btn-sm">
            + Bài mới
          </Link>
        }
      />
      <DataTable
        rows={list.data?.items}
        rowKey={(r) => r.id}
        isLoading={list.isLoading}
        columns={[
          { key: "title", header: "Tiêu đề", render: (r) => r.title },
          { key: "slug", header: "Slug", render: (r) => <span className="mono">{r.slug}</span> },
          { key: "cat", header: "Danh mục", render: (r) => r.category || "—" },
          { key: "feat", header: "Featured", render: (r) => (r.featured ? "✓" : "—") },
          { key: "pub", header: "Publish", render: (r) => r.publishedAt?.slice(0, 10) || "DRAFT" },
          {
            key: "act",
            header: "",
            render: (r) => (
              <div style={{ display: "flex", gap: 6 }}>
                <Link href={`/blog/${r.slug}`} className="btn btn-secondary btn-sm">
                  Xem
                </Link>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (confirm(`Xóa "${r.title}"?`)) del.mutate({ id: r.id });
                  }}
                >
                  Xóa
                </button>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
