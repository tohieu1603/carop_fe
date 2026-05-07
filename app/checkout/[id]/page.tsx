"use client";
import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import { useListing } from "@/hooks/api/listings";
import { formatVND } from "@/lib/format";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useListing(id);

  if (isLoading) {
    return (
      <main className="container" style={{ padding: "32px 0", maxWidth: 720 }}>
        <div style={{ color: "var(--ink-500)", fontSize: 14 }}>Đang tải...</div>
      </main>
    );
  }

  if (error || !data) {
    notFound();
  }

  const car = data;
  const listPrice = Number(car.listPrice);
  const deposit = Math.round(listPrice * 0.01);
  const title = `${car.brand} ${car.model} ${car.year}`;

  return (
    <main className="container" style={{ padding: "32px 0", maxWidth: 720 }}>
      <Link href={`/cars/${car.id}`} style={{ fontSize: 13, color: "var(--ink-500)" }}>← Quay lại xe</Link>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 12 }}>Đặt cọc xem xe</h1>

      <div className="card" style={{ padding: 20, marginTop: 24 }}>
        <div style={{ fontSize: 13, color: "var(--ink-500)" }}>Xe</div>
        <div style={{ fontWeight: 600, marginTop: 4 }}>{title}</div>
        <div className="mono" style={{ fontSize: 12, color: "var(--ink-500)" }}>{car.id}</div>
      </div>

      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Tóm tắt thanh toán</h2>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
          <span>Giá xe</span><span className="mono">{formatVND(listPrice)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
          <span>Đặt cọc xem xe (1%)</span><span className="mono" style={{ fontWeight: 700, color: "var(--green-700)" }}>{formatVND(deposit)}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 10 }}>
          Hoàn 100% nếu xe không đúng mô tả. Trừ vào giá mua nếu chốt giao dịch.
        </div>
      </div>

      <button className="btn btn-primary btn-lg" style={{ marginTop: 20 }}>Thanh toán đặt cọc</button>
    </main>
  );
}
