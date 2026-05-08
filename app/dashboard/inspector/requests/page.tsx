"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, StatusBadge } from "@/components/dashboard/DataTable";
import { RequireRole } from "@/components/RequireRole";
import {
  useClaimInspection,
  useInspectorRequests,
  useSubmitInspectionReport,
} from "@/hooks/api/inspections";
import { ApiError } from "@/lib/api/client";
import type { InspectionRequest } from "@/types/api";

export default function InspectorRequestsPage() {
  return (
    <RequireRole roles={["INSPECTOR", "ADMIN", "SUPER_ADMIN"]}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [location, setLocation] = useState("");
  const q = useInspectorRequests({ limit: 50, location: location || undefined });
  const claim = useClaimInspection();
  const [reportFor, setReportFor] = useState<InspectionRequest | null>(null);

  return (
    <>
      <PageHeader title="Yêu cầu kiểm định" />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          className="input"
          style={{ width: 260 }}
          placeholder="Lọc theo khu vực"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <DataTable
        rows={q.data?.items}
        rowKey={(r) => r.id}
        isLoading={q.isLoading}
        empty="Chưa có yêu cầu nào."
        columns={[
          { key: "id", header: "Mã", render: (r) => <span className="mono">{r.id}</span> },
          { key: "listing", header: "Listing", render: (r) => r.listing ? `${r.listing.brand} ${r.listing.model} ${r.listing.year} (${r.listing.location})` : r.listingId },
          { key: "status", header: "Trạng thái", render: (r) => <StatusBadge value={r.status} /> },
          { key: "sched", header: "Lịch", render: (r) => r.scheduledAt?.slice(0, 16).replace("T", " ") || "—" },
          {
            key: "act",
            header: "",
            render: (r) => (
              <div style={{ display: "flex", gap: 6 }}>
                {r.status === "PENDING" && (
                  <button className="btn btn-secondary btn-sm" onClick={() => claim.mutate({ id: r.id })}>
                    Nhận
                  </button>
                )}
                {r.status === "ASSIGNED" && (
                  <button className="btn btn-primary btn-sm" onClick={() => setReportFor(r)}>
                    Gửi báo cáo
                  </button>
                )}
              </div>
            ),
          },
        ]}
      />
      {reportFor && <ReportDialog request={reportFor} onClose={() => setReportFor(null)} />}
    </>
  );
}

function ReportDialog({ request, onClose }: { request: InspectionRequest; onClose: () => void }) {
  const submit = useSubmitInspectionReport();
  const [score, setScore] = useState(80);
  const [approved, setApproved] = useState(true);
  const [notes, setNotes] = useState("");
  const [repairs, setRepairs] = useState("");
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "grid",
        placeItems: "center",
        zIndex: 100,
      }}
    >
      <div className="card" style={{ padding: 24, width: 480, background: "white" }}>
        <h3 style={{ marginTop: 0 }}>Báo cáo kiểm định #{request.id}</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <label className="label">Điểm (0..100)</label>
            <input
              type="number"
              className="input"
              value={score}
              min={0}
              max={100}
              onChange={(e) => setScore(Number(e.target.value))}
            />
          </div>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} />
            Phê duyệt cho lên sàn
          </label>
          <div>
            <label className="label">Sửa chữa (mỗi mục tách bằng dấu phẩy)</label>
            <input className="input" value={repairs} onChange={(e) => setRepairs(e.target.value)} />
          </div>
          <div>
            <label className="label">Ghi chú</label>
            <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn btn-primary btn-sm"
            disabled={submit.isPending}
            onClick={async () => {
              try {
                await submit.mutateAsync({
                  id: request.id,
                  body: {
                    score,
                    approved,
                    repairs: repairs.split(",").map((s) => s.trim()).filter(Boolean),
                    notes: notes || undefined,
                  },
                });
                onClose();
              } catch (e) {
                alert(e instanceof ApiError ? e.message : "Lỗi");
              }
            }}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
