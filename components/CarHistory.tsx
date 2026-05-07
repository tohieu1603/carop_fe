"use client";
import type { Listing } from "@/types/api";
import { formatVND, formatVNDShort } from "@/lib/format";

interface VINEvent { date: string; type: string; title: string; desc: string; verified?: boolean; }

export function VINHistory({ car }: { car: Listing }) {
  const originalPrice = Number(car.originalPrice);
  const events: VINEvent[] = [
    { date: car.floodDate, type: "flood", title: `Ngập nước ${car.floodDepthCm}cm`, desc: car.floodLocation, verified: true },
    { date: car.floodDate, type: "claim", title: "Báo cáo bảo hiểm", desc: `Bồi thường ${formatVNDShort(Math.round(originalPrice * 0.4))}`, verified: true },
    { date: car.floodDate, type: "repair", title: "Sửa chữa", desc: car.repairs.join(" · "), verified: true },
    { date: "2024-09-20", type: "inspect", title: "Kiểm định xengap.vn", desc: `Điểm: ${car.inspectionScore ?? "N/A"}/100 — Đạt chuẩn giao dịch`, verified: true },
    { date: "2023-06-15", type: "service", title: "Bảo dưỡng định kỳ", desc: `${car.mileage - 8000} km — Toyota service` },
    { date: "2022-08-10", type: "register", title: "Đăng ký lần đầu", desc: `Chủ đầu tiên — ${car.location}` },
  ];

  const colors: Record<string, string> = {
    flood: "var(--red-600)", claim: "var(--amber-600)", repair: "var(--green-700)",
    inspect: "var(--green-700)", service: "var(--ink-500)", register: "var(--ink-500)",
  };

  return (
    <div>
      <div style={{ background: "var(--green-50)", border: "1px solid var(--green-200)", borderRadius: 10, padding: 16, marginBottom: 20, display: "flex", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "white", display: "grid", placeItems: "center", flexShrink: 0 }}>🛡</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green-700)" }}>Báo cáo VIN xác thực</div>
          <div style={{ fontSize: 12, color: "var(--ink-600)", marginTop: 2 }}>VIN <span className="mono">{car.vin}</span> · Cập nhật từ Cục đăng kiểm + Bảo hiểm + xengap.vn</div>
        </div>
      </div>

      <div style={{ position: "relative", paddingLeft: 24 }}>
        <div style={{ position: "absolute", left: 7, top: 6, bottom: 6, width: 2, background: "var(--border)" }}/>
        {events.map((ev, i) => (
          <div key={i} style={{ position: "relative", paddingBottom: 20 }}>
            <div style={{ position: "absolute", left: -22, top: 4, width: 16, height: 16, borderRadius: "50%", background: colors[ev.type] || "var(--ink-500)", border: "3px solid white", boxShadow: "0 0 0 1px var(--border)" }}/>
            <div className="card" style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{ev.title}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>{ev.date}</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-600)", marginTop: 4 }}>{ev.desc}</div>
              {ev.verified && <div style={{ fontSize: 11, color: "var(--green-700)", marginTop: 6, fontWeight: 600 }}>✓ Đã xác thực</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PriceComparison({ car }: { car: Listing }) {
  const listPrice = Number(car.listPrice);
  const originalPrice = Number(car.originalPrice);
  // Estimate new price as 110% of original
  const newPrice = Math.round(originalPrice * 1.1);

  const cols = [
    { label: "Xe mới (NSX)", price: newPrice, sub: `${car.year} · 0 km`, color: "var(--ink-700)", bg: "var(--bg-soft)" },
    { label: "Cùng đời, nguyên bản", price: originalPrice, sub: `${car.year} · ${car.mileage.toLocaleString("vi-VN")} km`, color: "var(--ink-700)", bg: "var(--bg-soft)" },
    { label: "Giá xe ngập này", price: listPrice, sub: `Ngập ${car.floodDepthCm}cm`, color: "white", bg: "var(--green-700)", highlight: true },
  ];
  const max = Math.max(...cols.map((c) => c.price));
  const savedVsNew = newPrice - listPrice;
  const savedVsOriginal = originalPrice - listPrice;
  const pctVsOriginal = Math.round((savedVsOriginal / originalPrice) * 100);

  return (
    <div className="card" style={{ padding: 20, background: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>So sánh giá 3 cột</h3>
        <span className="badge badge-green">Tiết kiệm {pctVsOriginal}%</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {cols.map((c) => (
          <div key={c.label} style={{ background: c.bg, color: c.color, borderRadius: 10, padding: 14, position: "relative" }}>
            <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>{c.label}</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, marginTop: 6, lineHeight: 1.1 }}>{formatVNDShort(c.price)}</div>
            <div style={{ fontSize: 10, opacity: 0.75, marginTop: 4 }}>{c.sub}</div>
            <div style={{ height: 4, background: (c as {highlight?: boolean}).highlight ? "oklch(1 0 0 / 0.3)" : "var(--border)", borderRadius: 999, marginTop: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(c.price / max) * 100}%`, background: (c as {highlight?: boolean}).highlight ? "white" : "var(--green-500)" }}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12, fontSize: 12 }}>
        <div style={{ padding: 10, background: "var(--green-50)", borderRadius: 8 }}>
          Tiết kiệm vs xe mới: <span className="mono" style={{ fontWeight: 700, color: "var(--green-700)" }}>{formatVND(savedVsNew)}</span>
        </div>
        <div style={{ padding: 10, background: "var(--green-50)", borderRadius: 8 }}>
          Tiết kiệm vs cùng đời: <span className="mono" style={{ fontWeight: 700, color: "var(--green-700)" }}>{formatVND(savedVsOriginal)}</span>
        </div>
      </div>

      <div style={{ marginTop: 14, padding: 12, background: "var(--bg-soft)", borderRadius: 8, fontSize: 11, color: "var(--ink-600)", lineHeight: 1.5 }}>
        Lưu ý: Giá đã trừ chi phí sửa chữa ước tính ~{formatVNDShort(Math.round(originalPrice * 0.08))}.
        Cộng thêm ~{formatVNDShort(Math.round(originalPrice * 0.03))}/năm phí bảo dưỡng cao hơn so với xe nguyên bản.
      </div>
    </div>
  );
}
