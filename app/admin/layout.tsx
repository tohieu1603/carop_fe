import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside style={{ background: "var(--ink-900)", color: "white", padding: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "var(--green-300)" }}>xengap admin</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 32, fontSize: 14 }}>
          <Link href="/admin" style={navStyle}>Tổng quan</Link>
          <Link href="/admin/listings" style={navStyle}>Tin đăng</Link>
          <Link href="/admin/users" style={navStyle}>Người dùng</Link>
          <Link href="/admin/escrow" style={navStyle}>Bảo lãnh</Link>
          <Link href="/admin/reports" style={navStyle}>Báo cáo</Link>
        </nav>
        <Link href="/" style={{ ...navStyle, marginTop: 32, color: "var(--ink-400)" }}>← Site chính</Link>
      </aside>
      <main style={{ padding: 32, background: "var(--bg-soft)" }}>{children}</main>
    </div>
  );
}

const navStyle: React.CSSProperties = { color: "rgba(255,255,255,0.85)", textDecoration: "none", padding: "8px 12px", borderRadius: 6 };
