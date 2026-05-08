"use client";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListing, useUpdateListing } from "@/hooks/api/listings";
import { ApiError } from "@/lib/api/client";
import { RequireRole } from "@/components/RequireRole";

const schema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  mileage: z.coerce.number().int().min(0),
  transmission: z.enum(["MT", "AT", "CVT", "DCT"]),
  fuel: z.enum(["gasoline", "diesel", "hybrid", "electric"]),
  location: z.string().min(1),
  floodDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  floodDepthCm: z.coerce.number().int().min(0).max(200),
  floodLocation: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]),
  minPrice: z.coerce.number().int().min(1),
  description: z.string().optional().or(z.literal("")),
  warranty: z.string().optional().or(z.literal("")),
});
type FormIn = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireRole roles={["SELLER", "ADMIN", "SUPER_ADMIN"]}>
      <Inner id={id} />
    </RequireRole>
  );
}

function Inner({ id }: { id: string }) {
  const router = useRouter();
  const { data: listing, isLoading } = useListing(id);
  const update = useUpdateListing();

  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(schema),
    defaultValues: {
      brand: "",
      model: "",
      mileage: 0,
      transmission: "AT",
      fuel: "gasoline",
      location: "",
      floodDate: "",
      floodDepthCm: 0,
      floodLocation: "",
      severity: "low",
      minPrice: 0,
      description: "",
      warranty: "",
    },
  });

  useEffect(() => {
    if (listing) {
      form.reset({
        brand: listing.brand,
        model: listing.model,
        mileage: listing.mileage,
        transmission: listing.transmission,
        fuel: listing.fuel,
        location: listing.location,
        floodDate: listing.floodDate,
        floodDepthCm: listing.floodDepthCm,
        floodLocation: listing.floodLocation,
        severity: listing.severity,
        minPrice: Number(listing.minPrice),
        description: listing.description || "",
        warranty: listing.warranty || "",
      });
    }
  }, [listing, form]);

  if (isLoading) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: "var(--ink-500)" }}>Dang tai...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ color: "var(--red-600)" }}>Khong tim thay tin dang.</div>
      </div>
    );
  }

  const canEdit = listing.status === "DRAFT_SUBMITTED" || listing.status === "INSPECTION_REJECTED";
  if (!canEdit) {
    return (
      <div style={{ padding: 32 }}>
        <Link href={`/dashboard/listings/${id}`} style={{ color: "var(--green-700)", fontSize: 13 }}>← Quay lai</Link>
        <div style={{ marginTop: 16, color: "var(--red-600)" }}>
          Chi co the chinh sua khi tin o trang thai DRAFT_SUBMITTED hoac INSPECTION_REJECTED.
          Trang thai hien tai: {listing.status}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 880 }}>
      <Link href={`/dashboard/listings/${id}`} style={{ color: "var(--green-700)", fontSize: 13 }}>← Chi tiet tin dang</Link>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 12 }}>Chinh sua tin dang</h1>
      <p style={{ fontSize: 13, color: "var(--ink-500)", marginTop: 4 }}>
        {listing.brand} {listing.model} {listing.year} — VIN: {listing.vin}
      </p>

      <form
        onSubmit={form.handleSubmit(async (v) => {
          try {
            await update.mutateAsync({
              id,
              body: {
                brand: v.brand,
                model: v.model,
                mileage: v.mileage,
                transmission: v.transmission,
                fuel: v.fuel,
                location: v.location,
                floodDate: v.floodDate,
                floodDepthCm: v.floodDepthCm,
                floodLocation: v.floodLocation,
                severity: v.severity,
                minPrice: String(v.minPrice),
                description: v.description || undefined,
                warranty: v.warranty || undefined,
                version: listing.version,
              },
            });
            router.push(`/dashboard/listings/${id}`);
          } catch (e) {
            const msg = e instanceof ApiError ? e.message : "Loi cap nhat";
            form.setError("brand", { message: msg });
          }
        })}
        className="card"
        style={{ padding: 24, marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
      >
        <Field label="Hang xe" error={form.formState.errors.brand?.message}>
          <input className="input" {...form.register("brand")} />
        </Field>
        <Field label="Model" error={form.formState.errors.model?.message}>
          <input className="input" {...form.register("model")} />
        </Field>
        <Field label="So km" error={form.formState.errors.mileage?.message}>
          <input type="number" className="input" {...form.register("mileage")} />
        </Field>
        <Field label="Hop so" error={form.formState.errors.transmission?.message}>
          <select className="input" {...form.register("transmission")}>
            <option value="MT">MT</option>
            <option value="AT">AT</option>
            <option value="CVT">CVT</option>
            <option value="DCT">DCT</option>
          </select>
        </Field>
        <Field label="Nhien lieu" error={form.formState.errors.fuel?.message}>
          <select className="input" {...form.register("fuel")}>
            <option value="gasoline">Xang</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
            <option value="electric">Dien</option>
          </select>
        </Field>
        <Field label="Khu vuc" error={form.formState.errors.location?.message}>
          <input className="input" {...form.register("location")} />
        </Field>
        <Field label="Ngay ngap (YYYY-MM-DD)" error={form.formState.errors.floodDate?.message}>
          <input className="input" {...form.register("floodDate")} placeholder="2024-08-01" />
        </Field>
        <Field label="Do sau ngap (cm)" error={form.formState.errors.floodDepthCm?.message}>
          <input type="number" className="input" {...form.register("floodDepthCm")} />
        </Field>
        <Field label="Vi tri ngap" error={form.formState.errors.floodLocation?.message}>
          <input className="input" {...form.register("floodLocation")} />
        </Field>
        <Field label="Muc do ngap" error={form.formState.errors.severity?.message}>
          <select className="input" {...form.register("severity")}>
            <option value="low">Nhe (duoi gam xe)</option>
            <option value="medium">Vua (ngap san xe)</option>
            <option value="high">Nang (tren ghe, dong co)</option>
          </select>
        </Field>
        <Field label="Gia san sot (VND)" error={form.formState.errors.minPrice?.message}>
          <input type="number" className="input" {...form.register("minPrice")} />
        </Field>

        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Mo ta" error={form.formState.errors.description?.message}>
            <textarea className="input" rows={3} {...form.register("description")} />
          </Field>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Bao hanh" error={form.formState.errors.warranty?.message}>
            <input className="input" {...form.register("warranty")} />
          </Field>
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Link href={`/dashboard/listings/${id}`} className="btn btn-secondary">Huy</Link>
          <button type="submit" className="btn btn-primary" disabled={update.isPending}>
            {update.isPending ? "Dang luu..." : "Luu thay doi"}
          </button>
        </div>

        {update.isSuccess && (
          <div style={{ gridColumn: "1 / -1", color: "var(--green-700)", fontSize: 13 }}>
            Da luu thanh cong!
          </div>
        )}
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <div style={{ color: "var(--red-600)", fontSize: 12, marginTop: 4 }}>{error}</div>}
    </div>
  );
}
