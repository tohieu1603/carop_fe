"use client";

import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, StatusBadge } from "@/components/dashboard/DataTable";
import { useMyDeposits } from "@/hooks/api/deposits";
import { formatVNDShort } from "@/lib/format-bigint";

export default function MyDepositsPage() {
  const q = useMyDeposits({ limit: 50 });
  return (
    <>
      <PageHeader title="Đặt cọc" subtitle="Cọc giữ chỗ và xem xe" />
      <DataTable
        rows={q.data?.items}
        rowKey={(r) => r.id}
        isLoading={q.isLoading}
        empty="Bạn chưa có khoản cọc nào."
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
          { key: "viewBy", header: "Xem trước", render: (r) => r.viewBy?.slice(0, 16).replace("T", " ") || "—" },
          { key: "created", header: "Tạo", render: (r) => r.createdAt.slice(0, 10) },
        ]}
      />
    </>
  );
}
