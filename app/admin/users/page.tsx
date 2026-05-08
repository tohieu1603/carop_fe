"use client";
import { useState } from "react";
import { useAdminUsers, useBlockUser, useUnblockUser } from "@/hooks/api/users";
import { ApiError } from "@/lib/api/client";
import type { Role, UserStatus } from "@/types/api";

export default function AdminUsersPage() {
  const [role, setRole] = useState<Role | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [q, setQ] = useState("");
  const { data, isLoading, error } = useAdminUsers({
    role: role || undefined,
    status: status || undefined,
    q: q || undefined,
    limit: 50,
  });
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const items = data?.items ?? [];

  const handleBlock = async (id: string) => {
    const reason = prompt("Lý do khoá tài khoản:");
    if (!reason) return;
    try {
      await blockUser.mutateAsync({ id, reason });
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Lỗi khoá tài khoản");
    }
  };

  const handleUnblock = async (id: string) => {
    if (!confirm("Mở khoá tài khoản này?")) return;
    try {
      await unblockUser.mutateAsync({ id });
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Lỗi mở khoá");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
        Người dùng {isLoading ? "" : `(${items.length})`}
      </h1>

      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <input
          className="input"
          style={{ width: 260 }}
          placeholder="Tìm theo tên, SĐT..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input" style={{ width: 180 }} value={role} onChange={(e) => setRole(e.target.value as Role | "")}>
          <option value="">Tất cả vai trò</option>
          <option value="BUYER">BUYER</option>
          <option value="SELLER">SELLER</option>
          <option value="INSPECTOR">INSPECTOR</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        </select>
        <select className="input" style={{ width: 180 }} value={status} onChange={(e) => setStatus(e.target.value as UserStatus | "")}>
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="BLOCKED">BLOCKED</option>
          <option value="PENDING_OTP">PENDING_OTP</option>
        </select>
      </div>

      {error && (
        <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 16 }}>Không tải được dữ liệu.</div>
      )}
      {isLoading && (
        <div style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 16 }}>Đang tải...</div>
      )}
      <table style={{ width: "100%", marginTop: 16, background: "white", borderRadius: 12, overflow: "hidden", borderCollapse: "collapse", fontSize: 13 }}>
        <thead style={{ background: "var(--bg-soft)", textAlign: "left" }}>
          <tr>
            <th style={th}>ID</th>
            <th style={th}>Tên</th>
            <th style={th}>SĐT</th>
            <th style={th}>Vai trò</th>
            <th style={th}>Trạng thái</th>
            <th style={th}>KYC</th>
            <th style={th}>Tham gia</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {items.map(u => (
            <tr key={u.id} style={{ borderTop: "1px solid var(--border)" }}>
              <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 11 }}>{u.id}</td>
              <td style={td}>{u.fullName}</td>
              <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{u.phone}</td>
              <td style={td}>{u.role}</td>
              <td style={td}>
                <span className={`badge badge-${u.status === "ACTIVE" ? "green" : u.status === "BLOCKED" ? "red" : "amber"}`}>
                  {u.status}
                </span>
              </td>
              <td style={td}>
                <span className={`badge badge-${u.kycStatus === "APPROVED" ? "green" : u.kycStatus === "REJECTED" ? "red" : u.kycStatus === "NONE" ? "neutral" : "amber"}`}>
                  {u.kycStatus}
                </span>
              </td>
              <td style={td}>{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
              <td style={td}>
                <div style={{ display: "flex", gap: 6 }}>
                  {u.status !== "BLOCKED" ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, padding: "4px 10px" }}
                      onClick={() => handleBlock(u.id)}
                      disabled={blockUser.isPending}
                    >
                      Khoá
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: 11, padding: "4px 10px" }}
                      onClick={() => handleUnblock(u.id)}
                      disabled={unblockUser.isPending}
                    >
                      Mở khoá
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = { padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--ink-500)", textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "12px 16px" };
