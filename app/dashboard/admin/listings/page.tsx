"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, StatusBadge } from "@/components/dashboard/DataTable";
import { RequireRole } from "@/components/RequireRole";
import {
  useAdminListings,
  useApproveListing,
  useMarkListingSold,
  useHideListing,
  useUnhideListing,
} from "@/hooks/api/listings";
import { formatVNDShort } from "@/lib/format-bigint";
import { ApiError } from "@/lib/api/client";
import type { Severity } from "@/types/api";

export default function AdminListingsPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const list = useAdminListings({ status: status || undefined, severity: severity || undefined, q: q || undefined, limit: 50 });
  const approve = useApproveListing();
  const sell = useMarkListingSold();
  const hideListing = useHideListing();
  const unhideListing = useUnhideListing();

  const showToast = (kind: "ok" | "err", msg: string) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 4000);
  };
  const handleErr = (label: string) => (e: unknown) => {
    const msg = e instanceof ApiError ? `${label}: ${e.message}` : `${label}: lỗi không xác định`;
    showToast("err", msg);
  };

  const STATUS_OPTIONS = [
    { v: "", l: "Tất cả trạng thái" },
    { v: "DRAFT_SUBMITTED", l: "Chờ duyệt" },
    { v: "INSPECTION_PENDING", l: "Chờ kiểm định" },
    { v: "INSPECTION_REJECTED", l: "Kiểm định KHÔNG đạt" },
    { v: "ACTIVE", l: "Đang đăng" },
    { v: "HAS_BUYERS", l: "Có offer" },
    { v: "CLOSING", l: "Đang chốt" },
    { v: "SOLD", l: "Đã bán" },
    { v: "HIDDEN", l: "Đã ẩn" },
  ];

  return (
    <>
      <PageHeader title="Quản lý tin đăng" />
      {toast && (
        <div
          style={{
            marginBottom: 12,
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
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input className="input" placeholder="Tìm theo brand/model/VIN..." value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 240 }} />
        <select className="input" style={{ width: 200 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        <select className="input" style={{ width: 180 }} value={severity} onChange={(e) => setSeverity(e.target.value as Severity | "")}>
          <option value="">Tất cả mức độ</option>
          <option value="low">Ngập nhẹ</option>
          <option value="medium">Ngập vừa</option>
          <option value="high">Ngập nặng</option>
        </select>
      </div>
      <DataTable
        rows={list.data?.items}
        rowKey={(r) => r.id}
        isLoading={list.isLoading}
        empty="Không có tin đăng."
        columns={[
          { key: "id", header: "ID", render: (r) => <Link className="mono" style={{ color: "var(--green-700)" }} href={`/dashboard/listings/${r.id}`}>{r.id}</Link> },
          { key: "car", header: "Xe", render: (r) => `${r.brand} ${r.model} ${r.year}` },
          { key: "price", header: "Niêm yết", render: (r) => formatVNDShort(r.listPrice) },
          { key: "top", header: "Top offer", render: (r) => (r.topOffer ? formatVNDShort(r.topOffer) : "—") },
          { key: "spread", header: "Chênh", render: (r) => (r.spread ? formatVNDShort(r.spread) : "—") },
          { key: "status", header: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
          {
            key: "act",
            header: "",
            render: (r) => {
              const isPending = approve.isPending || hideListing.isPending || unhideListing.isPending || sell.isPending;
              return (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(r.status === "INSPECTION_PENDING" || r.status === "DRAFT_SUBMITTED") && (
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={isPending}
                      onClick={() => {
                        approve.mutate({ id: r.id }, {
                          onSuccess: () => showToast("ok", `Đã duyệt ${r.id}`),
                          onError: handleErr("Duyệt thất bại"),
                        });
                      }}
                    >
                      Duyệt
                    </button>
                  )}
                  {r.status === "HIDDEN" ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={isPending}
                      onClick={() => {
                        unhideListing.mutate({ id: r.id }, {
                          onSuccess: () => showToast("ok", `Đã hiện ${r.id}`),
                          onError: handleErr("Hiện thất bại"),
                        });
                      }}
                    >
                      Hiện
                    </button>
                  ) : r.status !== "SOLD" ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={isPending}
                      onClick={() => {
                        if (!confirm(`Ẩn tin ${r.id}?`)) return;
                        hideListing.mutate({ id: r.id }, {
                          onSuccess: () => showToast("ok", `Đã ẩn ${r.id}`),
                          onError: handleErr("Ẩn thất bại"),
                        });
                      }}
                    >
                      Ẩn
                    </button>
                  ) : null}
                  {r.status !== "SOLD" && r.status !== "HIDDEN" && (
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={isPending}
                      onClick={() => {
                        const v = prompt(`Giá chốt cuối cho ${r.id} (VND):`);
                        if (!v) return;
                        const price = Number(v);
                        if (!Number.isFinite(price) || price <= 0) {
                          showToast("err", "Giá không hợp lệ");
                          return;
                        }
                        sell.mutate({ id: r.id, finalPrice: price }, {
                          onSuccess: () => showToast("ok", `Đã đánh dấu bán ${r.id}`),
                          onError: handleErr("Đánh dấu bán thất bại"),
                        });
                      }}
                    >
                      Đã bán
                    </button>
                  )}
                  <Link className="btn btn-secondary btn-sm" href={`/dashboard/listings/${r.id}`}>
                    Chi tiết
                  </Link>
                </div>
              );
            },
          },
        ]}
      />
    </>
  );
}
