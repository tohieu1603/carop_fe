"use client";
import Link from "next/link";
import { useState } from "react";
import { useListings } from "@/hooks/api/listings";
import { formatVNDShort, SEVERITY_LABELS } from "@/lib/format";
import type { Severity } from "@/types/api";

const BRANDS = ["Toyota", "Honda", "Mazda", "Hyundai", "Kia", "Ford", "Mitsubishi", "Suzuki", "Nissan", "Chevrolet"];

export default function BrowsePage() {
  const [brand, setBrand] = useState("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [sort, setSort] = useState<"newest" | "priceAsc" | "priceDesc" | "">("");
  const [q, setQ] = useState("");

  const { data, isLoading, error } = useListings({
    limit: 24,
    brand: brand || undefined,
    severity: severity || undefined,
    sort: sort || undefined,
    q: q || undefined,
  });
  const items = data?.items ?? [];

  return (
    <main className="container" style={{ padding: "32px 0" }}>
      <Link href="/" style={{ fontSize: 13, color: "var(--ink-500)" }}>← Trang chủ</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>
          Tìm xe ngập {isLoading ? "" : `(${items.length})`}
        </h1>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <input
          className="input"
          style={{ width: 260 }}
          placeholder="Tìm theo tên, VIN..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input" style={{ width: 180 }} value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">Tất cả hãng</option>
          {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="input" style={{ width: 180 }} value={severity} onChange={(e) => setSeverity(e.target.value as Severity | "")}>
          <option value="">Tất cả mức ngập</option>
          <option value="low">Ngập nhẹ</option>
          <option value="medium">Ngập vừa</option>
          <option value="high">Ngập nặng</option>
        </select>
        <select className="input" style={{ width: 200 }} value={sort} onChange={(e) => setSort(e.target.value as "newest" | "priceAsc" | "priceDesc" | "")}>
          <option value="">Mặc định</option>
          <option value="newest">Mới nhất</option>
          <option value="priceAsc">Giá tăng dần</option>
          <option value="priceDesc">Giá giảm dần</option>
        </select>
        {(brand || severity || sort || q) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setBrand(""); setSeverity(""); setSort(""); setQ(""); }}
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {error && (
        <div style={{ color: "var(--red-600)", fontSize: 14, marginTop: 12 }}>
          Không tải được danh sách xe.
        </div>
      )}
      {isLoading && (
        <div style={{ color: "var(--ink-500)", fontSize: 14, marginTop: 12 }}>Đang tải...</div>
      )}

      {!isLoading && items.length === 0 && (
        <div style={{ marginTop: 40, textAlign: "center", color: "var(--ink-500)" }}>
          Không tìm thấy xe phù hợp.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 24 }}>
        {items.map(c => {
          const sev = SEVERITY_LABELS[c.severity as Severity];
          const listPrice = Number(c.listPrice);
          return (
            <Link key={c.id} href={`/cars/${c.id}`} className="card" style={{ overflow: "hidden", textDecoration: "none", color: "inherit" }}>
              <div style={{ height: 160, background: `linear-gradient(135deg, ${sev.color === "red" ? "oklch(0.4 0.05 25), oklch(0.32 0.04 30)" : sev.color === "amber" ? "oklch(0.45 0.05 60), oklch(0.38 0.04 70)" : "var(--green-200), var(--green-500)"})`, position: "relative" }}>
                <span className={`badge badge-${sev.color}`} style={{ position: "absolute", top: 10, left: 10 }}>{sev.label}</span>
                {c.inspectionScore && (
                  <span className="badge badge-neutral" style={{ position: "absolute", top: 10, right: 10 }}>
                    {c.inspectionScore}/100
                  </span>
                )}
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
                {c.offerCount > 0 && (
                  <div style={{ fontSize: 11, color: "var(--amber-600)", marginTop: 4 }}>
                    {c.offerCount} người quan tâm
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
