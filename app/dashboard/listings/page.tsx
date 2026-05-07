"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, StatusBadge } from "@/components/dashboard/DataTable";
import { useMyListings } from "@/hooks/api/listings";
import { formatVNDShort } from "@/lib/format-bigint";
import type { ListingStatus } from "@/types/api";

const STATUSES: ListingStatus[] = [
  "DRAFT_SUBMITTED",
  "INSPECTION_PENDING",
  "INSPECTION_REJECTED",
  "ACTIVE",
  "HAS_BUYERS",
  "CLOSING",
  "SOLD",
  "HIDDEN",
];

export default function MyListingsPage() {
  const [status, setStatus] = useState<ListingStatus | "">("");
  const q = useMyListings({ limit: 50, status: status || undefined });

  return (
    <>
      <PageHeader
        title="Tin đăng của tôi"
        actions={
          <Link href="/dashboard/listings/new" className="btn btn-primary btn-sm">
            + Đăng tin
          </Link>
        }
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select
          className="input"
          style={{ width: 220 }}
          value={status}
          onChange={(e) => setStatus(e.target.value as ListingStatus | "")}
        >
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        rows={q.data?.items}
        rowKey={(r) => r.id}
        isLoading={q.isLoading}
        empty="Bạn chưa có tin nào."
        columns={[
          { key: "id", header: "Mã", render: (r) => <span className="mono">{r.id}</span> },
          { key: "car", header: "Xe", render: (r) => `${r.brand} ${r.model} ${r.year}` },
          { key: "price", header: "Giá niêm yết", render: (r) => formatVNDShort(r.listPrice) },
          { key: "offers", header: "Offer", render: (r) => r.offerCount },
          { key: "status", header: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
          {
            key: "act",
            header: "",
            render: (r) => (
              <Link href={`/dashboard/listings/${r.id}`} className="btn btn-secondary btn-sm">
                Xem
              </Link>
            ),
          },
        ]}
      />
    </>
  );
}
