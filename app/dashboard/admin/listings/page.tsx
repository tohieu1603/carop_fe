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
} from "@/hooks/api/listings";
import { formatVNDShort } from "@/lib/format-bigint";
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
  const list = useAdminListings({ status: status || undefined, severity: severity || undefined, q: q || undefined, limit: 50 });
  const approve = useApproveListing();
  const sell = useMarkListingSold();
  return (
    <>
      <PageHeader title="Quản lý tin đăng" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input className="input" placeholder="Tìm" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 240 }} />
        <input className="input" placeholder="Status" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 200 }} />
        <select className="input" style={{ width: 180 }} value={severity} onChange={(e) => setSeverity(e.target.value as Severity | "")}>
          <option value="">Tất cả mức độ</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
      </div>
      <DataTable
        rows={list.data?.items}
        rowKey={(r) => r.id}
        isLoading={list.isLoading}
        columns={[
          { key: "id", header: "ID", render: (r) => <span className="mono">{r.id}</span> },
          { key: "car", header: "Xe", render: (r) => `${r.brand} ${r.model} ${r.year}` },
          { key: "price", header: "Giá", render: (r) => formatVNDShort(r.listPrice) },
          { key: "top", header: "Top offer", render: (r) => (r.topOffer ? formatVNDShort(r.topOffer) : "—") },
          { key: "spread", header: "Chênh", render: (r) => (r.spread ? formatVNDShort(r.spread) : "—") },
          { key: "status", header: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
          {
            key: "act",
            header: "",
            render: (r) => (
              <div style={{ display: "flex", gap: 6 }}>
                {(r.status === "INSPECTION_PENDING" || r.status === "DRAFT_SUBMITTED") && (
                  <button className="btn btn-primary btn-sm" onClick={() => approve.mutate({ id: r.id })}>
                    Duyệt
                  </button>
                )}
                {r.status !== "SOLD" && r.status !== "HIDDEN" && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const v = prompt("Final price (VND):");
                      if (v) sell.mutate({ id: r.id, finalPrice: Number(v) });
                    }}
                  >
                    Đã bán
                  </button>
                )}
                <Link className="btn btn-secondary btn-sm" href={`/dashboard/listings/${r.id}`}>
                  Mở
                </Link>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
