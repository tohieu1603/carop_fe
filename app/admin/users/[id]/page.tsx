"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useAdminUsers } from "@/hooks/api/users";
import { useMyListings } from "@/hooks/api/listings";
import { formatVNDShort } from "@/lib/format-bigint";

// We fetch full list and filter by id since there's no GET /api/admin/users/:id endpoint
// Flag: GET /api/admin/users/:id — not in BE scan; using list+filter workaround

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // Fetch all users and find by id
  const { data, isLoading } = useAdminUsers({ limit: 100 });
  const user = data?.items?.find((u) => u.id === id);

  if (isLoading) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: "var(--ink-500)" }}>Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 32 }}>
        <Link href="/admin/users" style={{ color: "var(--green-700)", fontSize: 13 }}>← Quay lại</Link>
        <div style={{ marginTop: 16, color: "var(--red-600)" }}>Không tìm thấy người dùng.</div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/users" style={{ color: "var(--green-700)", fontSize: 13 }}>← Danh sách người dùng</Link>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 12 }}>{user.fullName}</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        {/* Profile card */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Thông tin tài khoản</div>
          <ProfileRow label="ID" value={user.id} mono />
          <ProfileRow label="Họ tên" value={user.fullName} />
          <ProfileRow label="SĐT" value={user.phone} mono />
          <ProfileRow label="Email" value={user.email || "—"} />
          <ProfileRow label="Vai trò" value={user.role} />
          <ProfileRow
            label="Trạng thái"
            value={
              <span className={`badge badge-${user.status === "ACTIVE" ? "green" : user.status === "BLOCKED" ? "red" : "amber"}`}>
                {user.status}
              </span>
            }
          />
          <ProfileRow
            label="KYC"
            value={
              <span className={`badge badge-${user.kycStatus === "APPROVED" ? "green" : user.kycStatus === "REJECTED" ? "red" : user.kycStatus === "NONE" ? "neutral" : "amber"}`}>
                {user.kycStatus}
              </span>
            }
          />
          <ProfileRow label="Ngày tham gia" value={new Date(user.createdAt).toLocaleDateString("vi-VN")} />
          <ProfileRow label="Cập nhật" value={new Date(user.updatedAt).toLocaleDateString("vi-VN")} />
        </div>

        {/* KYC + audit */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>KYC Status</div>
            <div style={{ fontSize: 13, color: "var(--ink-600)" }}>
              Trạng thái KYC: <b>{user.kycStatus}</b>
            </div>
            {user.kycStatus === "NONE" && (
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-400)" }}>Chưa nộp hồ sơ KYC.</div>
            )}
            {user.kycStatus === "PENDING" && (
              <div style={{ marginTop: 8 }}>
                <Link href="/dashboard/admin/kyc" className="btn btn-primary btn-sm">Duyệt KYC</Link>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Lịch sử audit</div>
            <div style={{ fontSize: 12, color: "var(--ink-400)" }}>
              {/* NOTE: GET /api/admin/users/:id/audit — not in BE scan; flagged missing */}
              Endpoint audit history chưa có trong BE. Hiển thị thông tin cơ bản:
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-600)" }}>
              Tạo: {new Date(user.createdAt).toLocaleString("vi-VN")}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-600)" }}>
              Cập nhật: {new Date(user.updatedAt).toLocaleString("vi-VN")}
            </div>
          </div>
        </div>
      </div>

      {/* Listings owned */}
      <UserListings userId={user.id} />
    </div>
  );
}

function UserListings({ userId }: { userId: string }) {
  // NOTE: GET /api/admin/users/:id/listings — not in BE; using /api/me/listings not accessible for admin
  // Using admin listings filter by seller is also not in BE scan. Flag: missing endpoint.
  const [shown, setShown] = useState(false);
  return (
    <div className="card" style={{ padding: 20, marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Tin đăng của người dùng</div>
        <button className="btn btn-secondary btn-sm" onClick={() => setShown(!shown)}>
          {shown ? "Ẩn" : "Xem"}
        </button>
      </div>
      {shown && (
        <div style={{ marginTop: 12, fontSize: 13, color: "var(--ink-400)" }}>
          {/* FLAG: No BE endpoint to list listings by userId as admin.
              Would need GET /api/admin/listings?sellerId=... which is not in be-scan */}
          Chức năng xem tin đăng theo user ID chưa được hỗ trợ bởi BE hiện tại.
          <br />
          <Link href={`/admin/listings`} style={{ color: "var(--green-700)" }}>Xem tất cả tin đăng →</Link>
        </div>
      )}
    </div>
  );
}

function ProfileRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
      <span style={{ color: "var(--ink-500)" }}>{label}</span>
      <span style={{ fontFamily: mono ? "var(--font-mono)" : undefined, textAlign: "right" }}>{value}</span>
    </div>
  );
}
