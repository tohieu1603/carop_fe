"use client";
import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useListing, useListingInspection, useListings } from "@/hooks/api/listings";
import { CarDetailView } from "@/components/CarDetailView";
import { formatVNDShort } from "@/lib/format-bigint";

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useListing(id);
  const inspQ = useListingInspection(id);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: "32px 0" }}>
        <div style={{ color: "var(--ink-500)", fontSize: 14 }}>Dang tai...</div>
      </div>
    );
  }

  if (error || !data) {
    notFound();
  }

  return (
    <CarDetailView
      car={data}
      offerCount={data.offerCount}
      inspectionData={inspQ.data ?? undefined}
    />
  );
}
