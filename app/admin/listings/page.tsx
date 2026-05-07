"use client";
import Link from "next/link";
import { useAdminListings } from "@/hooks/api/listings";
import { formatVNDShort, STATUS_LABELS } from "@/lib/format";

export default function AdminListingsPage() {
  const { data, isLoading, error } = useAdminListings();
  const items = data?.items ?? [];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Tin đăng</h1>
      {error && (
        <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 16 }}>Không tải được dữ liệu.</div>
      )}
      {isLoading && (
        <div style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 16 }}>Đang tải...</div>
      )}
      <table style={{ width: "100%", marginTop: 24, background: "white", borderRadius: 12, overflow: "hidden", borderCollapse: "collapse", fontSize: 13 }}>
        <thead style={{ background: "var(--bg-soft)", textAlign: "left" }}>
          <tr>
            <th style={th}>ID</th>
            <th style={th}>Xe</th>
            <th style={th}>Niêm yết</th>
            <th style={th}>Min seller</th>
            <th style={th}>Top offer</th>
            <th style={th}>Spread</th>
            <th style={th}>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {items.map(c => {
            const listPrice = Number(c.listPrice);
            const minPrice = Number(c.minPrice);
            const topOffer = c.topOffer ? Number(c.topOffer) : 0;
            const spread = c.spread ? Number(c.spread) : 0;
            const statusKey = c.status.toLowerCase();
            const statusInfo = STATUS_LABELS[statusKey] ?? STATUS_LABELS["active"];
            return (
              <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={td}>
                  <Link href={`/admin/listings/${c.id}`} className="mono" style={{ color: "var(--green-700)" }}>{c.id}</Link>
                </td>
                <td style={td}>{c.brand} {c.model} {c.year}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{formatVNDShort(listPrice)}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{formatVNDShort(minPrice)}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{topOffer ? formatVNDShort(topOffer) : "—"}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)", color: spread > 0 ? "var(--green-700)" : "var(--ink-500)" }}>
                  {spread > 0 ? "+" + formatVNDShort(spread) : "—"}
                </td>
                <td style={td}>
                  <span className={`badge badge-${statusInfo.color}`}>{statusInfo.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = { padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.5px" };
const td: React.CSSProperties = { padding: "12px 16px" };
