"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/DataTable";
import {
  useTransaction,
  usePayBalance,
  useConfirmReceipt,
  useOpenDispute,
  useRunPayout,
} from "@/hooks/api/transactions";
import { HasRole } from "@/components/RequireRole";
import { useAuth } from "@/lib/auth";
import { formatVNDShort } from "@/lib/format-bigint";
import { ApiError } from "@/lib/api/client";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuth((s) => s.user);
  const { data, isLoading } = useTransaction(id);
  const pay = usePayBalance();
  const confirm = useConfirmReceipt();
  const dispute = useOpenDispute();
  const payout = useRunPayout();

  const [disputeOpen, setDisputeOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (isLoading) return <div>Đang tải…</div>;
  const t = data?.transaction;
  if (!t) return <div>Không tìm thấy giao dịch.</div>;

  const isBuyer = user?.id === t.buyerId;

  return (
    <>
      <PageHeader
        title={`Giao dịch ${t.id}`}
        subtitle={
          <>
            <StatusBadge value={t.status} /> · Listing {t.listingId}
          </>
        }
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            {isBuyer && t.status === "PENDING_BALANCE" && (
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  try {
                    const res = await pay.mutateAsync({ id });
                    if (res.payment.payUrl) window.location.href = res.payment.payUrl;
                  } catch (e) {
                    alert(e instanceof ApiError ? e.message : "Lỗi");
                  }
                }}
              >
                Thanh toán còn lại
              </button>
            )}
            {isBuyer && t.status === "BALANCE_HELD" && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (confirm.isPending) return;
                  if (window.confirm("Xác nhận đã nhận xe? Hành động này sẽ chuyển tiền cho người bán.")) {
                    confirm.mutate({ id });
                  }
                }}
              >
                Xác nhận đã nhận xe
              </button>
            )}
            {(t.status === "BALANCE_HELD" || t.status === "RECEIPT_CONFIRMED") && (
              <button className="btn btn-secondary btn-sm" onClick={() => setDisputeOpen(true)}>
                Mở khiếu nại
              </button>
            )}
            <HasRole roles={["ADMIN", "SUPER_ADMIN"]}>
              {t.status === "RECEIPT_CONFIRMED" && (
                <button className="btn btn-secondary btn-sm" onClick={() => payout.mutate({ id })}>
                  Chạy payout
                </button>
              )}
            </HasRole>
          </div>
        }
      />

      <div className="card" style={{ padding: 20, maxWidth: 720 }}>
        <Info label="Người mua" value={t.buyerId} />
        <Info label="Người bán" value={t.sellerId} />
        <Info label="Offer" value={t.offerId} />
        <Info label="Giá chốt" value={formatVNDShort(t.finalPrice)} />
        <Info label="Phí" value={formatVNDShort(t.commission)} />
        <Info label="Cọc" value={t.depositId || "—"} />
        <Info label="Đóng băng" value={t.frozen ? "Có" : "Không"} />
        <Info label="Tạo" value={t.createdAt.slice(0, 16).replace("T", " ")} />
        {t.paidOutAt && <Info label="Payout" value={t.paidOutAt.slice(0, 16).replace("T", " ")} />}
      </div>

      {disputeOpen && (
        <div
          role="dialog"
          aria-modal
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
          }}
        >
          <div className="card" style={{ padding: 24, width: 420, background: "white" }}>
            <h3 style={{ marginTop: 0 }}>Mở khiếu nại</h3>
            <textarea
              className="input"
              rows={5}
              placeholder="Mô tả lý do (tối thiểu 30 ký tự)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setDisputeOpen(false)}>
                Hủy
              </button>
              <button
                className="btn btn-primary btn-sm"
                disabled={dispute.isPending || reason.length < 30}
                onClick={async () => {
                  try {
                    await dispute.mutateAsync({ id, reason });
                    setDisputeOpen(false);
                    setReason("");
                  } catch (e) {
                    alert(e instanceof ApiError ? e.message : "Lỗi");
                  }
                }}
              >
                Gửi khiếu nại
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8, padding: "6px 0", fontSize: 14 }}>
      <span style={{ color: "var(--ink-500)" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
