"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useMyDeposits } from "@/hooks/api/deposits";
import { formatVNDShort } from "@/lib/format-bigint";
import type { Deposit, DepositStatus } from "@/types/api";

const TIMELINE: DepositStatus[] = ["PENDING_PAYMENT", "HELD", "APPLIED", "REFUNDED", "FORFEITED"];

const STATUS_LABELS: Record<DepositStatus, string> = {
  PENDING_PAYMENT: "Cho thanh toan",
  HELD: "Dang giu",
  APPLIED: "Da ap dung",
  REFUNDING: "Dang hoan",
  REFUNDED: "Da hoan",
  FORFEITED: "Bi mat",
};

export default function MyDepositsPage() {
  const [selected, setSelected] = useState<Deposit | null>(null);
  const q = useMyDeposits({ limit: 50 });
  const items = q.data?.items ?? [];

  return (
    <>
      <PageHeader title="Dat coc" subtitle="Coc giu cho va xem xe" />

      {q.isLoading && <div style={{ color: "var(--ink-500)", fontSize: 13 }}>Dang tai...</div>}

      {!q.isLoading && items.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--ink-500)" }}>
          Ban chua co khoan coc nao.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((d) => (
          <div
            key={d.id}
            className="card"
            style={{ padding: 20, cursor: "pointer", borderLeft: `4px solid ${statusColor(d.status)}` }}
            onClick={() => setSelected(d)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  <Link href={`/cars/${d.listingId}`} onClick={(e) => e.stopPropagation()} style={{ color: "var(--green-700)" }}>
                    Listing {d.listingId}
                  </Link>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2, fontFamily: "var(--font-mono)" }}>
                  ID: {d.id}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--green-700)" }}>
                  {formatVNDShort(d.amount)}
                </div>
                <span style={{ fontSize: 12, background: statusColor(d.status) + "20", color: statusColor(d.status), padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>
                  {STATUS_LABELS[d.status] || d.status}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ marginTop: 14, display: "flex", gap: 0 }}>
              {TIMELINE.map((s, i) => {
                const idx = TIMELINE.indexOf(d.status as DepositStatus);
                const past = i < idx;
                const current = i === idx;
                return (
                  <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                      {i > 0 && <div style={{ flex: 1, height: 2, background: past || current ? "var(--green-500)" : "var(--border)" }} />}
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: current ? "var(--green-700)" : past ? "var(--green-400)" : "var(--border)",
                        flexShrink: 0,
                      }} />
                      {i < TIMELINE.length - 1 && <div style={{ flex: 1, height: 2, background: past ? "var(--green-500)" : "var(--border)" }} />}
                    </div>
                    <div style={{ fontSize: 10, color: current ? "var(--green-700)" : past ? "var(--green-500)" : "var(--ink-400)", marginTop: 4, textAlign: "center", fontWeight: current ? 700 : 400 }}>
                      {s.replace("_", " ")}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-500)" }}>
              Tao: {d.createdAt.slice(0, 10)}
              {d.heldAt && ` · Giu: ${d.heldAt.slice(0, 10)}`}
              {d.viewBy && ` · Xem truoc den: ${d.viewBy.slice(0, 16).replace("T", " ")}`}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <DepositDetailModal deposit={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function DepositDetailModal({ deposit: d, onClose }: { deposit: Deposit; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 100 }}>
      <div className="card" style={{ padding: 24, width: 500, background: "white", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Chi tiet dat coc</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>x</button>
        </div>
        <Row label="ID" value={d.id} mono />
        <Row label="Listing" value={<Link href={`/cars/${d.listingId}`} style={{ color: "var(--green-700)" }}>{d.listingId}</Link>} />
        {d.offerId && <Row label="Offer ID" value={d.offerId} mono />}
        <Row label="So tien" value={<b>{formatVNDShort(d.amount)}</b>} />
        <Row label="Trang thai" value={
          <span style={{ fontWeight: 600, color: statusColor(d.status) }}>{STATUS_LABELS[d.status] || d.status}</span>
        } />
        {d.txnRef && <Row label="TxnRef" value={d.txnRef} mono />}
        <Row label="Tao luc" value={new Date(d.createdAt).toLocaleString("vi-VN")} />
        {d.heldAt && <Row label="Giu luc" value={new Date(d.heldAt).toLocaleString("vi-VN")} />}
        {d.viewBy && <Row label="Han xem xe" value={new Date(d.viewBy).toLocaleString("vi-VN")} />}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: 13, gap: 8 }}>
      <span style={{ color: "var(--ink-500)" }}>{label}</span>
      <span style={{ fontFamily: mono ? "var(--font-mono)" : undefined, textAlign: "right", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

function statusColor(status: DepositStatus): string {
  switch (status) {
    case "HELD": return "var(--green-600)";
    case "APPLIED": return "var(--green-700)";
    case "REFUNDED": return "var(--amber-600)";
    case "FORFEITED": return "var(--red-600)";
    default: return "var(--ink-500)";
  }
}
