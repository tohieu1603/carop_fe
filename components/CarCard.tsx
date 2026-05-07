"use client";
import Link from "next/link";
import { Icon } from "./Icon";
import type { Listing } from "@/types/api";
import { formatVNDShort } from "@/lib/format";
import { SEVERITY_LABELS } from "@/lib/format";

export function CarImage({ car, ratio = "16/10" }: { car: Listing; ratio?: string }) {
  const sev = SEVERITY_LABELS[car.severity];
  const palette = car.severity === "high"
    ? ["oklch(0.4 0.05 25)", "oklch(0.32 0.04 30)"]
    : car.severity === "medium"
    ? ["oklch(0.45 0.05 60)", "oklch(0.38 0.04 70)"]
    : ["oklch(0.45 0.06 200)", "oklch(0.38 0.05 220)"];
  return (
    <div style={{
      aspectRatio: ratio,
      background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
      borderRadius: 10,
      position: "relative",
      overflow: "hidden",
      display: "grid",
      placeItems: "center",
      color: "oklch(1 0 0 / 0.9)",
      width: "100%",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, opacity: 0.7, fontFamily: "var(--font-mono)" }}>{car.id}</div>
        <div style={{ fontSize: 20, fontWeight: 700, padding: "0 16px", marginTop: 6 }}>{car.brand}</div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>{car.model} {car.year}</div>
      </div>
      {/* water line */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        bottom: `${Math.min(60, car.floodDepthCm * 0.6)}%`,
        height: 2,
        background: "oklch(0.7 0.15 200 / 0.6)",
        boxShadow: "0 0 8px oklch(0.7 0.15 200 / 0.5)",
      }}/>
      <div style={{
        position: "absolute",
        top: 8, left: 8,
        background: `var(--${sev.color === "red" ? "red" : sev.color === "amber" ? "amber" : "green"}-100)`,
        color: `var(--${sev.color === "red" ? "red-600" : sev.color === "amber" ? "amber-600" : "green-700"})`,
        padding: "3px 8px",
        borderRadius: 6,
        fontSize: 10,
        fontWeight: 700,
      }}>
        {sev.label}
      </div>
    </div>
  );
}

export function CarCard({ car }: { car: Listing }) {
  const title = `${car.brand} ${car.model} ${car.year}`;
  const listPrice = Number(car.listPrice);
  const originalPrice = Number(car.originalPrice);
  return (
    <Link href={`/cars/${car.id}`} className="card" style={{ overflow: "hidden", display: "block", transition: "150ms" }}>
      <div style={{ padding: 8 }}>
        <CarImage car={car} />
      </div>
      <div style={{ padding: "8px 14px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, flex: 1 }}>{title}</div>
        </div>
        <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--green-700)", marginTop: 6 }}>
          {formatVNDShort(listPrice)}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-500)", textDecoration: "line-through" }}>
          NSX nguyên bản: {formatVNDShort(originalPrice)}
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--ink-500)", marginTop: 8, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Icon.MapPin size={11}/>{car.location}</span>
          <span>·</span>
          <span>{car.mileage.toLocaleString("vi-VN")} km</span>
          <span>·</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Icon.Droplet size={10}/>{car.floodDepthCm}cm</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--ink-500)" }}>
          <span>{car.status}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Icon.Eye size={11}/>{car.views}</span>
        </div>
      </div>
    </Link>
  );
}
