"use client";
import { useState } from "react";
import Link from "next/link";
import { RequireRole } from "@/components/RequireRole";
import { useInspectorRequests, useClaimInspection } from "@/hooks/api/inspections";
import { ApiError } from "@/lib/api/client";
import { StatusBadge } from "@/components/dashboard/DataTable";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function InspectorQueuePage() {
  return (
    <RequireRole roles={["INSPECTOR", "ADMIN", "SUPER_ADMIN"]}>
      <Inner />
    </RequireRole>
  );
}

function Inner() {
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const q = useInspectorRequests({ limit: 50, location: location || undefined });
  const claim = useClaimInspection();
  const items = q.data?.items ?? [];

  const handleClaim = async (id: string) => {
    try {
      await claim.mutateAsync({ id });
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Loi nhan yeu cau");
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <PageHeader
        title="Hang doi kiem dinh"
        subtitle={`${items.length} yeu cau`}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          className="input"
          style={{ width: 260 }}
          placeholder="Loc theo khu vuc..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {q.isLoading && <div style={{ color: "var(--ink-500)", fontSize: 13 }}>Dang tai...</div>}

      {!q.isLoading && items.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--ink-500)" }}>
          Khong co yeu cau nao.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((r) => (
          <div key={r.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {r.listing
                    ? `${r.listing.brand} ${r.listing.model} ${r.listing.year}`
                    : `Listing ${r.listingId}`}
                </div>
                {r.listing && (
                  <div style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 2 }}>
                    {r.listing.location} — Muc do: {r.listing.severity}
                  </div>
                )}
                <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                  ID: {r.id}
                </div>
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <StatusBadge value={r.status} />
                {r.scheduledAt && (
                  <div style={{ fontSize: 12, color: "var(--green-700)" }}>
                    Lich: {new Date(r.scheduledAt).toLocaleString("vi-VN")}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {r.status === "PENDING" && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleClaim(r.id)}
                  disabled={claim.isPending}
                >
                  Nhan yeu cau
                </button>
              )}
              {r.status === "ASSIGNED" && (
                <Link href={`/inspector/queue/${r.id}/report`} className="btn btn-primary btn-sm">
                  Gui bao cao
                </Link>
              )}
              {r.status === "DONE" && (
                <span style={{ fontSize: 13, color: "var(--green-600)" }}>Da hoan thanh</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
