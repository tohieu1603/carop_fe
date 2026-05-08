"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, StatusBadge } from "@/components/dashboard/DataTable";
import { useMyListings, useHideListing, useUnhideListing } from "@/hooks/api/listings";
import { formatVNDShort } from "@/lib/format-bigint";
import { ApiError } from "@/lib/api/client";
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
  const hide = useHideListing();
  const unhide = useUnhideListing();

  const handleHide = async (id: string) => {
    if (!confirm("An tin dang nay?")) return;
    try { await hide.mutateAsync({ id }); }
    catch (e) { alert(e instanceof ApiError ? e.message : "Loi"); }
  };

  const handleUnhide = async (id: string) => {
    if (!confirm("Hien thi lai tin dang?")) return;
    try { await unhide.mutateAsync({ id }); }
    catch (e) { alert(e instanceof ApiError ? e.message : "Loi"); }
  };

  return (
    <>
      <PageHeader
        title="Tin dang cua toi"
        actions={
          <Link href="/dashboard/listings/new" className="btn btn-primary btn-sm">
            + Dang tin
          </Link>
        }
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          onClick={() => setStatus("")}
          style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "1px solid var(--border)", background: status === "" ? "var(--ink-900)" : "white", color: status === "" ? "white" : "var(--ink-700)", cursor: "pointer" }}
        >
          Tat ca
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "1px solid var(--border)", background: status === s ? "var(--ink-900)" : "white", color: status === s ? "white" : "var(--ink-700)", cursor: "pointer" }}
          >
            {s}
          </button>
        ))}
      </div>

      <DataTable
        rows={q.data?.items}
        rowKey={(r) => r.id}
        isLoading={q.isLoading}
        empty="Ban chua co tin nao."
        columns={[
          { key: "id", header: "Ma", render: (r) => <span className="mono" style={{ fontSize: 11 }}>{r.id}</span> },
          { key: "car", header: "Xe", render: (r) => `${r.brand} ${r.model} ${r.year}` },
          { key: "price", header: "Niem yet", render: (r) => <span className="mono">{formatVNDShort(r.listPrice)}</span> },
          {
            key: "topOffer",
            header: "Offer cao",
            render: (r) => r.topOffer
              ? <span className="mono" style={{ color: "var(--green-700)", fontWeight: 700 }}>{formatVNDShort(r.topOffer)}</span>
              : <span style={{ color: "var(--ink-400)" }}>—</span>,
          },
          { key: "offers", header: "Offers", render: (r) => r.offerCount },
          { key: "views", header: "Luot xem", render: (r) => r.views.toLocaleString("vi-VN") },
          { key: "status", header: "Trang thai", render: (r) => <StatusBadge value={r.status} /> },
          {
            key: "act",
            header: "",
            render: (r) => (
              <div style={{ display: "flex", gap: 6 }}>
                <Link href={`/dashboard/listings/${r.id}`} className="btn btn-secondary btn-sm">
                  Xem
                </Link>
                {(r.status === "DRAFT_SUBMITTED" || r.status === "INSPECTION_REJECTED") && (
                  <Link href={`/sell/listings/${r.id}/edit`} className="btn btn-secondary btn-sm">
                    Sua
                  </Link>
                )}
                {(r.status === "ACTIVE" || r.status === "HAS_BUYERS") && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleHide(r.id)} disabled={hide.isPending}>
                    An
                  </button>
                )}
                {r.status === "HIDDEN" && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleUnhide(r.id)} disabled={unhide.isPending}>
                    Hien
                  </button>
                )}
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
