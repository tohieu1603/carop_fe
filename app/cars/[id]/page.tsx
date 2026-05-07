"use client";
import { use } from "react";
import { notFound } from "next/navigation";
import { useListing } from "@/hooks/api/listings";
import { CarDetailView } from "@/components/CarDetailView";

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useListing(id);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: "32px 0" }}>
        <div style={{ color: "var(--ink-500)", fontSize: 14 }}>Đang tải...</div>
      </div>
    );
  }

  if (error || !data) {
    notFound();
  }

  const car = data;
  return <CarDetailView car={car} offerCount={car.offerCount} />;
}
