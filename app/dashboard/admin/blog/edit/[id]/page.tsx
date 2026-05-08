"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireRole } from "@/components/RequireRole";
import { useAdminUpdateBlog, useBlogPostById } from "@/hooks/api/blog";
import { ApiError } from "@/lib/api/client";

const schema = z.object({
  title: z.string().min(5).max(200),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  content: z.string().min(1).max(200000),
  category: z.string().max(40).optional().or(z.literal("")),
  coverKey: z.string().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});
type Form = z.infer<typeof schema>;

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <Inner id={id} />
    </RequireRole>
  );
}

function Inner({ id }: { id: string }) {
  const router = useRouter();
  const update = useAdminUpdateBlog();
  const { post, isLoading } = useBlogPostById(id);
  const form = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { title: "", content: "" } });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        category: post.category || "",
        coverKey: post.coverKey || "",
        featured: post.featured,
        published: !!post.publishedAt,
      });
    }
  }, [post, form]);

  if (isLoading) return <div style={{ padding: 32, color: "var(--ink-500)" }}>Đang tải…</div>;
  if (!post) return <div style={{ padding: 32, color: "var(--red-600)" }}>Không tìm thấy bài viết.</div>;

  return (
    <>
      <PageHeader title={`Chỉnh sửa: ${post.title}`} />
      <form
        onSubmit={form.handleSubmit(async (v) => {
          try {
            await update.mutateAsync({
              id,
              body: {
                title: v.title,
                content: v.content,
                excerpt: v.excerpt || undefined,
                category: v.category || undefined,
                coverKey: v.coverKey || undefined,
                featured: v.featured,
                published: v.published,
              },
            });
            router.push("/dashboard/admin/blog");
          } catch (e) {
            const msg = e instanceof ApiError ? e.message : "Lỗi";
            form.setError("title", { message: msg });
          }
        })}
        className="card"
        style={{ padding: 20, display: "grid", gap: 12, maxWidth: 880 }}
      >
        <Field label="Tiêu đề" error={form.formState.errors.title?.message}>
          <input className="input" {...form.register("title")} />
        </Field>
        <Field label="Tóm tắt" error={form.formState.errors.excerpt?.message}>
          <input className="input" {...form.register("excerpt")} />
        </Field>
        <Field label="Danh mục" error={form.formState.errors.category?.message}>
          <input className="input" {...form.register("category")} />
        </Field>
        <Field label="Cover key (S3)" error={form.formState.errors.coverKey?.message}>
          <input className="input" placeholder="blog/202605/01HXY...jpg" {...form.register("coverKey")} />
        </Field>
        <Field label="Nội dung (markdown)" error={form.formState.errors.content?.message}>
          <textarea className="input" rows={14} {...form.register("content")} />
        </Field>
        <div style={{ display: "flex", gap: 16 }}>
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
            <input type="checkbox" {...form.register("featured")} /> Featured
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
            <input type="checkbox" {...form.register("published")} /> Xuất bản
          </label>
        </div>
        <div>
          <button className="btn btn-primary" type="submit" disabled={update.isPending}>
            {update.isPending ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error ? <div style={{ color: "var(--red-600)", fontSize: 12, marginTop: 4 }}>{error}</div> : null}
    </div>
  );
}
