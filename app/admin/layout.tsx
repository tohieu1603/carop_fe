import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside style={{ background: "var(--ink-900)", color: "white", padding: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "var(--green-300)" }}>xengap admin</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 32, fontSize: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 12px", marginTop: 8 }}>Tổng quan</div>
          <Link href="/admin" style={navStyle}>Tổng quan</Link>
          <Link href="/admin/reports" style={navStyle}>Báo cáo</Link>

          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 12px", marginTop: 12 }}>Nội dung</div>
          <Link href="/admin/listings" style={navStyle}>Tin đăng</Link>
          <Link href="/admin/users" style={navStyle}>Người dùng</Link>
          <Link href="/admin/escrow" style={navStyle}>Bảo lãnh</Link>

          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 12px", marginTop: 12 }}>Duyệt</div>
          <Link href="/admin/kyc" style={navStyle}>Duyet KYC</Link>
          <Link href="/admin/disputes" style={navStyle}>Khieu nai</Link>
          <Link href="/dashboard/admin/blog" style={navStyle}>Bài viết</Link>
          <Link href="/dashboard/admin/transactions" style={navStyle}>Giao dịch</Link>
        </nav>
        <div style={{ marginTop: 32, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16 }}>
          <Link href="/dashboard" style={{ ...navStyle, color: "var(--green-300)" }}>Dashboard →</Link>
          <Link href="/" style={{ ...navStyle, color: "var(--ink-400)" }}>← Site chính</Link>
        </div>
      </aside>
      <main style={{ padding: 32, background: "var(--bg-soft)" }}>{children}</main>
    </div>
  );
}

const navStyle: React.CSSProperties = { color: "rgba(255,255,255,0.85)", textDecoration: "none", padding: "8px 12px", borderRadius: 6, display: "block" };
