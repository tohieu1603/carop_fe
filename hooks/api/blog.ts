"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { BlogPost, PageResult } from "@/types/api";

export interface BlogListQuery {
  category?: string;
  featured?: "true" | "false" | "1" | "0";
  q?: string;
  cursor?: string;
  limit?: number;
}

export interface CreateBlogDto {
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  coverKey?: string;
  featured?: boolean;
  published?: boolean;
  slug?: string;
}

const KEYS = {
  list: (q: BlogListQuery) => ["blog", "list", q] as const,
  detail: (slug: string) => ["blog", "detail", slug] as const,
};

// GET /api/blog
export function useBlogList(query: BlogListQuery = {}) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn: () => api.get<PageResult<BlogPost>>("/api/blog", query as Record<string, unknown>),
  });
}

// GET /api/blog/:slug
export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: KEYS.detail(slug ?? ""),
    enabled: !!slug,
    queryFn: () => api.get<BlogPost & { content: string; contentHtml: string }>(`/api/blog/${slug}`),
  });
}

// POST /api/admin/blog
export function useAdminCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBlogDto) => api.post<{ post: BlogPost }>("/api/admin/blog", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog"] }),
  });
}

// PATCH /api/admin/blog/:id
export function useAdminUpdateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Omit<CreateBlogDto, "slug">> }) =>
      api.patch<{ post: BlogPost }>(`/api/admin/blog/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog"] }),
  });
}

// DELETE /api/admin/blog/:id
export function useAdminDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => api.del<{ deleted: true }>(`/api/admin/blog/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog"] }),
  });
}
