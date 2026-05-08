"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, StatusBadge } from "@/components/dashboard/DataTable";
import { RequireRole } from "@/components/RequireRole";
import { useAdminDisputes, useResolveDispute } from "@/hooks/api/disputes";
import { ApiError } from "@/lib/api/client";
import type { Dispute, DisputeDecision, DisputeStatus } from "@/types/api";

export default function AdminDisputesPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [status, setStatus] = useState<DisputeStatus | "">("OPEN");
  const list = useAdminDisputes({ status: status || undefined, limit: 50 });
  const [resolveFor, setResolveFor] = useState<Dispute | null>(null);
  return (
    <>
      <PageHeader title="Khiếu nại" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select className="input" style={{ width: 220 }} value={status} onChange={(e) => setStatus(e.target.value as DisputeStatus | "")}>
          <option value="">Tất cả</option>
          <option value="OPEN">OPEN</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CANCELED">CANCELED</option>
        </select>
      </div>
      <DataTable
        rows={list.data?.items}
        rowKey={(r) => r.id}
        isLoading={list.isLoading}
        columns={[
          { key: "id", header: "ID", render: (r) => <span className="mono">{r.id}</span> },
          { key: "txn", header: "Giao dịch", render: (r) => r.transaction ? `${r.transaction.listingId} (${r.transaction.status})` : r.transactionId },
          { key: "opener", header: "Người mở", render: (r) => r.opener ? `${r.opener.fullName} (${r.opener.role})` : r.openerId },
          { key: "reason", header: "Lý do", render: (r) => <span style={{ fontSize: 12 }}>{r.reason.slice(0, 80)}{r.reason.length > 80 ? "…" : ""}</span> },
          { key: "status", header: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
          {
            key: "act",
            header: "",
            render: (r) =>
              r.status === "OPEN" ? (
                <button className="btn btn-primary btn-sm" onClick={() => setResolveFor(r)}>
                  Xử lý
                </button>
              ) : null,
          },
        ]}
      />
      {resolveFor && <ResolveDialog dispute={resolveFor} onClose={() => setResolveFor(null)} />}
    </>
  );
}

function ResolveDialog({ dispute, onClose }: { dispute: Dispute; onClose: () => void }) {
  const resolve = useResolveDispute();
  const [decision, setDecision] = useState<DisputeDecision>("REFUND_BUYER");
  const [splitPct, setSplitPct] = useState(50);
  const [rationale, setRationale] = useState("");
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "grid",
        placeItems: "center",
        zIndex: 100,
      }}
    >
      <div className="card" style={{ padding: 24, width: 480, background: "white" }}>
        <h3 style={{ marginTop: 0 }}>Xử lý khiếu nại #{dispute.id}</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label className="label">Quyết định</label>
            <select className="input" value={decision} onChange={(e) => setDecision(e.target.value as DisputeDecision)}>
              <option value="REFUND_BUYER">REFUND_BUYER</option>
              <option value="RELEASE_SELLER">RELEASE_SELLER</option>
              <option value="SPLIT">SPLIT</option>
            </select>
          </div>
          {decision === "SPLIT" && (
            <div>
              <label className="label">Tỷ lệ chia (1..99)</label>
              <input type="number" className="input" value={splitPct} onChange={(e) => setSplitPct(Number(e.target.value))} />
            </div>
          )}
          <div>
            <label className="label">Lý giải (30..2000)</label>
            <textarea className="input" rows={4} value={rationale} onChange={(e) => setRationale(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn btn-primary btn-sm"
            disabled={resolve.isPending || rationale.length < 30}
            onClick={async () => {
              try {
                await resolve.mutateAsync({
                  id: dispute.id,
                  decision,
                  rationale,
                  splitPct: decision === "SPLIT" ? splitPct : undefined,
                });
                onClose();
              } catch (e) {
                alert(e instanceof ApiError ? e.message : "Lỗi");
              }
            }}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
