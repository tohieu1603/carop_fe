"use client";
import { useState } from "react";
import Link from "next/link";
import { useAdminDisputes } from "@/hooks/api/disputes";
import { formatVNDShort } from "@/lib/format-bigint";
import type { DisputeStatus } from "@/types/api";

export default function AdminDisputesPage() {
  const [status, setStatus] = useState<DisputeStatus | "">("OPEN");
  const { data, isLoading, error } = useAdminDisputes({ status: status || undefined, limit: 50 });
  const items = data?.items ?? [];

  const chips: Array<{ label: string; value: DisputeStatus | "" }> = [
    { label: "Tat ca", value: "" },
    { label: "OPEN", value: "OPEN" },
    { label: "RESOLVED", value: "RESOLVED" },
    { label: "CANCELED", value: "CANCELED" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Khieu nai</h1>

      <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
        {chips.map((c) => (
          <button
            key={c.value}
            onClick={() => setStatus(c.value)}
            style={{
              padding: "6px 14px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 600,
              border: "1px solid var(--border)",
              background: status === c.value ? "var(--ink-900)" : "white",
              color: status === c.value ? "white" : "var(--ink-700)",
              cursor: "pointer",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 16 }}>Khong tai duoc du lieu.</div>
      )}
      {isLoading && (
        <div style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 16 }}>Dang tai...</div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="card" style={{ padding: 40, marginTop: 24, textAlign: "center", color: "var(--ink-500)" }}>
          Chua co khieu nai nao.
        </div>
      )}

      {items.length > 0 && (
        <table style={{ width: "100%", marginTop: 16, background: "white", borderRadius: 12, overflow: "hidden", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "var(--bg-soft)", textAlign: "left" }}>
            <tr>
              {["ID", "Giao dich", "Nguoi mo", "Ly do", "Trang thai", "Ngay", ""].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  <Link href={`/admin/disputes/${d.id}`} style={{ color: "var(--green-700)" }}>
                    {d.id.slice(0, 8)}...
                  </Link>
                </td>
                <td style={td}>
                  {d.transaction ? (
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{d.transaction.id?.slice(0, 8)}...</div>
                      <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{formatVNDShort(d.transaction.finalPrice)}</div>
                    </div>
                  ) : d.transactionId}
                </td>
                <td style={td}>{d.opener ? `${d.opener.fullName} (${d.opener.role})` : d.openerId}</td>
                <td style={{ ...td, maxWidth: 240 }}>
                  <span style={{ fontSize: 12 }}>{d.reason.slice(0, 60)}{d.reason.length > 60 ? "..." : ""}</span>
                </td>
                <td style={td}>
                  <span className={`badge badge-${d.status === "OPEN" ? "amber" : d.status === "RESOLVED" ? "green" : "neutral"}`}>
                    {d.status}
                  </span>
                </td>
                <td style={{ ...td, fontSize: 11, color: "var(--ink-500)" }}>{d.createdAt.slice(0, 10)}</td>
                <td style={td}>
                  <Link href={`/admin/disputes/${d.id}`} className="btn btn-secondary btn-sm">
                    Xem
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--ink-500)", textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "12px 16px" };
