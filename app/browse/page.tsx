"use client";
import Link from "next/link";
import { useListings } from "@/hooks/api/listings";
import { formatVNDShort, SEVERITY_LABELS } from "@/lib/format";
import type { Severity } from "@/types/api";

export default function BrowsePage() {
  const { data, isLoading, error } = useListings({ limit: 24 });
  const items = data?.items ?? [];

  return (
    <main className="container" style={{ padding: "32px 0" }}>
      <Link href="/" style={{ fontSize: 13, color: "var(--ink-500)" }}>← Trang chủ</Link>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 12 }}>
        Tìm xe ngập {isLoading ? "" : `(${items.length})`}
      </h1>
      {error && (
        <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 12 }}>
          Không tải được danh sách xe.
        </div>
      )}
      {isLoading && (
        <div style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 12 }}>Đang tải...</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 24 }}>
        {items.map(c => {
          const sev = SEVERITY_LABELS[c.severity as Severity];
          const listPrice = Number(c.listPrice);
          return (
            <Link key={c.id} href={`/cars/${c.id}`} className="card" style={{ overflow: "hidden", textDecoration: "none", color: "inherit" }}>
              <div style={{ height: 160, background: "linear-gradient(135deg, var(--green-200), var(--green-500))", position: "relative" }}>
                <span className={`badge badge-${sev.color}`} style={{ position: "absolute", top: 10, left: 10 }}>{sev.label}</span>
              </div>
              <div style={{ padding: 16 }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>{c.id}</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{c.brand} {c.model} {c.year}</div>
                <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 6 }}>
                  {c.mileage.toLocaleString("vi-VN")} km · {c.location}
                </div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--green-700)", marginTop: 10 }}>
                  {formatVNDShort(listPrice)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
