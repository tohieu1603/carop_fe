"use client";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useCreateOffer } from "@/hooks/api/offers";
import { useAuth } from "@/lib/auth";
import { formatVNDShort } from "@/lib/format";
import { Icon } from "./Icon";
import { CarImage } from "./CarCard";
import { ApiError } from "@/lib/api/client";

export function OfferModal() {
  const car = useAppStore((s) => s.offerCar);
  const close = useAppStore((s) => s.closeOfferModal);
  const user = useAuth((s) => s.user);
  const createOffer = useCreateOffer();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submittedOfferId, setSubmittedOfferId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!car) return null;
  const offer = parseInt(amount.replace(/\D/g, "")) || 0;
  const formatNumber = (n: number) => n.toLocaleString("vi-VN");

  const onClose = () => {
    close();
    setStep(1);
    setAmount("");
    setMessage("");
    setSubmittedOfferId(null);
    setApiError(null);
  };

  const handleSubmitOffer = async () => {
    if (!user) {
      setApiError("Bạn cần đăng nhập để gửi offer.");
      return;
    }
    setApiError(null);
    try {
      const res = await createOffer.mutateAsync({
        listingId: car.id,
        amount: offer,
        message: message || undefined,
      });
      setSubmittedOfferId(res.id);
      setStep(3);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Lỗi gửi offer";
      setApiError(msg);
    }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "oklch(0 0 0 / 0.5)", zIndex: 200, display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 16, maxWidth: 540, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--green-700)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Bước {step}/2</div>
            <h2 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700 }}>
              {step === 1 ? "Gửi offer mua xe" : step === 2 ? "Xác nhận offer" : "Hoàn tất"}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink-500)" }}><Icon.X size={20}/></button>
        </div>

        {/* Progress */}
        <div style={{ padding: "0 24px", marginTop: 16 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 999, background: s <= step ? "var(--green-700)" : "var(--bg-soft)" }}/>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, background: "var(--bg-soft)", borderRadius: 10, marginBottom: 20 }}>
            <div style={{ width: 80, flexShrink: 0 }}><CarImage car={car} ratio="4/3"/></div>
            <div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-500)" }}>{car.id}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{car.brand} {car.model} {car.year}</div>
              <div className="mono" style={{ fontSize: 13, color: "var(--green-700)", fontWeight: 700 }}>Niêm yết {formatVNDShort(Number(car.listPrice))}</div>
            </div>
          </div>

          {step === 1 && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Mức giá bạn đề nghị (VND)</label>
                <input className="input mono" placeholder="285.000.000" value={amount}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setAmount(v ? formatNumber(parseInt(v)) : "");
                  }}
                  style={{ fontSize: 18, fontWeight: 700 }}/>
                {offer > 0 && (
                  <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 6 }}>
                    {offer >= Number(car.listPrice) ? <span style={{ color: "var(--green-700)" }}>✓ Bằng hoặc cao hơn giá niêm yết</span>
                      : <span>Thấp hơn giá niêm yết {formatVNDShort(Number(car.listPrice) - offer)}</span>}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="label">Lời nhắn cho người bán (tuỳ chọn)</label>
                <textarea className="input" rows={3} placeholder="Em có thiện chí mua xe, đã đọc báo cáo VIN..."
                  value={message} onChange={(e) => setMessage(e.target.value)}/>
              </div>
              <div style={{ background: "var(--green-50)", borderRadius: 10, padding: 14, fontSize: 12, color: "var(--ink-700)", marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <Icon.Info size={16}/>
                  <div>Người bán không thấy thông tin của bạn. xengap.vn sẽ kết nối hai bên khi offer được chấp nhận.</div>
                </div>
              </div>
              {!user && (
                <div style={{ color: "var(--red-600)", fontSize: 13, marginBottom: 12 }}>
                  Bạn cần <a href="/login" style={{ color: "var(--green-700)" }}>đăng nhập</a> để gửi offer.
                </div>
              )}
              <button onClick={() => setStep(2)} disabled={offer < 1e7 || !user}
                className="btn btn-primary btn-lg" style={{ width: "100%", opacity: (offer < 1e7 || !user) ? 0.5 : 1 }}>
                Tiếp tục — Xem lại offer
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                  <span style={{ color: "var(--ink-500)" }}>Offer của bạn</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{formatNumber(offer)}đ</span>
                </div>
                {message && (
                  <div style={{ padding: "6px 0", fontSize: 13, borderTop: "1px solid var(--border)", marginTop: 6 }}>
                    <span style={{ color: "var(--ink-500)" }}>Lời nhắn: </span>{message}
                  </div>
                )}
              </div>
              <div style={{ background: "var(--bg-soft)", borderRadius: 10, padding: 16, fontSize: 12, color: "var(--ink-700)", marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Lưu ý:</div>
                <div style={{ paddingLeft: 16 }}>
                  <div>• Offer sẽ được gửi cho người bán</div>
                  <div>• xengap.vn sẽ thông báo kết quả trong 24 giờ</div>
                  <div>• Bạn có thể rút offer trước khi được chấp nhận</div>
                </div>
              </div>
              {apiError && (
                <div style={{ color: "var(--red-600)", fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "var(--red-100)", borderRadius: 8 }}>
                  {apiError}
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setStep(1)} className="btn btn-secondary btn-lg" style={{ flex: 1 }}>Quay lại</button>
                <button
                  onClick={handleSubmitOffer}
                  disabled={createOffer.isPending}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 2 }}
                >
                  {createOffer.isPending ? "Đang gửi…" : `Gửi offer ${formatNumber(offer)}đ`}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: "50%", background: "var(--green-100)", color: "var(--green-700)", display: "grid", placeItems: "center" }}>
                <Icon.CheckCircle size={32}/>
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700 }}>Đã gửi offer thành công!</h3>
              <p style={{ fontSize: 13, color: "var(--ink-500)", margin: "0 0 24px" }}>
                xengap.vn sẽ liên hệ trong vòng <b style={{ color: "var(--green-700)" }}>24 giờ</b> sau khi người bán phản hồi.
              </p>
              {submittedOfferId && (
                <div style={{ background: "var(--bg-soft)", borderRadius: 10, padding: 16, textAlign: "left", marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Mã offer</div>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 700 }}>{submittedOfferId}</div>
                </div>
              )}
              <button onClick={onClose} className="btn btn-primary btn-lg" style={{ width: "100%" }}>Đóng</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
