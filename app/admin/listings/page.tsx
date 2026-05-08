"use client";
import Link from "next/link";
import { useState } from "react";
import { useAdminListings, useApproveListing, useHideListing } from "@/hooks/api/listings";
import { formatVNDShort } from "@/lib/format-bigint";
import { ApiError } from "@/lib/api/client";

export default function AdminListingsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading, error } = useAdminListings({ status: statusFilter || undefined, limit: 50 });
  const items = data?.items ?? [];
  const approve = useApproveListing();
  const hideListing = useHideListing();

  const handleApprove = async (id: string) => {
    try {
      await approve.mutateAsync({ id });
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Lỗi phê duyệt");
    }
  };

  const handleHide = async (id: string) => {
    try {
      await hideListing.mutateAsync({ id });
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Lỗi ẩn tin");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Tin đăng</h1>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <select
          className="input"
          style={{ width: 220 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="DRAFT_SUBMITTED">DRAFT_SUBMITTED</option>
          <option value="INSPECTION_PENDING">INSPECTION_PENDING</option>
          <option value="INSPECTION_REJECTED">INSPECTION_REJECTED</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="HAS_BUYERS">HAS_BUYERS</option>
          <option value="CLOSING">CLOSING</option>
          <option value="SOLD">SOLD</option>
          <option value="HIDDEN">HIDDEN</option>
        </select>
      </div>
      {error && (
        <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 16 }}>Không tải được dữ liệu.</div>
      )}
      {isLoading && (
        <div style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 16 }}>Đang tải...</div>
      )}
      <table style={{ width: "100%", marginTop: 16, background: "white", borderRadius: 12, overflow: "hidden", borderCollapse: "collapse", fontSize: 13 }}>
        <thead style={{ background: "var(--bg-soft)", textAlign: "left" }}>
          <tr>
            <th style={th}>ID</th>
            <th style={th}>Xe</th>
            <th style={th}>Niêm yết</th>
            <th style={th}>Top offer</th>
            <th style={th}>Spread</th>
            <th style={th}>Trạng thái</th>
            <th style={th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {items.map(c => {
            const listPrice = Number(c.listPrice);
            const topOffer = c.topOffer ? Number(c.topOffer) : 0;
            const spread = c.spread ? Number(c.spread) : 0;
            return (
              <tr key={c.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={td}>
                  <Link href={`/admin/listings/${c.id}`} className="mono" style={{ color: "var(--green-700)" }}>{c.id}</Link>
                </td>
                <td style={td}>{c.brand} {c.model} {c.year}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{formatVNDShort(listPrice)}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{topOffer ? formatVNDShort(topOffer) : "—"}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)", color: spread > 0 ? "var(--green-700)" : "var(--ink-500)" }}>
                  {spread > 0 ? "+" + formatVNDShort(spread) : "—"}
                </td>
                <td style={td}>
                  <span className={`badge badge-${c.status === "ACTIVE" || c.status === "HAS_BUYERS" ? "green" : c.status === "DRAFT_SUBMITTED" || c.status === "INSPECTION_PENDING" ? "amber" : c.status === "SOLD" ? "neutral" : "red"}`}>
                    {c.status}
                  </span>
                </td>
                <td style={td}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(c.status === "DRAFT_SUBMITTED" || c.status === "INSPECTION_PENDING") && (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={approve.isPending}
                        onClick={() => handleApprove(c.id)}
                      >
                        Duyệt
                      </button>
                    )}
                    {c.status !== "HIDDEN" && c.status !== "SOLD" && (
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={hideListing.isPending}
                        onClick={() => handleHide(c.id)}
                      >
                        Ẩn
                      </button>
                    )}
                    <Link href={`/admin/listings/${c.id}`} className="btn btn-secondary btn-sm">
                      Mở
                    </Link>
                  </div>
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
