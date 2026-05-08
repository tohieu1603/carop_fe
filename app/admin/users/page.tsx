"use client";
import { useState } from "react";
import Link from "next/link";
import { useAdminUsers, useBlockUser, useUnblockUser } from "@/hooks/api/users";
import { ApiError } from "@/lib/api/client";
import type { Role, UserStatus } from "@/types/api";

const REASON_MIN = 10;

export default function AdminUsersPage() {
  const [role, setRole] = useState<Role | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const { data, isLoading, error } = useAdminUsers({
    role: role || undefined,
    status: status || undefined,
    q: q || undefined,
    cursor,
    limit: 50,
  });
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const items = data?.items ?? [];

  const handleBlock = async (id: string) => {
    const reason = prompt(`Ly do khoa tai khoan (toi thieu ${REASON_MIN} ky tu):`);
    if (!reason) return;
    if (reason.length < REASON_MIN) {
      alert(`Ly do phai co it nhat ${REASON_MIN} ky tu.`);
      return;
    }
    try {
      await blockUser.mutateAsync({ id, reason });
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Loi khoa tai khoan");
    }
  };

  const handleUnblock = async (id: string) => {
    if (!confirm("Mo khoa tai khoan nay?")) return;
    try {
      await unblockUser.mutateAsync({ id });
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Loi mo khoa");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
        Nguoi dung {isLoading ? "" : `(${items.length})`}
      </h1>

      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <input
          className="input"
          style={{ width: 260 }}
          placeholder="Tim theo ten, SDT..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setCursor(undefined); }}
        />
        <select className="input" style={{ width: 180 }} value={role} onChange={(e) => { setRole(e.target.value as Role | ""); setCursor(undefined); }}>
          <option value="">Tat ca vai tro</option>
          <option value="BUYER">BUYER</option>
          <option value="SELLER">SELLER</option>
          <option value="INSPECTOR">INSPECTOR</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
        </select>
        <select className="input" style={{ width: 180 }} value={status} onChange={(e) => { setStatus(e.target.value as UserStatus | ""); setCursor(undefined); }}>
          <option value="">Tat ca trang thai</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="BLOCKED">BLOCKED</option>
          <option value="PENDING_OTP">PENDING_OTP</option>
        </select>
      </div>

      {error && (
        <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 16 }}>Khong tai duoc du lieu.</div>
      )}
      {isLoading && (
        <div style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 16 }}>Dang tai...</div>
      )}
      <table style={{ width: "100%", marginTop: 16, background: "white", borderRadius: 12, overflow: "hidden", borderCollapse: "collapse", fontSize: 13 }}>
        <thead style={{ background: "var(--bg-soft)", textAlign: "left" }}>
          <tr>
            <th style={th}>ID</th>
            <th style={th}>Ten</th>
            <th style={th}>SDT</th>
            <th style={th}>Vai tro</th>
            <th style={th}>Trang thai</th>
            <th style={th}>KYC</th>
            <th style={th}>Tham gia</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {items.map(u => (
            <tr
              key={u.id}
              style={{ borderTop: "1px solid var(--border)", cursor: "pointer" }}
              onClick={(e) => {
                // Don't navigate if clicking action buttons
                if ((e.target as HTMLElement).closest("button")) return;
                window.location.href = `/admin/users/${u.id}`;
              }}
            >
              <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                <Link href={`/admin/users/${u.id}`} style={{ color: "var(--green-700)" }} onClick={(e) => e.stopPropagation()}>
                  {u.id.slice(0, 8)}…
                </Link>
              </td>
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
              <td style={td} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", gap: 6 }}>
                  <Link href={`/admin/users/${u.id}`} className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: "4px 10px" }}>
                    Chi tiet
                  </Link>
                  {u.status !== "BLOCKED" ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, padding: "4px 10px" }}
                      onClick={() => handleBlock(u.id)}
                      disabled={blockUser.isPending}
                    >
                      Khoa
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: 11, padding: "4px 10px" }}
                      onClick={() => handleUnblock(u.id)}
                      disabled={unblockUser.isPending}
                    >
                      Mo khoa
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <button
          className="btn btn-secondary btn-sm"
          disabled={!cursor}
          onClick={() => setCursor(undefined)}
        >
          Trang dau
        </button>
        <span style={{ fontSize: 13, color: "var(--ink-500)" }}>
          Hien thi {items.length} ket qua
        </span>
        {data?.nextCursor && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setCursor(String(data.nextCursor))}
          >
            Trang sau →
          </button>
        )}
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "12px 16px", fontSize: 11, fontWeight: 600, color: "var(--ink-500)", textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "12px 16px" };
