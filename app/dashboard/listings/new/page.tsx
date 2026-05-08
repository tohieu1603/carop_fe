"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useCreateListing } from "@/hooks/api/listings";
import { ApiError } from "@/lib/api/client";

const schema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1980).max(2100),
  vin: z.string().min(11).max(17),
  mileage: z.coerce.number().int().min(0),
  transmission: z.enum(["MT", "AT", "CVT", "DCT"]),
  fuel: z.enum(["gasoline", "diesel", "hybrid", "electric"]),
  location: z.string().min(1),
  floodDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  floodDepthCm: z.coerce.number().int().min(0).max(200),
  floodLocation: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]),
  minPrice: z.coerce.number().int().min(1),
  originalPrice: z.coerce.number().int().min(1),
  description: z.string().optional().or(z.literal("")),
  warranty: z.string().optional().or(z.literal("")),
  imageKeysCsv: z
    .string()
    .min(1, "Cần ít nhất 4 ảnh")
    .refine((s) => s.split(",").map((x) => x.trim()).filter(Boolean).length >= 4, "Cần ≥4 ảnh"),
});
type FormIn = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

export default function NewListingPage() {
  const router = useRouter();
  const create = useCreateListing();
  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(schema),
    defaultValues: {
      brand: "",
      model: "",
      year: 2020,
      vin: "",
      mileage: 0,
      transmission: "AT",
      fuel: "gasoline",
      location: "",
      floodDate: "",
      floodDepthCm: 0,
      floodLocation: "",
      severity: "low",
      minPrice: 0,
      originalPrice: 0,
      description: "",
      warranty: "",
      imageKeysCsv: "",
    },
  });

  return (
    <>
      <PageHeader title="Đăng tin mới" subtitle="Sau khi gửi, tin sẽ chờ kiểm định" />
      <form
        onSubmit={form.handleSubmit(async (v) => {
          try {
            const imageKeys = v.imageKeysCsv
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean);
            const created = await create.mutateAsync({
              brand: v.brand,
              model: v.model,
              year: v.year,
              vin: v.vin,
              mileage: v.mileage,
              transmission: v.transmission,
              fuel: v.fuel,
              location: v.location,
              floodDate: v.floodDate,
              floodDepthCm: v.floodDepthCm,
              floodLocation: v.floodLocation,
              severity: v.severity,
              minPrice: String(v.minPrice),
              originalPrice: String(v.originalPrice),
              description: v.description || undefined,
              warranty: v.warranty || undefined,
              imageKeys,
            });
            router.push(`/dashboard/listings/${created.id}`);
          } catch (e) {
            const msg = e instanceof ApiError ? e.message : "Lỗi tạo tin";
            form.setError("vin", { message: msg });
          }
        })}
        className="card"
        style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 880 }}
      >
        <Field label="Hãng" error={form.formState.errors.brand?.message}>
          <input className="input" {...form.register("brand")} />
        </Field>
        <Field label="Dòng xe" error={form.formState.errors.model?.message}>
          <input className="input" {...form.register("model")} />
        </Field>
        <Field label="Năm sản xuất" error={form.formState.errors.year?.message}>
          <input className="input" type="number" {...form.register("year")} />
        </Field>
        <Field label="VIN (11..17)" error={form.formState.errors.vin?.message}>
          <input className="input" {...form.register("vin")} />
        </Field>
        <Field label="Số km" error={form.formState.errors.mileage?.message}>
          <input className="input" type="number" {...form.register("mileage")} />
        </Field>
        <Field label="Hộp số">
          <select className="input" {...form.register("transmission")}>
            {["MT", "AT", "CVT", "DCT"].map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nhiên liệu">
          <select className="input" {...form.register("fuel")}>
            {["gasoline", "diesel", "hybrid", "electric"].map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Khu vực" error={form.formState.errors.location?.message}>
          <input className="input" {...form.register("location")} />
        </Field>
        <Field label="Ngày ngập (YYYY-MM-DD)" error={form.formState.errors.floodDate?.message}>
          <input className="input" placeholder="2024-09-12" {...form.register("floodDate")} />
        </Field>
        <Field label="Độ sâu ngập (cm)" error={form.formState.errors.floodDepthCm?.message}>
          <input className="input" type="number" {...form.register("floodDepthCm")} />
        </Field>
        <Field label="Vị trí ngập" error={form.formState.errors.floodLocation?.message}>
          <input className="input" {...form.register("floodLocation")} />
        </Field>
        <Field label="Mức độ thiệt hại">
          <select className="input" {...form.register("severity")}>
            <option value="low">Nhẹ</option>
            <option value="medium">Trung bình</option>
            <option value="high">Nặng</option>
          </select>
        </Field>
        <Field label="Giá tối thiểu (VND)" error={form.formState.errors.minPrice?.message}>
          <input className="input" type="number" {...form.register("minPrice")} />
        </Field>
        <Field label="Giá gốc (VND)" error={form.formState.errors.originalPrice?.message}>
          <input className="input" type="number" {...form.register("originalPrice")} />
        </Field>
        <Field label="Bảo hành" error={form.formState.errors.warranty?.message}>
          <input className="input" {...form.register("warranty")} />
        </Field>
        <Field label="Mô tả" error={form.formState.errors.description?.message}>
          <textarea className="input" rows={3} {...form.register("description")} />
        </Field>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field
            label="Image keys (mỗi key trên 1 dòng hoặc cách bằng dấu phẩy, ≥4 ảnh)"
            error={form.formState.errors.imageKeysCsv?.message}
          >
            <textarea
              className="input"
              rows={3}
              placeholder="listing/202605/01HXY...jpg, listing/202605/01HXZ...jpg, ..."
              {...form.register("imageKeysCsv")}
            />
          </Field>
        </div>
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={create.isPending}>
            {create.isPending ? "Đang gửi…" : "Đăng tin"}
          </button>
        </div>
      </form>
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error ? <div style={{ color: "var(--red-600)", fontSize: 12, marginTop: 4 }}>{error}</div> : null}
    </div>
  );
}
