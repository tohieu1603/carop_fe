"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RequireRole } from "@/components/RequireRole";
import { useAdminFunnel, useAdminSummary } from "@/hooks/api/admin";
import { formatVNDShort } from "@/lib/format-bigint";

export default function AdminStatsPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const summary = useAdminSummary(range);
  const today = new Date().toISOString().slice(0, 10);
  const past = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const funnel = useAdminFunnel(past, today);
  return (
    <>
      <PageHeader
        title="Báo cáo KPI"
        actions={
          <select className="input" value={range} onChange={(e) => setRange(e.target.value as "7d" | "30d" | "90d")}>
            <option value="7d">7 ngày</option>
            <option value="30d">30 ngày</option>
            <option value="90d">90 ngày</option>
          </select>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <KPI title="GMV tiềm năng" value={formatVNDShort(summary.data?.gmvPotential)} loading={summary.isLoading} />
        <KPI title="GMV thực hiện" value={formatVNDShort(summary.data?.gmvRealized)} loading={summary.isLoading} />
        <KPI title="Số listing" value={String(summary.data?.listingsCount ?? "—")} loading={summary.isLoading} />
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32 }}>Phễu chuyển đổi (30 ngày)</h2>
      <div className="card" style={{ padding: 16, marginTop: 8 }}>
        {funnel.isLoading ? (
          <div style={{ color: "var(--ink-500)" }}>Đang tải…</div>
        ) : !funnel.data?.length ? (
          <div style={{ color: "var(--ink-500)" }}>Chưa có dữ liệu.</div>
        ) : (
          <ol style={{ display: "grid", gap: 8, margin: 0, paddingLeft: 20 }}>
            {funnel.data.map((s, i) => (
              <li key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span>{s.name}</span>
                <span className="mono">{s.count.toLocaleString("vi-VN")}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}

function KPI({ title, value, loading }: { title: string; value: string; loading: boolean }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{title}</div>
      <div className="mono" style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
        {loading ? "…" : value}
      </div>
    </div>
  );
}
