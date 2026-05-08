"use client";
import { useState } from "react";
import { useAdminSummary, useAdminFunnel } from "@/hooks/api/admin";
import { useAdminTransactions } from "@/hooks/api/transactions";
import { useAdminListings } from "@/hooks/api/listings";
import { formatVNDShort } from "@/lib/format-bigint";

type Range = "7d" | "30d" | "90d";

function rangeToFromTo(range: Range): { from: string; to: string } {
  const today = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const from = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  return {
    from: from.toISOString().split("T")[0],
    to: today.toISOString().split("T")[0],
  };
}

export default function AdminReportsPage() {
  const [range, setRange] = useState<Range>("30d");
  const { from, to } = rangeToFromTo(range);

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useAdminSummary(range);
  const { data: funnel, isLoading: funnelLoading } = useAdminFunnel(from, to);
  const { data: txns } = useAdminTransactions({ limit: 10 });
  const { data: listings } = useAdminListings({ limit: 5 });

  const topListings = listings?.items?.slice(0, 5) ?? [];
  const recentTxns = txns?.items?.slice(0, 10) ?? [];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Báo cáo</h1>
        <div style={{ display: "flex", gap: 6 }}>
          {(["7d", "30d", "90d"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                border: "1px solid var(--border)",
                background: range === r ? "var(--green-700)" : "white",
                color: range === r ? "white" : "var(--ink-700)",
                cursor: "pointer",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {summaryError && (
        <div style={{ color: "var(--red-600)", fontSize: 14, marginBottom: 16 }}>Không tải được dữ liệu.</div>
      )}

      {/* 5 KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        <KpiCard label="Tin đăng" value={summaryLoading ? "…" : String(summary?.listingsCount ?? 0)} />
        <KpiCard label="Đề xuất giá" value={summaryLoading ? "…" : String(summary?.offersCount ?? 0)} />
        <KpiCard label="Người mua" value={summaryLoading ? "…" : String(summary?.buyersCount ?? 0)} />
        <KpiCard label="GMV tiềm năng" value={summaryLoading ? "…" : formatVNDShort(summary?.gmvPotential ?? "0")} />
        <KpiCard label="GMV thực tế" value={summaryLoading ? "…" : formatVNDShort(summary?.gmvRealized ?? "0")} highlight />
      </div>

      {/* Conversion rate */}
      {!summaryLoading && summary && (
        <div className="card" style={{ padding: 16, marginTop: 16, display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Tỷ lệ GMV realized / potential</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>
              {Number(summary.gmvPotential) > 0
                ? ((Number(summary.gmvRealized) / Number(summary.gmvPotential)) * 100).toFixed(1)
                : "0.0"}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Offers / Listings</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>
              {summary.listingsCount > 0
                ? (summary.offersCount / summary.listingsCount).toFixed(1)
                : "0.0"} avg
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Kỳ</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{range}</div>
          </div>
        </div>
      )}

      {/* Funnel */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 36, marginBottom: 12 }}>
        Phễu chuyển đổi ({range})
      </h2>
      {funnelLoading && <div style={{ color: "var(--ink-500)", fontSize: 14 }}>Đang tải...</div>}
      {funnel && funnel.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
          {funnel.map((step) => (
            <div key={step.name} className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {step.name}
              </div>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{step.count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Top 5 listings */}
      {topListings.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 36, marginBottom: 12 }}>Top tin đăng</h2>
          <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead style={{ background: "var(--bg-soft)" }}>
                <tr>
                  {["Xe", "Giá niêm yết", "Offer cao nhất", "Lượt xem", "Trạng thái"].map((h) => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topListings.map((l) => (
                  <tr key={l.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={td}>{l.brand} {l.model} {l.year}</td>
                    <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{formatVNDShort(l.listPrice)}</td>
                    <td style={{ ...td, fontFamily: "var(--font-mono)", color: "var(--green-700)" }}>
                      {l.topOffer ? formatVNDShort(l.topOffer) : "—"}
                    </td>
                    <td style={td}>{l.views.toLocaleString("vi-VN")}</td>
                    <td style={td}><span className={`badge badge-${l.status === "ACTIVE" || l.status === "HAS_BUYERS" ? "green" : "neutral"}`}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Recent transactions */}
      {recentTxns.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 36, marginBottom: 12 }}>Giao dịch gần đây</h2>
          <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead style={{ background: "var(--bg-soft)" }}>
                <tr>
                  {["ID", "Listing", "Giá chốt", "Phí", "Trạng thái", "Ngày"].map((h) => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTxns.map((t) => (
                  <tr key={t.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 11 }}>{t.id}</td>
                    <td style={td}>{t.listingId}</td>
                    <td style={{ ...td, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{formatVNDShort(t.finalPrice)}</td>
                    <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{formatVNDShort(t.commission)}</td>
                    <td style={td}>
                      <span className={`badge badge-${t.status === "PAID_OUT" ? "green" : t.status === "DISPUTED" ? "red" : "amber"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ ...td, color: "var(--ink-500)", fontSize: 11 }}>{t.createdAt.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="card" style={{ padding: 20, borderTop: highlight ? "3px solid var(--green-500)" : undefined }}>
      <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{label}</div>
      <div className="mono" style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: highlight ? "var(--green-700)" : undefined }}>
        {value}
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--ink-500)", textTransform: "uppercase", textAlign: "left" };
const td: React.CSSProperties = { padding: "10px 14px" };
