"use client";
import Link from "next/link";
import { useState } from "react";
import {
  useAdminListings,
  useApproveListing,
  useHideListing,
  useUnhideListing,
  useMarkListingSold,
} from "@/hooks/api/listings";
import { formatVNDShort } from "@/lib/format-bigint";
import { ApiError } from "@/lib/api/client";

export default function AdminListingsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading, error } = useAdminListings({ status: statusFilter || undefined, limit: 50 });
  const items = data?.items ?? [];
  const approve = useApproveListing();
  const hideListing = useHideListing();
  const unhideListing = useUnhideListing();
  const sell = useMarkListingSold();
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const showToast = (kind: "ok" | "err", msg: string) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 4000);
  };
  const handleErr = (label: string) => (e: unknown) => {
    showToast("err", e instanceof ApiError ? `${label}: ${e.message}` : `${label}: lỗi`);
  };
  const isPending = approve.isPending || hideListing.isPending || unhideListing.isPending || sell.isPending;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Tin đăng</h1>
      {toast && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 8,
            background: toast.kind === "err" ? "var(--red-100, #fee)" : "var(--green-100, #efe)",
            color: toast.kind === "err" ? "var(--red-700, #b91c1c)" : "var(--green-700, #16a34a)",
            fontSize: 13,
          }}
        >
          {toast.msg}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <select
          className="input"
          style={{ width: 220 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="DRAFT_SUBMITTED">Chờ duyệt (DRAFT_SUBMITTED)</option>
          <option value="INSPECTION_PENDING">Chờ kiểm định</option>
          <option value="INSPECTION_REJECTED">Kiểm định KHÔNG đạt</option>
          <option value="ACTIVE">Đang đăng (ACTIVE)</option>
          <option value="HAS_BUYERS">Có offer (HAS_BUYERS)</option>
          <option value="CLOSING">Đang chốt (CLOSING)</option>
          <option value="SOLD">Đã bán</option>
          <option value="HIDDEN">Đã ẩn</option>
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
            const canApprove = c.status === "DRAFT_SUBMITTED" || c.status === "INSPECTION_PENDING";
            const canSell = c.status !== "SOLD" && c.status !== "HIDDEN";
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
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {canApprove && (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={isPending}
                        onClick={() => {
                          if (!confirm(`Duyệt tin ${c.id}?`)) return;
                          approve.mutate({ id: c.id }, {
                            onSuccess: () => showToast("ok", `Đã duyệt ${c.id}`),
                            onError: handleErr("Duyệt"),
                          });
                        }}
                      >
                        Duyệt
                      </button>
                    )}
                    {c.status === "HIDDEN" ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={isPending}
                        onClick={() => {
                          unhideListing.mutate({ id: c.id }, {
                            onSuccess: () => showToast("ok", `Đã hiện ${c.id}`),
                            onError: handleErr("Hiện"),
                          });
                        }}
                      >
                        Hiện
                      </button>
                    ) : c.status !== "SOLD" ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={isPending}
                        onClick={() => {
                          if (!confirm(`Ẩn tin ${c.id}?`)) return;
                          hideListing.mutate({ id: c.id }, {
                            onSuccess: () => showToast("ok", `Đã ẩn ${c.id}`),
                            onError: handleErr("Ẩn"),
                          });
                        }}
                      >
                        Ẩn
                      </button>
                    ) : null}
                    {canSell && (
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={isPending}
                        onClick={() => {
                          const v = prompt(`Giá chốt cuối cho ${c.id} (VND):`);
                          if (!v) return;
                          const price = Number(v);
                          if (!Number.isFinite(price) || price <= 0) {
                            showToast("err", "Giá không hợp lệ");
                            return;
                          }
                          sell.mutate({ id: c.id, finalPrice: price }, {
                            onSuccess: () => showToast("ok", `Đã đánh dấu bán ${c.id}`),
                            onError: handleErr("Đã bán"),
                          });
                        }}
                      >
                        Đã bán
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
