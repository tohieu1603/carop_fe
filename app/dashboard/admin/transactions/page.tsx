"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, StatusBadge } from "@/components/dashboard/DataTable";
import { RequireRole } from "@/components/RequireRole";
import { useAdminTransactions, useRunPayout } from "@/hooks/api/transactions";
import { formatVNDShort } from "@/lib/format-bigint";
import type { TxnStatus } from "@/types/api";

export default function AdminTxnsPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [status, setStatus] = useState<TxnStatus | "">("");
  const list = useAdminTransactions({ status: status || undefined, limit: 50 });
  const payout = useRunPayout();
  return (
    <>
      <PageHeader title="Giao dịch (admin)" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select className="input" style={{ width: 240 }} value={status} onChange={(e) => setStatus(e.target.value as TxnStatus | "")}>
          <option value="">Tất cả trạng thái</option>
          {(["PENDING_BALANCE", "BALANCE_HELD", "RECEIPT_CONFIRMED", "PAID_OUT", "DISPUTED", "CANCELED"] as TxnStatus[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        rows={list.data?.items}
        rowKey={(r) => r.id}
        isLoading={list.isLoading}
        columns={[
          { key: "id", header: "ID", render: (r) => <span className="mono">{r.id}</span> },
          { key: "listing", header: "Listing", render: (r) => r.listingId },
          { key: "buyer", header: "Buyer", render: (r) => r.buyerId },
          { key: "seller", header: "Seller", render: (r) => r.sellerId },
          { key: "final", header: "Giá", render: (r) => formatVNDShort(r.finalPrice) },
          { key: "comm", header: "Phí", render: (r) => formatVNDShort(r.commission) },
          { key: "status", header: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
          {
            key: "act",
            header: "",
            render: (r) => (
              <div style={{ display: "flex", gap: 6 }}>
                {r.status === "RECEIPT_CONFIRMED" && (
                  <button className="btn btn-primary btn-sm" onClick={() => payout.mutate({ id: r.id })}>
                    Payout
                  </button>
                )}
                <Link className="btn btn-secondary btn-sm" href={`/dashboard/transactions/${r.id}`}>
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
