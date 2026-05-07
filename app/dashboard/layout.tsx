"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { RequireRole } from "@/components/RequireRole";
import { useMe } from "@/hooks/api/auth";
import { useAuth } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);
  useMe({ enabled: hydrated && !!user });

  return (
    <RequireRole>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
        <Sidebar />
        <main style={{ padding: 32, background: "var(--bg-soft)" }}>{children}</main>
      </div>
    </RequireRole>
  );
}
