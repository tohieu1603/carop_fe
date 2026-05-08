"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, StatusBadge } from "@/components/dashboard/DataTable";
import { RequireRole } from "@/components/RequireRole";
import { useAdminUsers, useBlockUser, useUnblockUser } from "@/hooks/api/users";
import { ApiError } from "@/lib/api/client";
import type { Role, UserStatus } from "@/types/api";

export default function AdminUsersPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [role, setRole] = useState<Role | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [q, setQ] = useState("");
  const list = useAdminUsers({ role: role || undefined, status: status || undefined, q: q || undefined, limit: 50 });
  const block = useBlockUser();
  const unblock = useUnblockUser();
  return (
    <>
      <PageHeader title="Người dùng" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input className="input" placeholder="Tìm theo tên/SĐT" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 260 }} />
        <select className="input" style={{ width: 180 }} value={role} onChange={(e) => setRole(e.target.value as Role | "")}>
          <option value="">Tất cả vai trò</option>
          {(["BUYER", "SELLER", "INSPECTOR", "ADMIN", "SUPER_ADMIN"] as Role[]).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select className="input" style={{ width: 180 }} value={status} onChange={(e) => setStatus(e.target.value as UserStatus | "")}>
          <option value="">Tất cả trạng thái</option>
          {(["PENDING_OTP", "ACTIVE", "BLOCKED"] as UserStatus[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        rows={list.data?.items}
        rowKey={(u) => u.id}
        isLoading={list.isLoading}
        columns={[
          { key: "id", header: "ID", render: (u) => <span className="mono">{u.id}</span> },
          { key: "name", header: "Họ tên", render: (u) => u.fullName },
          { key: "phone", header: "SĐT", render: (u) => u.phone },
          { key: "role", header: "Vai trò", render: (u) => <span className="badge badge-blue">{u.role}</span> },
          { key: "status", header: "Trạng thái", render: (u) => <StatusBadge value={u.status} /> },
          { key: "kyc", header: "KYC", render: (u) => <StatusBadge value={u.kycStatus} /> },
          {
            key: "act",
            header: "",
            render: (u) => {
              const onErr = (label: string) => (e: unknown) => {
                alert(e instanceof ApiError ? `${label}: ${e.message}` : `${label}: lỗi`);
              };
              return u.status === "BLOCKED" ? (
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={unblock.isPending}
                  onClick={() => unblock.mutate({ id: u.id }, { onError: onErr("Mở khóa") })}
                >
                  Mở khóa
                </button>
              ) : (
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={block.isPending}
                  onClick={() => {
                    const r = prompt("Lý do khóa (tối thiểu 10 ký tự):");
                    if (!r) return;
                    if (r.length < 10) {
                      alert("Lý do phải có ít nhất 10 ký tự.");
                      return;
                    }
                    block.mutate({ id: u.id, reason: r }, { onError: onErr("Khóa") });
                  }}
                >
                  Khóa
                </button>
              );
            },
          },
        ]}
      />
    </>
  );
}
