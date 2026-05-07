"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useUserMe, useUpdateMe } from "@/hooks/api/users";
import { ApiError } from "@/lib/api/client";

const schema = z.object({
  fullName: z.string().min(2).max(80).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
});
type Form = z.infer<typeof schema>;

export default function ProfilePage() {
  const me = useUserMe();
  const update = useUpdateMe();
  const form = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { fullName: "", email: "" } });

  useEffect(() => {
    if (me.data?.user) form.reset({ fullName: me.data.user.fullName, email: me.data.user.email || "" });
  }, [me.data, form]);

  return (
    <>
      <PageHeader title="Hồ sơ cá nhân" subtitle={me.data?.user?.phone} />
      <form
        onSubmit={form.handleSubmit(async (v) => {
          try {
            await update.mutateAsync({ fullName: v.fullName || undefined, email: v.email || undefined });
          } catch (e) {
            const msg = e instanceof ApiError ? e.message : "Cập nhật thất bại";
            form.setError("email", { message: msg });
          }
        })}
        className="card"
        style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, maxWidth: 540 }}
      >
        <div>
          <label className="label">Họ và tên</label>
          <input className="input" {...form.register("fullName")} />
          {form.formState.errors.fullName && (
            <div style={{ color: "var(--red-600)", fontSize: 12 }}>{form.formState.errors.fullName.message}</div>
          )}
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <div style={{ color: "var(--red-600)", fontSize: 12 }}>{form.formState.errors.email.message}</div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" type="submit" disabled={update.isPending}>
            {update.isPending ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
          {update.isSuccess && (
            <span style={{ alignSelf: "center", fontSize: 13, color: "var(--green-700)" }}>Đã lưu ✓</span>
          )}
        </div>
      </form>
    </>
  );
}
