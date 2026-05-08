"use client";
import Link from "next/link";
import { useAdminSummary } from "@/hooks/api/admin";
import { useAdminKyc } from "@/hooks/api/users";
import { useAdminDisputes } from "@/hooks/api/disputes";
import { useAdminListings } from "@/hooks/api/listings";
import { useAdminTransactions } from "@/hooks/api/transactions";
import { useNotifications } from "@/hooks/api/notifications";
import { formatVNDShort } from "@/lib/format-bigint";

export default function AdminDashPage() {
  const { data, isLoading } = useAdminSummary("30d");
  const { data: kycData } = useAdminKyc({ status: "PENDING", limit: 1 });
  const { data: disputeData } = useAdminDisputes({ status: "OPEN", limit: 1 });
  const { data: pendingListings } = useAdminListings({ status: "DRAFT_SUBMITTED", limit: 1 });
  const { data: pendingPayoutTxns } = useAdminTransactions({ status: "RECEIPT_CONFIRMED", limit: 1 });
  const { data: notifs } = useNotifications({ limit: 5 });

  const kycCount = kycData?.items?.length ?? 0;
  const disputeCount = disputeData?.items?.length ?? 0;
  const listingCount = pendingListings?.items?.length ?? 0;
  const payoutCount = pendingPayoutTxns?.items?.length ?? 0;
  const todoTotal = kycCount + disputeCount + listingCount + payoutCount;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Tổng quan</h1>

      {/* 5 KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginTop: 24 }}>
        <Stat label="Tin đăng" value={isLoading ? "…" : String(data?.listingsCount ?? 0)} />
        <Stat label="Đề xuất giá" value={isLoading ? "…" : String(data?.offersCount ?? 0)} />
        <Stat label="Người mua" value={isLoading ? "…" : String(data?.buyersCount ?? 0)} />
        <Stat label="GMV tiềm năng" value={isLoading ? "…" : formatVNDShort(data?.gmvPotential ?? "0")} />
        <Stat label="GMV thực tế" value={isLoading ? "…" : formatVNDShort(data?.gmvRealized ?? "0")} highlight />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 28 }}>
        {/* Việc cần làm hôm nay */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
            Việc cần làm hôm nay
            {todoTotal > 0 && (
              <span style={{ marginLeft: 8, background: "var(--red-500)", color: "white", borderRadius: 99, padding: "2px 8px", fontSize: 12 }}>
                {todoTotal}
              </span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <TodoItem label="KYC chờ duyệt" count={kycCount} href="/dashboard/admin/kyc" />
            <TodoItem label="Tin đăng chờ duyệt" count={listingCount} href="/admin/listings" />
            <TodoItem label="Khiếu nại đang mở" count={disputeCount} href="/dashboard/admin/disputes" />
            <TodoItem label="Giao dịch chờ payout" count={payoutCount} href="/admin/escrow" />
          </div>
        </div>

        {/* Latest 5 notifications */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
            Thông báo mới nhất
          </div>
          {notifs?.items?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {notifs.items.map((n) => (
                <div key={n.id} style={{ fontSize: 13, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                  <div style={{ fontWeight: 600, color: n.readAt ? "var(--ink-700)" : "var(--ink-900)" }}>{n.title}</div>
                  {n.body && <div style={{ color: "var(--ink-500)", fontSize: 12 }}>{n.body}</div>}
                  <div style={{ color: "var(--ink-400)", fontSize: 11, marginTop: 2 }}>{n.createdAt.slice(0, 16).replace("T", " ")}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "var(--ink-500)", fontSize: 13 }}>Không có thông báo.</div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { label: "Quản lý tin đăng", href: "/admin/listings" },
          { label: "Người dùng", href: "/admin/users" },
          { label: "Bảo lãnh / Escrow", href: "/admin/escrow" },
          { label: "Báo cáo", href: "/admin/reports" },
          { label: "KYC", href: "/dashboard/admin/kyc" },
          { label: "Khiếu nại", href: "/dashboard/admin/disputes" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="btn btn-secondary btn-sm">{l.label}</Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="card" style={{ padding: 20, borderTop: highlight ? "3px solid var(--green-500)" : undefined }}>
      <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{label}</div>
      <div className="mono" style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: highlight ? "var(--green-700)" : undefined }}>
        {value}
      </div>
    </div>
  );
}

function TodoItem({ label, count, href }: { label: string; count: number; href: string }) {
  return (
    <Link href={href} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", color: "inherit", padding: "8px 0" }}>
      <span style={{ fontSize: 13 }}>{label}</span>
      <span style={{
        background: count > 0 ? "var(--amber-100)" : "var(--bg-soft)",
        color: count > 0 ? "var(--amber-700)" : "var(--ink-400)",
        borderRadius: 99,
        padding: "2px 10px",
        fontSize: 13,
        fontWeight: 700,
      }}>{count}</span>
    </Link>
  );
}
