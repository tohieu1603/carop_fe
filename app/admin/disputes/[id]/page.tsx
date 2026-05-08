"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useAdminDisputes, useResolveDispute } from "@/hooks/api/disputes";
import { useTransaction } from "@/hooks/api/transactions";
import { formatVNDShort } from "@/lib/format-bigint";
import { ApiError } from "@/lib/api/client";
import type { Dispute, DisputeDecision } from "@/types/api";

export default function AdminDisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // Fetch list and filter — no GET /api/admin/disputes/:id in BE scan
  const { data, isLoading } = useAdminDisputes({ limit: 100 });
  const dispute = data?.items?.find((d) => d.id === id);

  if (isLoading) {
    return <div style={{ padding: 32, color: "var(--ink-500)" }}>Dang tai...</div>;
  }
  if (!dispute) {
    return (
      <div style={{ padding: 32 }}>
        <Link href="/admin/disputes" style={{ color: "var(--green-700)", fontSize: 13 }}>← Quay lai</Link>
        <div style={{ marginTop: 16, color: "var(--red-600)" }}>Khong tim thay khieu nai.</div>
      </div>
    );
  }

  return <DisputeDetail dispute={dispute} />;
}

function DisputeDetail({ dispute }: { dispute: Dispute }) {
  const txn = useTransaction(dispute.transactionId);
  const [showResolve, setShowResolve] = useState(false);

  return (
    <div>
      <Link href="/admin/disputes" style={{ color: "var(--green-700)", fontSize: 13 }}>← Danh sach khieu nai</Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Khieu nai #{dispute.id.slice(0, 8)}</h1>
        <span className={`badge badge-${dispute.status === "OPEN" ? "amber" : dispute.status === "RESOLVED" ? "green" : "neutral"}`}>
          {dispute.status}
        </span>
        {dispute.status === "OPEN" && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowResolve(true)}>Xu ly</button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        {/* Dispute info */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Thong tin khieu nai</div>
          <Row label="ID" value={dispute.id} mono />
          <Row label="Nguoi mo" value={dispute.opener ? `${dispute.opener.fullName} (${dispute.opener.role})` : dispute.openerId} />
          <Row label="Ngay mo" value={new Date(dispute.createdAt).toLocaleString("vi-VN")} />
          {dispute.resolvedAt && <Row label="Giai quyet" value={new Date(dispute.resolvedAt).toLocaleString("vi-VN")} />}
          {dispute.resolution && <Row label="Quyet dinh" value={dispute.resolution} />}

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: "var(--ink-500)", marginBottom: 4 }}>Ly do khieu nai</div>
            <div style={{ fontSize: 13, background: "var(--bg-soft)", borderRadius: 8, padding: 12 }}>{dispute.reason}</div>
          </div>

          {dispute.rationale && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "var(--ink-500)", marginBottom: 4 }}>Giai thich quyet dinh</div>
              <div style={{ fontSize: 13, background: "var(--green-50)", borderRadius: 8, padding: 12 }}>{dispute.rationale}</div>
            </div>
          )}
        </div>

        {/* Transaction context */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Thong tin giao dich</div>
          {txn.isLoading ? (
            <div style={{ color: "var(--ink-500)", fontSize: 13 }}>Dang tai...</div>
          ) : txn.data ? (
            <>
              <Row label="ID" value={txn.data.transaction.id} mono />
              <Row label="Listing" value={
                <Link href={`/admin/listings/${txn.data.transaction.listingId}`} style={{ color: "var(--green-700)" }}>
                  {txn.data.transaction.listingId}
                </Link>
              } />
              <Row label="Gia chot" value={formatVNDShort(txn.data.transaction.finalPrice)} />
              <Row label="Phi" value={formatVNDShort(txn.data.transaction.commission)} />
              <Row label="Trang thai" value={
                <span className={`badge badge-${txn.data.transaction.status === "BALANCE_HELD" ? "amber" : txn.data.transaction.status === "PAID_OUT" ? "green" : "red"}`}>
                  {txn.data.transaction.status}
                </span>
              } />
              <Row label="Buyer ID" value={txn.data.transaction.buyerId} mono />
              <Row label="Seller ID" value={txn.data.transaction.sellerId} mono />
            </>
          ) : (
            <div style={{ color: "var(--ink-400)", fontSize: 13 }}>Khong co thong tin giao dich.</div>
          )}
        </div>
      </div>

      {/* Evidence images */}
      {dispute.evidence && dispute.evidence.length > 0 && (
        <div className="card" style={{ padding: 20, marginTop: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Bang chung ({dispute.evidence.length})</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {dispute.evidence.map((key, i) => (
              <div key={i} style={{ background: "var(--bg-soft)", borderRadius: 8, padding: 12, fontSize: 12, fontFamily: "var(--font-mono)", wordBreak: "break-all", color: "var(--ink-600)" }}>
                {key}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-400)" }}>
            {/* NOTE: presigned URL for evidence requires useUploadSignGet or similar — not in BE scan */}
            Hien thi S3 keys (presigned URL chua duoc ho tro tu phia BE hien tai).
          </div>
        </div>
      )}

      {showResolve && (
        <ResolveModal dispute={dispute} onClose={() => setShowResolve(false)} />
      )}
    </div>
  );
}

function ResolveModal({ dispute, onClose }: { dispute: Dispute; onClose: () => void }) {
  const resolve = useResolveDispute();
  const [decision, setDecision] = useState<DisputeDecision>("REFUND_BUYER");
  const [splitPct, setSplitPct] = useState(50);
  const [rationale, setRationale] = useState("");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", zIndex: 100 }}>
      <div className="card" style={{ padding: 24, width: 500, background: "white" }}>
        <h3 style={{ marginTop: 0 }}>Xu ly khieu nai</h3>
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label className="label">Quyet dinh</label>
            <select className="input" value={decision} onChange={(e) => setDecision(e.target.value as DisputeDecision)}>
              <option value="REFUND_BUYER">REFUND_BUYER - Hoan tien nguoi mua</option>
              <option value="RELEASE_SELLER">RELEASE_SELLER - Giai phong cho nguoi ban</option>
              <option value="SPLIT">SPLIT - Chia tien</option>
            </select>
          </div>
          {decision === "SPLIT" && (
            <div>
              <label className="label">Ty le cho nguoi mua (1..99%)</label>
              <input type="number" className="input" value={splitPct} min={1} max={99}
                onChange={(e) => setSplitPct(Number(e.target.value))} />
            </div>
          )}
          <div>
            <label className="label">Giai thich (30-2000 ky tu)</label>
            <textarea className="input" rows={4} value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Neu ro ly do quyet dinh..." />
            <div style={{ fontSize: 11, color: rationale.length < 30 ? "var(--red-500)" : "var(--ink-400)", marginTop: 4 }}>
              {rationale.length}/2000 ky tu (toi thieu 30)
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Huy</button>
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
                alert(e instanceof ApiError ? e.message : "Loi xu ly");
              }
            }}
          >
            {resolve.isPending ? "Dang gui..." : "Xac nhan"}
          </button>
        </div>
      </div>
    </div>
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
