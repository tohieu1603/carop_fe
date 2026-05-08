"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useUserMe, useUpdateMe, useSubmitKyc } from "@/hooks/api/users";
import { useSignUpload, putToS3 } from "@/hooks/api/upload";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";

// -- Profile form --
const profileSchema = z.object({
  fullName: z.string().min(2).max(80).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
});
type ProfileForm = z.infer<typeof profileSchema>;

// -- Password change form --
const pwSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/(?=.*[A-Za-z])(?=.*\d)/, "Can chu va so"),
  otp: z.string().regex(/^\d{6}$/, "OTP gom 6 so"),
});
type PwForm = z.infer<typeof pwSchema>;

export default function ProfilePage() {
  const me = useUserMe();
  const user = me.data?.user;
  const [tab, setTab] = useState<"profile" | "password" | "kyc">("profile");

  return (
    <>
      <PageHeader title="Ho so ca nhan" subtitle={user?.phone} />

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {(["profile", "password", "kyc"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
              background: tab === t ? "var(--green-700)" : "white",
              color: tab === t ? "white" : "var(--ink-700)",
              border: "1px solid var(--border)", cursor: "pointer",
            }}
          >
            {t === "profile" ? "Thong tin" : t === "password" ? "Doi mat khau" : "KYC"}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab />}
      {tab === "password" && <PasswordTab />}
      {tab === "kyc" && <KycTab />}
    </>
  );
}

function ProfileTab() {
  const me = useUserMe();
  const update = useUpdateMe();
  const form = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), defaultValues: { fullName: "", email: "" } });

  useEffect(() => {
    if (me.data?.user) form.reset({ fullName: me.data.user.fullName, email: me.data.user.email || "" });
  }, [me.data, form]);

  return (
    <form
      onSubmit={form.handleSubmit(async (v) => {
        try {
          await update.mutateAsync({ fullName: v.fullName || undefined, email: v.email || undefined });
        } catch (e) {
          const msg = e instanceof ApiError ? e.message : "Cap nhat that bai";
          form.setError("email", { message: msg });
        }
      })}
      className="card"
      style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, maxWidth: 540 }}
    >
      <div>
        <label className="label">Ho va ten</label>
        <input className="input" {...form.register("fullName")} />
        {form.formState.errors.fullName && <ErrMsg msg={form.formState.errors.fullName.message!} />}
      </div>
      <div>
        <label className="label">Email</label>
        <input className="input" type="email" {...form.register("email")} />
        {form.formState.errors.email && <ErrMsg msg={form.formState.errors.email.message!} />}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className="btn btn-primary" type="submit" disabled={update.isPending}>
          {update.isPending ? "Dang luu..." : "Luu thay doi"}
        </button>
        {update.isSuccess && <span style={{ fontSize: 13, color: "var(--green-700)" }}>Da luu</span>}
      </div>
    </form>
  );
}

