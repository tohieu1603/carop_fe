"use client";
import Link from "next/link";
import { useState } from "react";
import { useAdminTransactions } from "@/hooks/api/transactions";
import { formatVNDShort } from "@/lib/format-bigint";
import type { TxnStatus } from "@/types/api";

export default function AdminEscrowPage() {
  const [status, setStatus] = useState<TxnStatus | "">("");
  const { data, isLoading, error } = useAdminTransactions({ status: status || undefined, limit: 50 });
  const items = data?.items ?? [];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Bảo lãnh giao dịch</h1>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <select
          className="input"
          style={{ width: 240 }}
          value={status}
          onChange={(e) => setStatus(e.target.value as TxnStatus | "")}
        >
          <option value="">Tất cả trạng thái</option>
          {(["PENDING_BALANCE", "BALANCE_HELD", "RECEIPT_CONFIRMED", "PAID_OUT", "DISPUTED", "CANCELED"] as TxnStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 16 }}>Không tải được dữ liệu.</div>
      )}
      {isLoading && (
        <div style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 16 }}>Đang tải...</div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="card" style={{ padding: 40, marginTop: 24, textAlign: "center", color: "var(--ink-500)" }}>
          Chưa có giao dịch nào.
        </div>
      )}

      {items.length > 0 && (
        <table style={{ width: "100%", marginTop: 16, background: "white", borderRadius: 12, overflow: "hidden", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "var(--bg-soft)", textAlign: "left" }}>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Listing</th>
              <th style={th}>Buyer</th>
              <th style={th}>Giá chốt</th>
              <th style={th}>Phí</th>
              <th style={th}>Trạng thái</th>
              <th style={th}>Tạo</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={td}>
                  <Link href={`/dashboard/transactions/${t.id}`} className="mono" style={{ color: "var(--green-700)" }}>{t.id}</Link>
                </td>
                <td style={td}>
                  <Link href={`/admin/listings/${t.listingId}`} style={{ color: "var(--green-700)" }}>{t.listingId}</Link>
                </td>
                <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 11 }}>{t.buyerId}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{formatVNDShort(t.finalPrice)}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{formatVNDShort(t.commission)}</td>
                <td style={td}>
                  <span className={`badge badge-${t.status === "BALANCE_HELD" || t.status === "PAID_OUT" ? "green" : t.status === "DISPUTED" ? "red" : "amber"}`}>
                    {t.status}
                  </span>
                </td>
                <td style={{ ...td, fontSize: 11, color: "var(--ink-500)" }}>{t.createdAt.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th: React.CSSProperties = { padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.5px" };
const td: React.CSSProperties = { padding: "12px 16px" };
