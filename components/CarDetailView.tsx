"use client";
import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { formatVND, formatVNDShort as formatVNDShortNum, SEVERITY_LABELS } from "@/lib/format";
import { formatVNDShort } from "@/lib/format-bigint";
import { Icon } from "@/components/Icon";
import { CarImage } from "@/components/CarCard";
import { VINHistory, PriceComparison } from "@/components/CarHistory";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { useListings } from "@/hooks/api/listings";
import type { InspectionSummary, Listing } from "@/types/api";

interface Props { car: Listing; offerCount?: number; inspectionData?: InspectionSummary; }

export function CarDetailView({ car, offerCount = 0, inspectionData }: Props) {
  const [tab, setTab] = useState<"damage" | "specs" | "vin" | "compare" | "inspection">("damage");
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

            {/* Interest + views */}
            <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 13, color: "var(--ink-600)" }}>
              <span><b>{car.offerCount ?? offerCount}</b> nguoi quan tam</span>
              <span>·</span>
              <span><b>{car.views?.toLocaleString("vi-VN") ?? 0}</b> luot xem</span>
            </div>

            {/* Image gallery */}
            {car.images && car.images.length > 1 && (
              <ImageGallery images={car.images} />
            )}

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--bg-soft)", borderRadius: 10, marginBottom: 16, width: "fit-content", flexWrap: "wrap" }}>
              {[
                { id: "damage" as const, l: "Tinh trang" },
                { id: "specs" as const, l: "Thong so" },
                ...(inspectionData ? [{ id: "inspection" as const, l: "Kiem dinh" }] : []),
                { id: "vin" as const, l: "Lich su VIN" },
                { id: "compare" as const, l: "So sanh gia" },
              ].map((t) => (
                <button key={t.id} onClick={() => setTab(t.id as typeof tab)} style={{
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

            {tab === "inspection" && inspectionData && (
              <div className="card" style={{ padding: 20 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Ket qua kiem dinh</h3>
                <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 14 }}>
                  {inspectionData.score !== undefined && (
                    <div style={{ textAlign: "center" }}>
                      <div className="mono" style={{ fontSize: 40, fontWeight: 800, color: inspectionData.score >= 70 ? "var(--green-700)" : inspectionData.score >= 50 ? "var(--amber-600)" : "var(--red-600)" }}>
                        {inspectionData.score}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Diem / 100</div>
                    </div>
                  )}
                  {inspectionData.approved !== undefined && (
                    <span className={`badge badge-${inspectionData.approved ? "green" : "red"}`}>
                      {inspectionData.approved ? "Da phe duyet" : "Khong duyet"}
                    </span>
                  )}
                </div>
                {inspectionData.repairs && inspectionData.repairs.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: "var(--ink-500)", marginBottom: 6 }}>Da sua chua</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {inspectionData.repairs.map((r) => (
                        <span key={r} style={{ background: "var(--green-50)", color: "var(--green-700)", fontSize: 12, padding: "3px 8px", borderRadius: 99 }}>{r}</span>
                      ))}
                    </div>
                  </div>
                )}
                {inspectionData.damage && Object.keys(inspectionData.damage).length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)", marginBottom: 6 }}>Tinh trang hu hong</div>
                    {Object.entries(inspectionData.damage as Record<string, string>).map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                        <span style={{ color: "var(--ink-500)" }}>{k}</span>
                        <span>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
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
        {/* Similar cars */}
        <SimilarCars brand={car.brand} severity={car.severity} excludeId={car.id} />
      </main>
      <SiteFooter />
    </>
  );
}

function ImageGallery({ images }: { images: Array<{ id: string; url?: string; s3Key: string; position: number }> }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const active = sorted[activeIdx];
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Main image */}
      <div style={{ aspectRatio: "16/9", borderRadius: 12, overflow: "hidden", background: "var(--bg-soft)", marginBottom: 8 }}>
        {active?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={active.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-400)", fontSize: 12 }}>
            {active?.s3Key ?? "No image"}
          </div>
        )}
      </div>
      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(i)}
              style={{
                flexShrink: 0, width: 72, height: 52, borderRadius: 6, overflow: "hidden",
                border: i === activeIdx ? "2px solid var(--green-600)" : "2px solid transparent",
                background: "var(--bg-soft)", padding: 0, cursor: "pointer",
              }}
            >
              {img.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--ink-400)" }}>
                  {i + 1}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SimilarCars({ brand, severity, excludeId }: { brand: string; severity: string; excludeId: string }) {
  const { data } = useListings({ brand, severity: severity as "low" | "medium" | "high", limit: 6 });
  const similar = (data?.items ?? []).filter((l) => l.id !== excludeId).slice(0, 4);
  if (similar.length === 0) return null;
  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Xe tuong tu</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {similar.map((car) => (
          <Link key={car.id} href={`/cars/${car.id}`} className="card" style={{ textDecoration: "none", color: "inherit", overflow: "hidden" }}>
            <div style={{ height: 130, background: "linear-gradient(135deg, var(--green-200), var(--green-500))" }}>
              {car.images?.[0]?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={car.images[0].url} alt={car.brand} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{car.brand} {car.model} {car.year}</div>
              <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: "var(--green-700)", marginTop: 3 }}>
                {formatVNDShort(car.listPrice)}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 3 }}>
                {car.mileage.toLocaleString("vi-VN")} km · {car.location}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
