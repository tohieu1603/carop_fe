import Link from "next/link";
import { notFound } from "next/navigation";
import { carsApi, offersApi, buyersApi, adminApi } from "@/lib/api";
import { formatVND, formatVNDShort, SEVERITY_LABELS } from "@/lib/format";

export default async function AdminCarDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await carsApi.get(id);
  if (!car) notFound();
  const offers = await offersApi.listByCar(id);
  const buyers = await buyersApi.list();
  const spread = await adminApi.getSpread(id);
  const sev = SEVERITY_LABELS[car.severity];

  const sortedOffers = [...offers].sort((a, b) => b.amount - a.amount);

  return (
    <div>
      <Link href="/admin/listings" style={{ fontSize: 13, color: "var(--ink-500)", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
        ← Quay lại danh sách
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
        <div>
          <div style={{ marginBottom: 12 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>{car.title}</h1>
            <div className="mono" style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>{car.id} · VIN {car.vin}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <span className={`badge badge-${sev.color}`}>{sev.label}</span>
              <span className="badge badge-neutral">{car.year}</span>
              <span className="badge badge-neutral">{car.location}</span>
            </div>
          </div>

          {/* Spread card — admin only */}
          {spread && (
            <div className="card" style={{ padding: 20, marginBottom: 16, background: "linear-gradient(135deg, oklch(0.18 0.01 230), oklch(0.25 0.02 230))", color: "white" }}>
              <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>⚙ Admin only — Spread analysis</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Top offer (buyer)</div>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{formatVNDShort(spread.topOffer)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Min seller chấp nhận</div>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{formatVNDShort(spread.sellerMin)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Spread cho xengap.vn</div>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: spread.spread > 0 ? "oklch(0.85 0.15 145)" : "oklch(0.85 0.15 25)" }}>
                    {spread.spread > 0 ? "+" : ""}{formatVNDShort(spread.spread)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Offers list with full buyer info */}
          <div className="card" style={{ padding: 0, background: "white", marginBottom: 16 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Tất cả offer ({offers.length})</h3>
              <span style={{ fontSize: 12, color: "var(--ink-500)" }}>Sắp xếp theo giá cao nhất</span>
            </div>
            <table style={{ width: "100%", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg-soft)", textAlign: "left" }}>
                  {["Mã", "Buyer", "SĐT", "Offer", "Lời nhắn", "Ngày", "Hành động"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--ink-500)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedOffers.map((o, i) => {
                  const buyer = buyers.find((b) => b.id === o.buyerId);
                  return (
                    <tr key={o.id} style={{ borderTop: "1px solid var(--border)", background: i === 0 ? "var(--green-50)" : "white" }}>
                      <td className="mono" style={{ padding: "10px 14px", fontSize: 12 }}>{o.id}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ fontWeight: 600 }}>{buyer?.name || o.buyerId}</div>
                        <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>{buyer?.id}</div>
                      </td>
                      <td className="mono" style={{ padding: "10px 14px", fontSize: 12 }}>{buyer?.phone}</td>
                      <td className="mono" style={{ padding: "10px 14px", fontWeight: 700 }}>{formatVND(o.amount)}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--ink-600)", maxWidth: 200 }}>{o.message || "—"}</td>
                      <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--ink-500)" }}>{o.date}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <button className="btn btn-primary btn-sm">Chốt deal</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <aside>
          {/* Full seller info — admin only */}
          <div className="card" style={{ padding: 20, marginBottom: 12, background: "white" }}>
            <div style={{ fontSize: 11, color: "var(--ink-500)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Người bán (full info)</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{car.seller.name}</div>
            <div className="mono" style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>S-{car.id.slice(-3)}</div>
            <div style={{ marginTop: 12, fontSize: 13, display: "grid", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Đánh giá</span><span className="mono" style={{ fontWeight: 600 }}>★ {car.seller.rating}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Đã bán</span><span className="mono" style={{ fontWeight: 600 }}>{car.seller.deals}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Xác thực</span><span style={{ fontWeight: 600, color: "var(--green-700)" }}>✓ CCCD + SĐT</span></div>
            </div>
          </div>

          <div className="card" style={{ padding: 20, background: "white" }}>
            <div style={{ fontSize: 11, color: "var(--ink-500)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Giá & xếp hạng</div>
            <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Giá niêm yết</span><span className="mono" style={{ fontWeight: 700 }}>{formatVND(car.price)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Cùng đời</span><span className="mono">{formatVNDShort(car.originalPrice)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Xe mới</span><span className="mono">{formatVNDShort(car.newPrice)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--border)" }}><span style={{ color: "var(--ink-500)" }}>Lượt xem</span><span className="mono">{car.views}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Điểm kiểm định</span><span className="mono">{car.inspectionScore}/100</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
