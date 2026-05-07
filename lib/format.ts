export function formatVND(n: number): string {
  return n.toLocaleString("vi-VN") + "đ";
}

export function formatVNDShort(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (n >= 1e6) return (n / 1e6).toFixed(0) + " triệu";
  return n.toLocaleString("vi-VN") + "đ";
}

export const STATUS_LABELS: Record<string, { label: string; color: "green" | "amber" | "red" | "neutral" }> = {
  active: { label: "Đang đăng", color: "green" },
  has_buyers: { label: "Có người quan tâm", color: "amber" },
  closing: { label: "Đang chốt", color: "amber" },
  sold: { label: "Đã bán", color: "neutral" },
  hidden: { label: "Tạm ẩn", color: "red" },
};

export const SEVERITY_LABELS = {
  low: { label: "Ngập nhẹ", color: "green", desc: "Dưới gầm xe, không vào nội thất" },
  medium: { label: "Ngập vừa", color: "amber", desc: "Ngập sàn xe, nội thất ướt" },
  high: { label: "Ngập nặng", color: "red", desc: "Ngập trên ghế, vào động cơ" },
};
