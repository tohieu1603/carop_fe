"use client";
import { useState } from "react";
import Link from "next/link";
import { useAdminTransactions, useRunPayout } from "@/hooks/api/transactions";
import { formatVNDShort } from "@/lib/format-bigint";
import { ApiError } from "@/lib/api/client";
import type { Transaction, TxnStatus } from "@/types/api";

const STATUS_CHIPS: Array<{ label: string; value: TxnStatus | "" }> = [
  { label: "Tat ca", value: "" },
  { label: "PENDING_BALANCE", value: "PENDING_BALANCE" },
  { label: "BALANCE_HELD", value: "BALANCE_HELD" },
  { label: "RECEIPT_CONFIRMED", value: "RECEIPT_CONFIRMED" },
  { label: "PAID_OUT", value: "PAID_OUT" },
  { label: "DISPUTED", value: "DISPUTED" },
  { label: "CANCELED", value: "CANCELED" },
];

export default function AdminEscrowPage() {
  const [status, setStatus] = useState<TxnStatus | "">("");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const { data, isLoading, error } = useAdminTransactions({ status: status || undefined, limit: 50 });
  const runPayout = useRunPayout();
  const items = data?.items ?? [];

  const handlePayout = async (t: Transaction) => {
    if (!confirm(`Trigger payout cho giao dich ${t.id}?`)) return;
    try {
      await runPayout.mutateAsync({ id: t.id });
      alert("Payout da duoc kich hoat.");
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Loi payout");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Bao lanh giao dich</h1>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
        {STATUS_CHIPS.map((c) => (
          <button
            key={c.value}
            onClick={() => setStatus(c.value)}
            style={{
              padding: "5px 12px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 600,
              border: "1px solid var(--border)",
              background: status === c.value ? "var(--ink-900)" : "white",
              color: status === c.value ? "white" : "var(--ink-700)",
              cursor: "pointer",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 16 }}>Khong tai duoc du lieu.</div>
      )}
      {isLoading && (
        <div style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 16 }}>Dang tai...</div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="card" style={{ padding: 40, marginTop: 24, textAlign: "center", color: "var(--ink-500)" }}>
          Chua co giao dich nao.
        </div>
      )}

      {items.length > 0 && (
        <table style={{ width: "100%", marginTop: 16, background: "white", borderRadius: 12, overflow: "hidden", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "var(--bg-soft)", textAlign: "left" }}>
            <tr>
              {["ID", "Listing", "Buyer", "Gia chot", "Phi", "Trang thai", "Tao", ""].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr
                key={t.id}
                style={{ borderTop: "1px solid var(--border)", cursor: "pointer" }}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("button,a")) return;
                  setSelectedTxn(t);
                }}
              >
                <td style={td}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--green-700)", cursor: "pointer" }}
                    onClick={() => setSelectedTxn(t)}>{t.id.slice(0, 8)}...</span>
                </td>
                <td style={td}>
                  <Link href={`/admin/listings/${t.listingId}`} style={{ color: "var(--green-700)" }}
                    onClick={(e) => e.stopPropagation()}>{t.listingId}</Link>
                </td>
                <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 11 }}>{t.buyerId.slice(0, 8)}...</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{formatVNDShort(t.finalPrice)}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{formatVNDShort(t.commission)}</td>
                <td style={td}>
                  <span className={`badge badge-${t.status === "BALANCE_HELD" || t.status === "PAID_OUT" ? "green" : t.status === "DISPUTED" ? "red" : "amber"}`}>
                    {t.status}
                  </span>
                </td>
                <td style={{ ...td, fontSize: 11, color: "var(--ink-500)" }}>{t.createdAt.slice(0, 10)}</td>
                <td style={td} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedTxn(t)}>
                      Chi tiet
                    </button>
                    {(t.status === "RECEIPT_CONFIRMED") && (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={runPayout.isPending}
                        onClick={() => handlePayout(t)}
                      >
                        Payout
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedTxn && (
        <TxnDetailDrawer txn={selectedTxn} onClose={() => setSelectedTxn(null)} />
      )}
    </div>
  );
}

function TxnDetailDrawer({ txn, onClose }: { txn: Transaction; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "flex-end", zIndex: 100 }}>
      <div className="card" style={{ width: 480, height: "100%", overflowY: "auto", borderRadius: 0, padding: 24, background: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Chi tiet giao dich</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>x</button>
        </div>

        <Row label="ID" value={txn.id} mono />
        <Row label="Listing" value={
          <Link href={`/admin/listings/${txn.listingId}`} style={{ color: "var(--green-700)" }}>{txn.listingId}</Link>
        } />
        <Row label="Buyer ID" value={txn.buyerId} mono />
        <Row label="Seller ID" value={txn.sellerId} mono />
        <Row label="Offer ID" value={txn.offerId} mono />
        {txn.depositId && <Row label="Deposit ID" value={txn.depositId} mono />}
        <Row label="Gia chot" value={<b>{formatVNDShort(txn.finalPrice)}</b>} />
        <Row label="Phi dich vu" value={formatVNDShort(txn.commission)} />
        <Row label="Net nguoi ban" value={formatVNDShort(String(Number(txn.finalPrice) - Number(txn.commission)))} />
        <Row label="Trang thai" value={
          <span className={`badge badge-${txn.status === "BALANCE_HELD" || txn.status === "PAID_OUT" ? "green" : txn.status === "DISPUTED" ? "red" : "amber"}`}>
            {txn.status}
          </span>
        } />
        <Row label="Frozen" value={txn.frozen ? "Co" : "Khong"} />
        {txn.balanceTxnRef && <Row label="Balance TxnRef" value={txn.balanceTxnRef} mono />}
        <Row label="Ngay tao" value={new Date(txn.createdAt).toLocaleString("vi-VN")} />
        {txn.paidOutAt && <Row label="Paid out" value={new Date(txn.paidOutAt).toLocaleString("vi-VN")} />}

        <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
          <Link href={`/dashboard/transactions/${txn.id}`} className="btn btn-secondary btn-sm">
            Mo trang giao dich
          </Link>
          {txn.status === "RECEIPT_CONFIRMED" && (
            <RunPayoutBtn txnId={txn.id} onSuccess={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

function RunPayoutBtn({ txnId, onSuccess }: { txnId: string; onSuccess: () => void }) {
  const runPayout = useRunPayout();
  return (
    <button
      className="btn btn-primary btn-sm"
      disabled={runPayout.isPending}
      onClick={async () => {
        try {
          await runPayout.mutateAsync({ id: txnId });
          alert("Payout da duoc kich hoat.");
          onSuccess();
        } catch (e) {
          alert(e instanceof ApiError ? e.message : "Loi payout");
        }
      }}
    >
      {runPayout.isPending ? "Dang xu ly..." : "Trigger Payout"}
    </button>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13, gap: 8 }}>
      <span style={{ color: "var(--ink-500)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: mono ? "var(--font-mono)" : undefined, textAlign: "right", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

const th: React.CSSProperties = { padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.5px" };
const td: React.CSSProperties = { padding: "12px 16px" };
