"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/DataTable";
import {
  useListing,
  useListingInspection,
  useHideListing,
  useUnhideListing,
  useApproveListing,
  useMarkListingSold,
} from "@/hooks/api/listings";
import { useSellerViewOffers } from "@/hooks/api/offers";
import { HasRole } from "@/components/RequireRole";
import { useAuth } from "@/lib/auth";
import { formatVNDShort } from "@/lib/format-bigint";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuth((s) => s.user);
  const { data, isLoading } = useListing(id);
  const insp = useListingInspection(id);
  const offers = useSellerViewOffers(id, { limit: 20 });

  const hide = useHideListing();
  const unhide = useUnhideListing();
  const approve = useApproveListing();
  const sell = useMarkListingSold();

  if (isLoading) return <div>Đang tải…</div>;
  const l = data;
  if (!l) return <div>Không tìm thấy listing.</div>;

  const isOwner = user?.id === l.sellerId;

  return (
    <>
      <PageHeader
        title={`${l.brand} ${l.model} ${l.year}`}
        subtitle={
          <>
            <span className="mono">{l.id}</span> · <StatusBadge value={l.status} /> · VIN: {l.vin}
          </>
        }
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            {(isOwner || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") &&
              (l.status === "HIDDEN" ? (
                <button className="btn btn-secondary btn-sm" onClick={() => unhide.mutate({ id })}>
                  Hiển thị
                </button>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={() => hide.mutate({ id })}>
                  Ẩn tin
                </button>
              ))}
            <HasRole roles={["ADMIN", "SUPER_ADMIN", "INSPECTOR"]}>
              {l.status === "INSPECTION_PENDING" || l.status === "DRAFT_SUBMITTED" ? (
                <button className="btn btn-primary btn-sm" onClick={() => approve.mutate({ id })}>
                  Phê duyệt
                </button>
              ) : null}
            </HasRole>
            <HasRole roles={["ADMIN", "SUPER_ADMIN"]}>
              {l.status !== "SOLD" && l.status !== "HIDDEN" ? (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const v = prompt("Final price (VND):");
                    if (v) sell.mutate({ id, finalPrice: Number(v) });
                  }}
                >
                  Đánh dấu đã bán
                </button>
              ) : null}
            </HasRole>
            <Link href={`/cars/${l.id}`} className="btn btn-secondary btn-sm">
              Trang public
            </Link>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 0 }}>Thông tin</h3>
          <Info label="Khu vực" value={l.location} />
          <Info label="Số km" value={l.mileage.toLocaleString("vi-VN")} />
          <Info label="Hộp số / Nhiên liệu" value={`${l.transmission} · ${l.fuel}`} />
          <Info label="Ngày ngập" value={l.floodDate} />
          <Info label="Độ sâu ngập" value={`${l.floodDepthCm} cm tại ${l.floodLocation}`} />
          <Info label="Mức độ" value={l.severity} />
          <Info label="Giá list" value={formatVNDShort(l.listPrice)} />
          <Info label="Giá tối thiểu" value={formatVNDShort(l.minPrice)} />
          <Info label="Giá gốc" value={formatVNDShort(l.originalPrice)} />
          <Info label="Mô tả" value={l.description || "—"} />
          {l.warranty && <Info label="Bảo hành" value={l.warranty} />}
          {l.images && l.images.length > 0 && (
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {l.images.map((im) => (
                <div key={im.id} style={{ aspectRatio: "1/1", background: "var(--bg-soft)", borderRadius: 6, overflow: "hidden" }}>
                  {im.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={im.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ padding: 8, fontSize: 11, color: "var(--ink-500)" }}>{im.s3Key}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 0 }}>Kiểm định</h3>
            {insp.isLoading ? (
              <div style={{ color: "var(--ink-500)" }}>Đang tải…</div>
            ) : insp.data ? (
              <div style={{ fontSize: 14 }}>
                <Info label="Điểm" value={insp.data.score ?? "—"} />
                <Info label="Phê duyệt" value={insp.data.approved ? "Có" : "Chưa"} />
                {insp.data.repairs && insp.data.repairs.length > 0 && (
                  <Info label="Sửa chữa" value={insp.data.repairs.join(", ")} />
                )}
              </div>
            ) : (
              <div style={{ color: "var(--ink-500)" }}>Chưa có báo cáo.</div>
            )}
          </div>

          <HasRole roles={["SELLER", "ADMIN", "SUPER_ADMIN"]}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 0 }}>Offer (ẩn danh)</h3>
              {offers.isLoading ? (
                <div style={{ color: "var(--ink-500)" }}>Đang tải…</div>
              ) : offers.data?.items.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                  {offers.data.items.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto auto",
                        gap: 8,
                        alignItems: "center",
                        padding: "6px 8px",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <span style={{ color: "var(--ink-500)" }}>{o.buyerInitials || "—"}</span>
                      <span className="mono">{formatVNDShort(o.amount)}</span>
                      <StatusBadge value={o.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "var(--ink-500)" }}>Chưa có offer.</div>
              )}
            </div>
          </HasRole>
        </aside>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8, padding: "6px 0", fontSize: 14 }}>
      <span style={{ color: "var(--ink-500)" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
