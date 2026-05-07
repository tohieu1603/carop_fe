"use client";
import { useAdminUsers, useBlockUser } from "@/hooks/api/users";

export default function AdminUsersPage() {
  const { data, isLoading, error } = useAdminUsers();
  const blockUser = useBlockUser();
  const items = data?.items ?? [];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
        Người dùng {isLoading ? "" : `(${items.length})`}
      </h1>
      {error && (
        <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 16 }}>Không tải được dữ liệu.</div>
      )}
      {isLoading && (
        <div style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 16 }}>Đang tải...</div>
      )}
      <table style={{ width: "100%", marginTop: 24, background: "white", borderRadius: 12, overflow: "hidden", borderCollapse: "collapse", fontSize: 13 }}>
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
              <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{u.id.slice(0, 8)}</td>
              <td style={td}>{u.fullName}</td>
              <td style={td}>{u.phone}</td>
              <td style={td}>{u.role}</td>
              <td style={td}>
                <span className={`badge badge-${u.status === "ACTIVE" ? "green" : u.status === "BLOCKED" ? "red" : "amber"}`}>
                  {u.status}
                </span>
              </td>
              <td style={td}>
                <span className={`badge badge-${u.kycStatus === "APPROVED" ? "green" : u.kycStatus === "REJECTED" ? "red" : "amber"}`}>
                  {u.kycStatus}
                </span>
              </td>
              <td style={td}>{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
              <td style={td}>
                {u.status !== "BLOCKED" && (
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: "4px 10px" }}
                    onClick={() => blockUser.mutate({ id: u.id, reason: "Admin block" })}
                    disabled={blockUser.isPending}
                  >
                    Block
                  </button>
                )}
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
