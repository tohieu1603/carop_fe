"use client";
import { useAdminSummary } from "@/hooks/api/admin";
import { formatVNDShort } from "@/lib/format";

export default function AdminDashPage() {
  const { data, isLoading, error } = useAdminSummary("30d");

  if (error) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Tổng quan</h1>
        <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 16 }}>Không tải được dữ liệu.</div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Tổng quan</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 24 }}>
        <Stat label="Tin đăng" value={isLoading ? "..." : String(data?.listingsCount ?? 0)} />
        <Stat label="Đề xuất giá" value={isLoading ? "..." : String(data?.offersCount ?? 0)} />
        <Stat label="Người mua" value={isLoading ? "..." : String(data?.buyersCount ?? 0)} />
        <Stat label="GMV tiềm năng" value={isLoading ? "..." : formatVNDShort(Number(data?.gmvPotential ?? 0))} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{label}</div>
      <div className="mono" style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{value}</div>
    </div>
  );
}
