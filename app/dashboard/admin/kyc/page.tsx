"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, StatusBadge } from "@/components/dashboard/DataTable";
import { RequireRole } from "@/components/RequireRole";
import { useAdminKyc, useDecideKyc } from "@/hooks/api/users";
import type { KycRequestStatus } from "@/types/api";

export default function AdminKycPage() {
  return (
    <RequireRole roles={["ADMIN", "SUPER_ADMIN"]}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [status, setStatus] = useState<KycRequestStatus | "">("PENDING");
  const list = useAdminKyc({ status: status || undefined, limit: 50 });
  const decide = useDecideKyc();
  return (
    <>
      <PageHeader title="Duyệt KYC" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select className="input" style={{ width: 220 }} value={status} onChange={(e) => setStatus(e.target.value as KycRequestStatus | "")}>
          <option value="">Tất cả</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>
      <DataTable
        rows={list.data?.items}
        rowKey={(r) => r.id}
        isLoading={list.isLoading}
        columns={[
          { key: "id", header: "ID", render: (r) => <span className="mono">{r.id}</span> },
          { key: "user", header: "User", render: (r) => r.user ? `${r.user.fullName} (${r.user.phone})` : r.userId },
          { key: "front", header: "Ảnh trước", render: (r) => <code style={{ fontSize: 11 }}>{r.frontKey}</code> },
          { key: "selfie", header: "Selfie", render: (r) => <code style={{ fontSize: 11 }}>{r.selfieKey}</code> },
          { key: "status", header: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
          {
            key: "act",
            header: "",
            render: (r) =>
              r.status === "PENDING" ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => decide.mutate({ id: r.id, decision: "APPROVE" })}>
                    Duyệt
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const reason = prompt("Lý do từ chối (10..500):");
                      if (reason && reason.length >= 10) decide.mutate({ id: r.id, decision: "REJECT", reason });
                    }}
                  >
                    Từ chối
                  </button>
                </div>
              ) : null,
          },
        ]}
      />
    </>
  );
}
