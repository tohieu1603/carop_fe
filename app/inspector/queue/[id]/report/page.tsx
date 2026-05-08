"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RequireRole } from "@/components/RequireRole";
import { useSubmitInspectionReport } from "@/hooks/api/inspections";
import { useSignUpload, putToS3 } from "@/hooks/api/upload";
import { ApiError } from "@/lib/api/client";

const schema = z.object({
  score: z.number().int().min(0).max(100),
  approved: z.boolean(),
  notes: z.string().optional().or(z.literal("")),
  repairs: z.string().optional().or(z.literal("")),
  damageJson: z.string().optional().or(z.literal("")),
});
type Form = z.infer<typeof schema>;

export default function InspectorReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <RequireRole roles={["INSPECTOR", "ADMIN", "SUPER_ADMIN"]}>
      <Inner requestId={id} />
    </RequireRole>
  );
}

function Inner({ requestId }: { requestId: string }) {
  const router = useRouter();
  const submit = useSubmitInspectionReport();
  const signUpload = useSignUpload();
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const form = useForm<Form>({
    resolver: zodResolver(schema) as never,
    defaultValues: { score: 80, approved: true, notes: "", repairs: "", damageJson: "" },
  });

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEvidenceFiles(Array.from(e.target.files ?? []));
  };

  const handleSubmit = async (v: Form) => {
    setUploading(true);
    try {
      // Upload evidence images
      const evidenceKeys: string[] = [];
      for (const file of evidenceFiles) {
        const signed = await signUpload.mutateAsync({ folder: "inspection", mime: file.type, size: file.size });
        await putToS3(signed.url, file, signed.headers);
        evidenceKeys.push(signed.key);
      }

      // Parse damage JSON
      let damage: Record<string, unknown> = {};
      if (v.damageJson && v.damageJson.trim()) {
        try {
          damage = JSON.parse(v.damageJson);
        } catch {
          form.setError("damageJson", { message: "JSON khong hop le" });
          return;
        }
      }

      const repairs = v.repairs
        ? v.repairs.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      await submit.mutateAsync({
        id: requestId,
        body: {
          score: v.score,
          approved: v.approved,
          notes: v.notes || undefined,
          repairs,
          damage,
          evidenceKeys: evidenceKeys.length > 0 ? evidenceKeys : undefined,
        },
      });

      router.push("/inspector/queue");
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Loi gui bao cao");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 680 }}>
      <Link href="/inspector/queue" style={{ color: "var(--green-700)", fontSize: 13 }}>← Hang doi</Link>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 12 }}>Bao cao kiem dinh</h1>
      <p style={{ fontSize: 13, color: "var(--ink-500)" }}>Request ID: {requestId}</p>

      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="card"
        style={{ padding: 24, marginTop: 20, display: "flex", flexDirection: "column", gap: 18 }}
      >
        {/* Score */}
        <div>
          <label className="label">Diem kiem dinh (0-100)</label>
          <input
            type="number"
            className="input"
            min={0}
            max={100}
            {...form.register("score")}
          />
          {form.formState.errors.score && (
            <div style={{ color: "var(--red-600)", fontSize: 12, marginTop: 4 }}>{form.formState.errors.score.message}</div>
          )}
          {/* Score indicator */}
          <ScoreBar score={Number(form.watch("score"))} />
        </div>

        {/* Approved */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            id="approved"
            {...form.register("approved")}
            style={{ width: 18, height: 18, cursor: "pointer" }}
          />
          <label htmlFor="approved" style={{ fontSize: 14, cursor: "pointer", fontWeight: 600 }}>
            Phe duyet cho len san
          </label>
        </div>

        {/* Repairs */}
        <div>
          <label className="label">Cac hang muc da sua chua (cach nhau bang dau phay)</label>
          <input
            className="input"
            {...form.register("repairs")}
            placeholder="Thay lop, sua may, ve lai xe..."
          />
        </div>

        {/* Damage JSON */}
        <div>
          <label className="label">Tinh trang hu hong (JSON, optional)</label>
          <textarea
            className="input"
            rows={3}
            {...form.register("damageJson")}
            placeholder={`{"dong co": "da sua", "noi that": "con moi"}`}
          />
          {form.formState.errors.damageJson && (
            <div style={{ color: "var(--red-600)", fontSize: 12, marginTop: 4 }}>{form.formState.errors.damageJson.message}</div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="label">Ghi chu them</label>
          <textarea
            className="input"
            rows={3}
            {...form.register("notes")}
            placeholder="Ghi chu them ve tinh trang xe..."
          />
        </div>

        {/* Evidence upload */}
        <div>
          <label className="label">Anh bang chung (tuy chon)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="input"
            style={{ padding: "6px 8px", fontSize: 13 }}
            onChange={handleFilesChange}
          />
          {evidenceFiles.length > 0 && (
            <div style={{ fontSize: 12, color: "var(--green-600)", marginTop: 4 }}>
              Da chon {evidenceFiles.length} anh
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submit.isPending || uploading}
          >
            {uploading ? "Dang tai len..." : submit.isPending ? "Dang gui..." : "Gui bao cao"}
          </button>
          <Link href="/inspector/queue" className="btn btn-secondary">Huy</Link>
        </div>
      </form>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? "var(--green-500)" : pct >= 50 ? "var(--amber-500)" : "var(--red-500)";
  return (
    <div style={{ marginTop: 8, height: 6, background: "var(--bg-soft)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.2s" }} />
    </div>
  );
}
