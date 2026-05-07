"use client";
import { useAdminSummary, useAdminFunnel } from "@/hooks/api/admin";
import { formatVNDShort } from "@/lib/format";

// Use a fixed recent 30-day range for funnel
const today = new Date();
const from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
const FROM = from.toISOString().split("T")[0];
const TO = today.toISOString().split("T")[0];

export default function AdminReportsPage() {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useAdminSummary("30d");
  const { data: funnel, isLoading: funnelLoading } = useAdminFunnel(FROM, TO);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Báo cáo</h1>
      {summaryError && (
        <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 16 }}>Không tải được dữ liệu.</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Tổng tin đăng</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
            {summaryLoading ? "..." : summary?.listingsCount ?? 0}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Tổng offers</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
            {summaryLoading ? "..." : summary?.offersCount ?? 0}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: "var(--ink-500)" }}>GMV tiềm năng</div>
          <div className="mono" style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
            {summaryLoading ? "..." : formatVNDShort(Number(summary?.gmvPotential ?? 0))}
          </div>
        </div>
      </div>

      {/* Funnel */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 40, marginBottom: 16 }}>Phễu chuyển đổi (30 ngày)</h2>
      {funnelLoading && <div style={{ color: "var(--ink-500)", fontSize: 14 }}>Đang tải...</div>}
      {funnel?.steps && funnel.steps.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {funnel.steps.map(step => (
            <div key={step.name} className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{step.name}</div>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{step.count}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
