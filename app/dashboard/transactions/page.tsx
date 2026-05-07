"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, StatusBadge } from "@/components/dashboard/DataTable";
import { useMyTransactions } from "@/hooks/api/transactions";
import { formatVNDShort } from "@/lib/format-bigint";

export default function MyTransactionsPage() {
  const [scope, setScope] = useState<"buyer" | "seller" | "">("");
  const q = useMyTransactions({ limit: 50, role: scope || undefined });
  return (
    <>
      <PageHeader title="Giao dịch của tôi" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select className="input" style={{ width: 220 }} value={scope} onChange={(e) => setScope(e.target.value as "buyer" | "seller" | "")}>
          <option value="">Tất cả vai trò</option>
          <option value="buyer">Tôi mua</option>
          <option value="seller">Tôi bán</option>
        </select>
      </div>
      <DataTable
        rows={q.data?.items}
        rowKey={(r) => r.id}
        isLoading={q.isLoading}
        empty="Chưa có giao dịch."
        columns={[
          { key: "id", header: "Mã", render: (r) => <span className="mono">{r.id}</span> },
          {
            key: "listing",
            header: "Listing",
            render: (r) => (
              <Link href={`/cars/${r.listingId}`} style={{ color: "var(--green-700)" }}>
                {r.listingId}
              </Link>
            ),
          },
          { key: "final", header: "Giá chốt", render: (r) => formatVNDShort(r.finalPrice) },
          { key: "comm", header: "Phí", render: (r) => formatVNDShort(r.commission) },
          { key: "status", header: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
          {
            key: "act",
            header: "",
            render: (r) => (
              <Link href={`/dashboard/transactions/${r.id}`} className="btn btn-secondary btn-sm">
                Mở
              </Link>
            ),
          },
        ]}
      />
    </>
  );
}
