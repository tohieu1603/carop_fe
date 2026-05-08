"use client";
import { use } from "react";
import Link from "next/link";
import { useListing } from "@/hooks/api/listings";
import { useAdminListingOffers, useAcceptOffer, useRejectOffer } from "@/hooks/api/offers";
import { useApproveListing, useMarkListingSold, useHideListing } from "@/hooks/api/listings";
import { formatVNDShort } from "@/lib/format-bigint";
import { SEVERITY_LABELS } from "@/lib/format";
import { ApiError } from "@/lib/api/client";

export default function AdminCarDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useListing(id);
  const offersQ = useAdminListingOffers(id, { limit: 50 });
  const approve = useApproveListing();
  const sold = useMarkListingSold();
  const hide = useHideListing();
  const acceptOffer = useAcceptOffer();
  const rejectOffer = useRejectOffer();

  if (isLoading) {
    return (
      <div>
        <Link href="/admin/listings" style={{ fontSize: 13, color: "var(--ink-500)" }}>← Quay lại</Link>
        <div style={{ marginTop: 16, color: "var(--ink-500)" }}>Đang tải...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <Link href="/admin/listings" style={{ fontSize: 13, color: "var(--ink-500)" }}>← Quay lại</Link>
        <div style={{ marginTop: 16, color: "var(--red-600)" }}>Không tìm thấy listing.</div>
      </div>
    );
  }

  const car = data;
  const offers = offersQ.data?.items ?? [];
  const sev = SEVERITY_LABELS[car.severity];
  const listPrice = Number(car.listPrice);
  const minPrice = Number(car.minPrice);
  const originalPrice = Number(car.originalPrice);
  const topOffer = car.topOffer ? Number(car.topOffer) : 0;
  const spread = car.spread ? Number(car.spread) : 0;

  const sortedOffers = [...offers].sort((a, b) => Number(b.amount) - Number(a.amount));

  const handleApprove = async () => {
    try {
      await approve.mutateAsync({ id });
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Lỗi phê duyệt");
    }
  };

  const handleSold = async () => {
    const v = prompt("Final price (VND):");
    if (!v) return;
    try {
      await sold.mutateAsync({ id, finalPrice: Number(v) });
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Lỗi đánh dấu đã bán");
    }
  };

  const handleHide = async () => {
    try {
      await hide.mutateAsync({ id });
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Lỗi ẩn tin");
    }
  };

  const handleAccept = async (offerId: string) => {
    if (!confirm("Chấp nhận offer này? Các offer khác sẽ bị từ chối.")) return;
    try {
      await acceptOffer.mutateAsync({ id: offerId });
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Lỗi chấp nhận offer");
    }
  };

  const handleReject = async (offerId: string) => {
    const reason = prompt("Lý do từ chối:");
    if (!reason) return;
    try {
      await rejectOffer.mutateAsync({ id: offerId, reason });
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Lỗi từ chối offer");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Link href="/admin/listings" style={{ fontSize: 13, color: "var(--ink-500)", display: "inline-flex", alignItems: "center", gap: 6 }}>
          ← Quay lại danh sách
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          {(car.status === "DRAFT_SUBMITTED" || car.status === "INSPECTION_PENDING") && (
            <button className="btn btn-primary btn-sm" onClick={handleApprove} disabled={approve.isPending}>
              Duyệt
            </button>
          )}
          {car.status !== "HIDDEN" && (
            <button className="btn btn-secondary btn-sm" onClick={handleHide} disabled={hide.isPending}>
              Ẩn
            </button>
          )}
          {car.status !== "SOLD" && car.status !== "HIDDEN" && (
            <button className="btn btn-secondary btn-sm" onClick={handleSold} disabled={sold.isPending}>
              Đánh dấu đã bán
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
        <div>
          <div style={{ marginBottom: 12 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {car.brand} {car.model} {car.year}
            </h1>
            <div className="mono" style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 2 }}>{car.id} · VIN {car.vin}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <span className={`badge badge-${sev.color}`}>{sev.label}</span>
              <span className="badge badge-neutral">{car.year}</span>
              <span className="badge badge-neutral">{car.location}</span>
              <span className={`badge badge-${car.status === "ACTIVE" || car.status === "HAS_BUYERS" ? "green" : car.status === "DRAFT_SUBMITTED" || car.status === "INSPECTION_PENDING" ? "amber" : "red"}`}>
                {car.status}
              </span>
            </div>
          </div>

          {/* Spread card */}
          {(topOffer > 0 || spread > 0) && (
            <div className="card" style={{ padding: 20, marginBottom: 16, background: "linear-gradient(135deg, oklch(0.18 0.01 230), oklch(0.25 0.02 230))", color: "white", border: "none" }}>
              <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Admin only — Spread analysis</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Top offer (buyer)</div>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{formatVNDShort(topOffer)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Min seller chấp nhận</div>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{formatVNDShort(minPrice)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>Spread cho xengap.vn</div>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: spread > 0 ? "oklch(0.85 0.15 145)" : "oklch(0.85 0.15 25)" }}>
                    {spread > 0 ? "+" : ""}{formatVNDShort(spread)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Offers list */}
          <div className="card" style={{ padding: 0, background: "white", marginBottom: 16 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Tất cả offer ({offers.length})</h3>
              <span style={{ fontSize: 12, color: "var(--ink-500)" }}>Sắp xếp theo giá cao nhất</span>
            </div>
            {offersQ.isLoading ? (
              <div style={{ padding: 16, color: "var(--ink-500)" }}>Đang tải...</div>
            ) : sortedOffers.length === 0 ? (
              <div style={{ padding: 16, color: "var(--ink-500)" }}>Chưa có offer.</div>
            ) : (
              <table style={{ width: "100%", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--bg-soft)", textAlign: "left" }}>
                    {["Mã", "Buyer", "SĐT", "Offer", "Trạng thái", "Ngày", "Hành động"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--ink-500)", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedOffers.map((o, i) => {
                    const buyer = o.buyer;
                    return (
                      <tr key={o.id} style={{ borderTop: "1px solid var(--border)", background: i === 0 ? "var(--green-50)" : "white" }}>
                        <td className="mono" style={{ padding: "10px 14px", fontSize: 12 }}>{o.id}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontWeight: 600 }}>{buyer?.fullName || o.buyerId}</div>
                        </td>
                        <td className="mono" style={{ padding: "10px 14px", fontSize: 12 }}>{buyer?.phone || "—"}</td>
                        <td className="mono" style={{ padding: "10px 14px", fontWeight: 700 }}>{formatVNDShort(o.amount)}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span className={`badge badge-${o.status === "ACCEPTED" ? "green" : o.status === "REJECTED" ? "red" : "amber"}`}>{o.status}</span>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--ink-500)" }}>{o.createdAt.slice(0, 10)}</td>
                        <td style={{ padding: "10px 14px" }}>
                          {o.status === "PENDING" && (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                className="btn btn-primary btn-sm"
                                disabled={acceptOffer.isPending}
                                onClick={() => handleAccept(o.id)}
                              >
                                Chốt deal
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                disabled={rejectOffer.isPending}
                                onClick={() => handleReject(o.id)}
                              >
                                Từ chối
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <aside>
          <div className="card" style={{ padding: 20, marginBottom: 12, background: "white" }}>
            <div style={{ fontSize: 11, color: "var(--ink-500)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Giá & xếp hạng</div>
            <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Giá niêm yết</span><span className="mono" style={{ fontWeight: 700 }}>{formatVNDShort(listPrice)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Giá gốc</span><span className="mono">{formatVNDShort(originalPrice)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Giá min seller</span><span className="mono">{formatVNDShort(minPrice)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid var(--border)" }}><span style={{ color: "var(--ink-500)" }}>Lượt xem</span><span className="mono">{car.views}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Điểm kiểm định</span><span className="mono">{car.inspectionScore ? `${car.inspectionScore}/100` : "N/A"}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Offer count</span><span className="mono">{car.offerCount}</span></div>
            </div>
          </div>

          <div className="card" style={{ padding: 20, background: "white" }}>
            <div style={{ fontSize: 11, color: "var(--ink-500)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Thông tin xe</div>
            <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Hộp số</span><span>{car.transmission}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Nhiên liệu</span><span>{car.fuel}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Số km</span><span className="mono">{car.mileage.toLocaleString("vi-VN")}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Ngày ngập</span><span>{car.floodDate?.slice(0, 10) || "—"}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Độ sâu</span><span>{car.floodDepthCm}cm</span></div>
              {car.warranty && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--ink-500)" }}>Bảo hành</span><span>{car.warranty}</span></div>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
