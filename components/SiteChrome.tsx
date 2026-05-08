"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/browse", label: "Tìm xe" },
  { href: "/sell", label: "Đăng tin" },
  { href: "/blog", label: "Tin tức" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const user = useAuth((s) => s.user);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "white", borderBottom: "1px solid var(--border)" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", textDecoration: "none", color: "inherit" }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--green-700)", color: "white", display: "grid", placeItems: "center" }}><Icon.Droplet size={16}/></span>
          xengap<span style={{ color: "var(--green-700)" }}>.vn</span>
        </Link>
        <nav style={{ display: "flex", gap: 4 }}>
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));
            return (
              <Link key={n.href} href={n.href}
                style={{
                  padding: "8px 14px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                  background: active ? "var(--green-50)" : "transparent",
                  color: active ? "var(--green-700)" : "var(--ink-700)",
                  textDecoration: "none",
                }}>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {user ? (
            <Link href="/dashboard" className="btn btn-secondary btn-sm" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--green-100)", color: "var(--green-700)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>
                {user.fullName.slice(0, 2).toUpperCase()}
              </span>
              {user.fullName.split(" ").slice(-1)[0]}
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">Đăng nhập</Link>
              <Link href="/login" className="btn btn-primary btn-sm">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer style={{ background: "var(--ink-900)", color: "white", padding: "48px 0 32px", marginTop: 64 }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--green-700)", display: "grid", placeItems: "center" }}><Icon.Droplet size={16}/></span>
            xengap<span style={{ color: "var(--green-300)" }}>.vn</span>
          </div>
          <p style={{ fontSize: 13, color: "oklch(1 0 0 / 0.6)", maxWidth: 360 }}>Sàn giao dịch xe đã ngập nước minh bạch hàng đầu Việt Nam. Mọi xe đều được kiểm định bởi đội ngũ kỹ sư xengap.vn.</p>
        </div>
        {[
          { t: "Mua xe", l: ["Tìm xe ngập", "Bộ lọc nâng cao", "So sánh giá", "Báo cáo VIN"] },
          { t: "Bán xe", l: ["Đăng tin miễn phí", "Bán cho xengap", "Định giá xe", "Hướng dẫn"] },
          { t: "Hỗ trợ", l: ["Câu hỏi thường gặp", "Liên hệ", "Điều khoản", "Chính sách bảo mật"] },
        ].map((c) => (
          <div key={c.t}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.t}</div>
            {c.l.map((x) => <div key={x} style={{ fontSize: 13, color: "oklch(1 0 0 / 0.6)", padding: "4px 0" }}>{x}</div>)}
          </div>
        ))}
      </div>
      <div className="container" style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid oklch(1 0 0 / 0.1)", fontSize: 12, color: "oklch(1 0 0 / 0.4)" }}>© 2024 xengap.vn — Sàn giao dịch xe đã ngập nước</div>
    </footer>
  );
}
