"use client";

import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, StatusBadge } from "@/components/dashboard/DataTable";
import { useMyOffers, useWithdrawOffer } from "@/hooks/api/offers";
import { RequireRole } from "@/components/RequireRole";
import { formatVNDShort } from "@/lib/format-bigint";

export default function MyOffersPage() {
  return (
    <RequireRole roles={["BUYER"]}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const q = useMyOffers({ limit: 50 });
  const withdraw = useWithdrawOffer();
  return (
    <>
      <PageHeader title="Offer của tôi" subtitle="Đề xuất giá đã gửi cho người bán" />
      <DataTable
        rows={q.data?.items}
        rowKey={(r) => r.id}
        isLoading={q.isLoading}
        empty="Bạn chưa gửi offer nào."
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
          { key: "amount", header: "Số tiền", render: (r) => formatVNDShort(r.amount) },
          { key: "status", header: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
          { key: "date", header: "Tạo", render: (r) => r.createdAt.slice(0, 10) },
          {
            key: "act",
            header: "",
            render: (r) =>
              r.status === "PENDING" ? (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (confirm("Rút lại offer?")) withdraw.mutate({ id: r.id });
                  }}
                >
                  Rút
                </button>
              ) : null,
          },
        ]}
      />
    </>
  );
}
