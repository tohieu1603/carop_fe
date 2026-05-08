"use client";
import { useState } from "react";
import { useAdminKyc, useDecideKyc } from "@/hooks/api/users";
import { ApiError } from "@/lib/api/client";
import type { KycRequest, KycRequestStatus } from "@/types/api";

export default function AdminKycPage() {
  const [status, setStatus] = useState<KycRequestStatus | "">("PENDING");
  const [selectedKyc, setSelectedKyc] = useState<KycRequest | null>(null);
  const { data, isLoading, error } = useAdminKyc({ status: status || undefined, limit: 50 });
  const decide = useDecideKyc();
  const items = data?.items ?? [];

  const handleDecide = async (id: string, decision: "APPROVE" | "REJECT", reason?: string) => {
    try {
      await decide.mutateAsync({ id, decision, reason });
      setSelectedKyc(null);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Loi xu ly KYC");
    }
  };

  const chips: Array<{ label: string; value: KycRequestStatus | "" }> = [
    { label: "Tat ca", value: "" },
    { label: "PENDING", value: "PENDING" },
    { label: "APPROVED", value: "APPROVED" },
    { label: "REJECTED", value: "REJECTED" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Duyet KYC</h1>

      <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
        {chips.map((c) => (
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

      {error && <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 16 }}>Khong tai duoc du lieu.</div>}
      {isLoading && <div style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 16 }}>Dang tai...</div>}

      {!isLoading && items.length === 0 && (
        <div className="card" style={{ padding: 40, marginTop: 24, textAlign: "center", color: "var(--ink-500)" }}>
          Khong co ho so KYC nao.
        </div>
      )}

      {items.length > 0 && (
        <table style={{ width: "100%", marginTop: 16, background: "white", borderRadius: 12, overflow: "hidden", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "var(--bg-soft)", textAlign: "left" }}>
            <tr>
              {["ID", "Nguoi dung", "Ngay nop", "Trang thai", ""].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((k) => (
              <tr key={k.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 11 }}>{k.id.slice(0, 8)}...</td>
                <td style={td}>{k.user ? `${k.user.fullName} (${k.user.phone})` : k.userId}</td>
                <td style={{ ...td, fontSize: 11 }}>{new Date(k.createdAt).toLocaleDateString("vi-VN")}</td>
                <td style={td}>
                  <span className={`badge badge-${k.status === "APPROVED" ? "green" : k.status === "REJECTED" ? "red" : "amber"}`}>
                    {k.status}
                  </span>
                </td>
                <td style={td}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedKyc(k)}>
                    Xem anh
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedKyc && (
        <KycModal
          kyc={selectedKyc}
          onClose={() => setSelectedKyc(null)}
          onApprove={(id) => handleDecide(id, "APPROVE")}
          onReject={(id, reason) => handleDecide(id, "REJECT", reason)}
          deciding={decide.isPending}
        />
      )}
    </div>
  );
}

function KycModal({
  kyc,
  onClose,
  onApprove,
  onReject,
  deciding,
}: {
  kyc: KycRequest;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  deciding: boolean;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 100 }}>
      <div className="card" style={{ width: 600, maxHeight: "90vh", overflowY: "auto", background: "white", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Ho so KYC</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>x</button>
        </div>

        {kyc.user && (
          <div style={{ background: "var(--bg-soft)", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13 }}>
            <b>{kyc.user.fullName}</b> — {kyc.user.phone} — {kyc.user.role}
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          <KeyCard label="CCCD Mat truoc" s3Key={kyc.frontKey} />
          <KeyCard label="CCCD Mat sau" s3Key={kyc.backKey} />
          <KeyCard label="Selfie" s3Key={kyc.selfieKey} />
        </div>

        <div style={{ marginTop: 16, padding: 12, background: "var(--bg-soft)", borderRadius: 8, fontSize: 13 }}>
          <div>Trang thai: <span className={`badge badge-${kyc.status === "APPROVED" ? "green" : kyc.status === "REJECTED" ? "red" : "amber"}`}>{kyc.status}</span></div>
          {kyc.decidedAt && (
            <div style={{ marginTop: 4, color: "var(--ink-500)" }}>
              Quyet dinh luc: {new Date(kyc.decidedAt).toLocaleString("vi-VN")}
            </div>
          )}
          {kyc.reason && (
            <div style={{ marginTop: 4, color: "var(--red-600)" }}>Ly do tu choi: {kyc.reason}</div>
          )}
          {kyc.reviewerId && (
            <div style={{ marginTop: 4, color: "var(--ink-500)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
              Reviewer: {kyc.reviewerId}
            </div>
          )}
        </div>

        {kyc.status === "PENDING" && (
          <div style={{ marginTop: 16 }}>
            {!showReject ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-sm" disabled={deciding} onClick={() => onApprove(kyc.id)}>
                  Duyet
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowReject(true)}>
                  Tu choi
                </button>
              </div>
            ) : (
              <div>
                <label className="label">Ly do tu choi (10-500 ky tu)</label>
                <textarea
                  className="input"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhap ly do tu choi..."
                />
                <div style={{ fontSize: 11, color: rejectReason.length < 10 ? "var(--red-500)" : "var(--ink-400)", marginTop: 4 }}>
                  {rejectReason.length}/500 ky tu (toi thieu 10)
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={deciding || rejectReason.length < 10}
                    onClick={() => onReject(kyc.id, rejectReason)}
                  >
                    Xac nhan tu choi
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowReject(false)}>Huy</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function KeyCard({ label, s3Key }: { label: string; s3Key: string }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--ink-600)" }}>{label}</div>
      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-700)", wordBreak: "break-all", background: "var(--bg-soft)", padding: 8, borderRadius: 6 }}>
        {s3Key}
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 4 }}>
        {/* FLAG: GET presigned URL endpoint not in BE scan. Images displayed as S3 keys only. */}
        Presigned URL BE chua ho tro — hien thi S3 key.
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--ink-500)", textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "10px 14px" };
