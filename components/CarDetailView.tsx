"use client";
import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { formatVND, formatVNDShort, SEVERITY_LABELS } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { CarImage } from "@/components/CarCard";
import { VINHistory, PriceComparison } from "@/components/CarHistory";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import type { Listing } from "@/types/api";

interface Props { car: Listing; offerCount?: number; }

export function CarDetailView({ car, offerCount = 0 }: Props) {
  const [tab, setTab] = useState<"damage" | "specs" | "vin" | "compare">("damage");
  const openOffer = useAppStore((s) => s.openOfferModal);
  const sev = SEVERITY_LABELS[car.severity];
  const listPrice = Number(car.listPrice);
  const originalPrice = Number(car.originalPrice);
  const title = `${car.brand} ${car.model} ${car.year}`;

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ padding: "24px 24px 64px" }}>
        <Link href="/browse" style={{ fontSize: 13, color: "var(--ink-500)", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <Icon.ChevronLeft size={14}/> Quay lại danh sách
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>
          <div>
            <div style={{ marginBottom: 24 }}><CarImage car={car} ratio="16/9"/></div>

            <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h1>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <span className={`badge badge-${sev.color}`}>{sev.label} · {car.floodDepthCm}cm</span>
              <span className="badge badge-neutral">Năm {car.year}</span>
              <span className="badge badge-neutral">{car.transmission}</span>
              <span className="badge badge-neutral">{car.fuel}</span>
              <span className="badge badge-neutral">{car.mileage.toLocaleString("vi-VN")} km</span>
            </div>
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)", marginBottom: 24 }}>{car.id} · VIN {car.vin}</div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--bg-soft)", borderRadius: 10, marginBottom: 16, width: "fit-content" }}>
              {[
                { id: "damage" as const, l: "Tình trạng" },
                { id: "specs" as const, l: "Thông số" },
                { id: "vin" as const, l: "Lịch sử VIN" },
                { id: "compare" as const, l: "So sánh giá" },
              ].map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                  background: tab === t.id ? "white" : "transparent",
                  color: tab === t.id ? "var(--ink-900)" : "var(--ink-500)",
                  boxShadow: tab === t.id ? "var(--shadow-sm)" : "none",
                }}>{t.l}</button>
              ))}
            </div>

            {tab === "damage" && (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Tình trạng & sửa chữa</h3>
                {Object.entries(car.damage as Record<string, string>).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                    <span style={{ color: "var(--ink-500)" }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{String(v)}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, fontSize: 13, color: "var(--ink-600)" }}>
                  <b>Đã sửa chữa:</b> {car.repairs.join(" · ")}
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: "var(--ink-600)" }}>{car.description}</div>
              </div>
            )}

            {tab === "specs" && (
              <div className="card" style={{ padding: 20 }}>
                {[
                  ["Hãng / Model", `${car.brand} ${car.model}`],
                  ["Năm sản xuất", String(car.year)],
                  ["Hộp số", car.transmission],
                  ["Nhiên liệu", car.fuel],
                  ["Số km đã đi", `${car.mileage.toLocaleString("vi-VN")} km`],
                  ["Vị trí xe", car.location],
                  ["Bảo hành", car.warranty ?? "—"],
                  ["Điểm kiểm định", `${car.inspectionScore ?? "N/A"}/100`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                    <span style={{ color: "var(--ink-500)" }}>{k}</span>
                    <span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === "vin" && <VINHistory car={car}/>}
            {tab === "compare" && <PriceComparison car={car}/>}
          </div>

          {/* Sticky right rail */}
          <aside>
            <div className="card" style={{ padding: 20, position: "sticky", top: 88, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Giá niêm yết</div>
                <div className="mono" style={{ fontSize: 30, fontWeight: 700, color: "var(--green-700)", letterSpacing: "-0.02em" }}>{formatVND(listPrice)}</div>
                <div style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 4 }}>
                  Nguyên bản: {formatVNDShort(originalPrice)} · Tiết kiệm {Math.round(100 - (listPrice / originalPrice) * 100)}%
                </div>
              </div>

              <div style={{ background: "var(--green-50)", borderRadius: 10, padding: 12, fontSize: 12, color: "var(--ink-700)" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <Icon.Users size={14}/>
                  <b>{car.offerCount ?? offerCount} người đang quan tâm</b>
                </div>
                <div style={{ color: "var(--ink-500)" }}>Thông tin người mua được ẩn — xengap.vn kết nối khi chốt deal.</div>
              </div>

              <button onClick={() => openOffer(car)} className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                <Icon.DollarSign size={16}/> Gửi offer mua xe
              </button>
              <Link href={`/checkout/${car.id}`} className="btn btn-secondary" style={{ justifyContent: "center" }}>
                Đặt cọc xem xe trực tiếp
              </Link>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, fontSize: 12, color: "var(--ink-600)" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <Icon.Shield size={14}/> Bảo lãnh thanh toán qua xengap escrow
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <Icon.CheckCircle size={14}/> Kiểm định bởi kỹ sư xengap.vn
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Icon.RotateCcw size={14}/> Hoàn cọc 100% nếu không khớp mô tả
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, fontSize: 12 }}>
                <div style={{ color: "var(--ink-500)", marginBottom: 4 }}>Người bán</div>
                <div style={{ fontWeight: 600 }}>Cá nhân (đã xác thực)</div>
                <div style={{ color: "var(--ink-500)" }}>Thông tin liên hệ chỉ tiết lộ sau khi xengap.vn xác nhận giao dịch</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