function PasswordTab() {
  const [otpRequested, setOtpRequested] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const form = useForm<PwForm>({ resolver: zodResolver(pwSchema), defaultValues: { currentPassword: "", newPassword: "", otp: "" } });

  const requestOtp = async () => {
    setRequestLoading(true);
    try {
      const res = await fetch("/api/auth/change-password/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("xengap.accessToken")}` },
      });
      const json = await res.json();
      if (json.ok) {
        setOtpRequested(true);
        if (json.data?.otpDevHint) alert(`DEV OTP: ${json.data.otpDevHint}`);
      } else {
        alert(json.error?.message || "Loi gui OTP");
      }
    } catch {
      alert("Loi ket noi");
    } finally {
      setRequestLoading(false);
    }
  };

  const onSubmit = async (v: PwForm) => {
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("xengap.accessToken")}` },
        body: JSON.stringify(v),
      });
      const json = await res.json();
      if (json.ok) {
        alert("Doi mat khau thanh cong. Vui long dang nhap lai.");
        form.reset();
        setOtpRequested(false);
      } else {
        form.setError("otp", { message: json.error?.message || "Loi" });
      }
    } catch {
      form.setError("otp", { message: "Loi ket noi" });
    }
  };

  return (
    <div className="card" style={{ padding: 24, maxWidth: 540 }}>
      <div style={{ fontSize: 13, color: "var(--ink-600)", marginBottom: 16 }}>
        Can OTP de doi mat khau. Buoc 1: Gui OTP ve so dien thoai.
      </div>
      {!otpRequested ? (
        <button className="btn btn-secondary" onClick={requestOtp} disabled={requestLoading}>
          {requestLoading ? "Dang gui..." : "Gui OTP ve SDT"}
        </button>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="label">Mat khau hien tai</label>
            <input className="input" type="password" {...form.register("currentPassword")} />
            {form.formState.errors.currentPassword && <ErrMsg msg={form.formState.errors.currentPassword.message!} />}
          </div>
          <div>
            <label className="label">Mat khau moi (8+ ky tu, co chu va so)</label>
            <input className="input" type="password" {...form.register("newPassword")} />
            {form.formState.errors.newPassword && <ErrMsg msg={form.formState.errors.newPassword.message!} />}
          </div>
          <div>
            <label className="label">OTP (6 so)</label>
            <input className="input" inputMode="numeric" maxLength={6} {...form.register("otp")} />
            {form.formState.errors.otp && <ErrMsg msg={form.formState.errors.otp.message!} />}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn btn-primary">Doi mat khau</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOtpRequested(false)}>Gui lai OTP</button>
          </div>
        </form>
      )}
    </div>
  );
}

function KycTab() {
  const me = useUserMe();
  const user = me.data?.user;
  const submitKyc = useSubmitKyc();
  const signUpload = useSignUpload();
  const authUser = useAuth((s) => s.user);

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const kycStatus = user?.kycStatus || authUser?.kycStatus;

  const uploadFile = async (file: File, folder: "kyc"): Promise<string> => {
    const signed = await signUpload.mutateAsync({ folder, mime: file.type, size: file.size });
    await putToS3(signed.url, file, signed.headers);
    return signed.key;
  };

  const handleSubmit = async () => {
    if (!frontFile || !backFile || !selfieFile) {
      alert("Vui long chon day du 3 anh (CCCD mat truoc, mat sau, selfie)");
      return;
    }
    setUploading(true);
    try {
      const [frontKey, backKey, selfieKey] = await Promise.all([
        uploadFile(frontFile, "kyc"),
        uploadFile(backFile, "kyc"),
        uploadFile(selfieFile, "kyc"),
      ]);
      await submitKyc.mutateAsync({ frontKey, backKey, selfieKey });
      setSuccess(true);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Loi nop KYC");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card" style={{ padding: 24, maxWidth: 540 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Trang thai KYC</div>
        <div style={{ marginTop: 8 }}>
          <span className={`badge badge-${kycStatus === "APPROVED" ? "green" : kycStatus === "REJECTED" ? "red" : kycStatus === "NONE" ? "neutral" : "amber"}`}>
            {kycStatus || "NONE"}
          </span>
        </div>
      </div>

      {kycStatus === "APPROVED" && (
        <div style={{ color: "var(--green-700)", fontSize: 13 }}>KYC da duoc duyet. Tai khoan day du quyen.</div>
      )}

      {kycStatus === "PENDING" && (
        <div style={{ color: "var(--amber-600)", fontSize: 13 }}>Ho so dang cho xet duyet. Vui long cho.</div>
      )}

      {(kycStatus === "NONE" || kycStatus === "REJECTED") && (
        <>
          {kycStatus === "REJECTED" && (
            <div style={{ color: "var(--red-600)", fontSize: 13, marginBottom: 12 }}>
              Ho so truoc da bi tu choi. Vui long nop lai.
            </div>
          )}

          {success ? (
            <div style={{ color: "var(--green-700)", fontSize: 13 }}>
              Nop KYC thanh cong! Chung toi se xet duyet trong 24h.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 13, color: "var(--ink-600)" }}>
                Can 3 anh: CCCD mat truoc, mat sau, va selfie cam CCCD.
              </div>
              <FileInput label="CCCD mat truoc" file={frontFile} onChange={setFrontFile} />
              <FileInput label="CCCD mat sau" file={backFile} onChange={setBackFile} />
              <FileInput label="Selfie cam CCCD" file={selfieFile} onChange={setSelfieFile} />
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={uploading || submitKyc.isPending}
              >
                {uploading ? "Dang tai len..." : submitKyc.isPending ? "Dang nop..." : "Nop ho so KYC"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FileInput({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="input"
        style={{ padding: "6px 8px", fontSize: 13 }}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {file && <div style={{ fontSize: 12, color: "var(--green-600)", marginTop: 4 }}>{file.name}</div>}
    </div>
  );
}

function ErrMsg({ msg }: { msg: string }) {
  return <div style={{ color: "var(--red-600)", fontSize: 12, marginTop: 4 }}>{msg}</div>;
}
