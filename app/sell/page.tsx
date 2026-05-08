"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export default function SellPage() {
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const router = useRouter();

  // If seller/admin and KYC approved, redirect to real form
  useEffect(() => {
    if (!hydrated) return;
    if (user && (user.role === "SELLER" || user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
      if (user.kycStatus === "APPROVED") {
        router.replace("/dashboard/listings/new");
      }
    }
  }, [hydrated, user, router]);

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ padding: "32px 0", maxWidth: 720 }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--ink-500)" }}>← Trang chủ</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 12 }}>Đăng bán xe ngập của bạn</h1>
        <p style={{ color: "var(--ink-600)", marginTop: 8 }}>
          Đội kiểm định xengap.vn sẽ liên hệ trong 24h. Bạn chỉ trả phí khi xe bán được.
        </p>

        {hydrated && !user && (
          <div className="card" style={{ padding: 24, marginTop: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>Đăng nhập để đăng tin</h2>
            <p style={{ fontSize: 14, color: "var(--ink-600)", margin: "0 0 16px" }}>
              Bạn cần tài khoản seller với KYC được duyệt để đăng tin trên xengap.vn.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/login" className="btn btn-primary">Đăng nhập</Link>
              <Link href="/login" className="btn btn-secondary">Đăng ký</Link>
            </div>
          </div>
        )}

        {hydrated && user && user.kycStatus !== "APPROVED" && (
          <div className="card" style={{ padding: 24, marginTop: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>Xác thực danh tính (KYC)</h2>
            <p style={{ fontSize: 14, color: "var(--ink-600)", margin: "0 0 16px" }}>
              Để đăng tin bán xe, bạn cần hoàn thành xác thực KYC. Trạng thái hiện tại:{" "}
              <b>{user.kycStatus}</b>.
            </p>
            {user.kycStatus === "NONE" && (
              <Link href="/dashboard/profile" className="btn btn-primary">Nộp KYC ngay</Link>
            )}
            {user.kycStatus === "PENDING" && (
              <div style={{ fontSize: 13, color: "var(--amber-600)" }}>
                Hồ sơ KYC đang chờ xét duyệt. Vui lòng quay lại sau.
              </div>
            )}
            {user.kycStatus === "REJECTED" && (
              <Link href="/dashboard/profile" className="btn btn-primary">Nộp lại KYC</Link>
            )}
          </div>
        )}

        {/* Info cards for non-logged-in visitors */}
        {(!hydrated || !user) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 32 }}>
            {[
              { icon: "🆓", t: "Miễn phí đăng tin", d: "Không tốn phí cho đến khi xe bán được." },
              { icon: "📋", t: "Kiểm định chuyên nghiệp", d: "Đội kỹ sư xengap sẽ kiểm định xe tại nhà bạn." },
              { icon: "🔒", t: "Thanh toán an toàn", d: "Tiền được giữ trong escrow cho đến khi bàn giao xe." },
            ].map((c) => (
              <div key={c.t} className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{c.t}</div>
                <div style={{ fontSize: 13, color: "var(--ink-600)" }}>{c.d}</div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
