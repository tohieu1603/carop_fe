"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/types/api";

interface Props {
  roles?: Role[];
  fallback?: React.ReactNode;
  redirectTo?: string;
  children: React.ReactNode;
}

export function RequireRole({ roles, fallback, redirectTo = "/login", children }: Props) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace(redirectTo);
  }, [hydrated, user, router, redirectTo]);

  if (!hydrated) {
    return <div style={{ padding: 24, color: "var(--ink-500)", fontSize: 14 }}>Đang tải…</div>;
  }
  if (!user) return null;
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return (
      fallback ?? (
        <div style={{ padding: 32, textAlign: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Không đủ quyền</h2>
          <p style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 8 }}>
            Trang này yêu cầu quyền: {roles.join(", ")}.
          </p>
        </div>
      )
    );
  }
  return <>{children}</>;
}

export function HasRole({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  if (!user || !roles.includes(user.role)) return null;
  return <>{children}</>;
}
