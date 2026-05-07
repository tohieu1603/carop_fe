"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Suspense, useEffect, useState } from "react";

import { useLogin, useRegister, useVerifyOtp } from "@/hooks/api/auth";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api/client";

const loginSchema = z.object({
  phone: z.string().regex(/^84\d{9}$/, "Phone phải có dạng 84xxxxxxxxx"),
  password: z.string().min(8, "Tối thiểu 8 ký tự"),
});
type LoginForm = z.infer<typeof loginSchema>;

const registerSchema = z.object({
  phone: z.string().regex(/^84\d{9}$/, "Phone phải có dạng 84xxxxxxxxx"),
  password: z
    .string()
    .min(8, "Tối thiểu 8 ký tự")
    .regex(/(?=.*[A-Za-z])(?=.*\d)/, "Cần ít nhất 1 chữ và 1 số"),
  fullName: z.string().min(2).max(80),
});
type RegisterForm = z.infer<typeof registerSchema>;

const otpSchema = z.object({ phone: z.string(), otp: z.string().regex(/^\d{6}$/, "OTP gồm 6 số") });
type OtpForm = z.infer<typeof otpSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={<main style={{ padding: 32 }}>Đang tải…</main>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [otpPhase, setOtpPhase] = useState<{ phone: string; hint?: string } | null>(null);

  useEffect(() => {
    if (hydrated && user) router.replace(next);
  }, [hydrated, user, router, next]);

  const login = useLogin();
  const register = useRegister();
  const verifyOtp = useVerifyOtp();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { phone: "", password: "" } });
  const regForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { phone: "", password: "", fullName: "" },
  });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema), defaultValues: { phone: "", otp: "" } });

  return (
    <main className="container" style={{ padding: "64px 0", maxWidth: 420 }}>
      <Link href="/" style={{ fontSize: 13, color: "var(--ink-500)" }}>
        ← Trang chủ
      </Link>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 16 }}>
        {otpPhase ? "Xác thực OTP" : tab === "login" ? "Đăng nhập" : "Đăng ký"}
      </h1>

      {!otpPhase && (
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            type="button"
            className={tab === "login" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            onClick={() => setTab("login")}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={tab === "register" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            onClick={() => setTab("register")}
          >
            Đăng ký
          </button>
        </div>
      )}

      {otpPhase ? (
        <form
          onSubmit={otpForm.handleSubmit(async (v) => {
            try {
              await verifyOtp.mutateAsync({ phone: otpPhase.phone, otp: v.otp });
              router.replace(next);
            } catch (e) {
              const msg = e instanceof ApiError ? e.message : "Sai OTP";
              otpForm.setError("otp", { message: msg });
            }
          })}
          style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}
        >
          <div style={{ fontSize: 13, color: "var(--ink-500)" }}>
            Đã gửi OTP tới <b>{otpPhase.phone}</b>
            {otpPhase.hint ? ` (DEV: ${otpPhase.hint})` : ""}
          </div>
          <Field label="Mã OTP" error={otpForm.formState.errors.otp?.message}>
            <input className="input" inputMode="numeric" maxLength={6} {...otpForm.register("otp")} />
          </Field>
          <button type="submit" className="btn btn-primary btn-lg" disabled={verifyOtp.isPending}>
            {verifyOtp.isPending ? "Đang xác thực…" : "Xác thực"}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOtpPhase(null)}>
            Quay lại
          </button>
        </form>
      ) : tab === "login" ? (
        <form
          onSubmit={loginForm.handleSubmit(async (v) => {
            try {
              await login.mutateAsync(v);
              router.replace(next);
            } catch (e) {
              const msg = e instanceof ApiError ? e.message : "Lỗi đăng nhập";
              loginForm.setError("password", { message: msg });
            }
          })}
          style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}
        >
          <Field label="Số điện thoại (84xxxxxxxxx)" error={loginForm.formState.errors.phone?.message}>
            <input className="input" placeholder="84901234567" {...loginForm.register("phone")} />
          </Field>
          <Field label="Mật khẩu" error={loginForm.formState.errors.password?.message}>
            <input className="input" type="password" {...loginForm.register("password")} />
          </Field>
          <button type="submit" className="btn btn-primary btn-lg" disabled={login.isPending}>
            {login.isPending ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={regForm.handleSubmit(async (v) => {
            try {
              const r = await register.mutateAsync(v);
              setOtpPhase({ phone: v.phone, hint: r.otpDevHint });
              otpForm.reset({ phone: v.phone, otp: "" });
            } catch (e) {
              const msg = e instanceof ApiError ? e.message : "Lỗi đăng ký";
              regForm.setError("phone", { message: msg });
            }
          })}
          style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}
        >
          <Field label="Họ và tên" error={regForm.formState.errors.fullName?.message}>
            <input className="input" {...regForm.register("fullName")} />
          </Field>
          <Field label="Số điện thoại (84xxxxxxxxx)" error={regForm.formState.errors.phone?.message}>
            <input className="input" placeholder="84901234567" {...regForm.register("phone")} />
          </Field>
          <Field label="Mật khẩu" error={regForm.formState.errors.password?.message}>
            <input className="input" type="password" {...regForm.register("password")} />
          </Field>
          <button type="submit" className="btn btn-primary btn-lg" disabled={register.isPending}>
            {register.isPending ? "Đang gửi…" : "Đăng ký"}
          </button>
        </form>
      )}
    </main>
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
