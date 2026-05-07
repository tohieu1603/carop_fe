"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { Role } from "@/lib/types";

const ROLES: { id: Role; l: string; icon: string; color: string }[] = [
  { id: "buyer", l: "Buyer", icon: "🛒", color: "oklch(0.55 0.15 240)" },
  { id: "seller", l: "Seller", icon: "🚗", color: "oklch(0.55 0.18 145)" },
  { id: "admin", l: "Admin", icon: "⚙", color: "oklch(0.18 0.01 230)" },
];

export function RoleSwitcher() {
  const role = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);
  const router = useRouter();

  const onChange = (r: Role) => {
    setRole(r);
    if (r === "admin") router.push("/admin");
    else if (r === "seller") router.push("/dashboard");
    else router.push("/");
  };

  return (
    <div style={{ position: "fixed", top: 14, right: 14, zIndex: 110 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 999, padding: 4, boxShadow: "0 4px 16px oklch(0 0 0 / 0.12)", border: "1px solid var(--border)" }}>
        <span style={{ fontSize: 10, color: "var(--ink-500)", padding: "0 8px 0 12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Demo as</span>
        {ROLES.map((r) => (
          <button key={r.id} onClick={() => onChange(r.id)}
            style={{
              padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: role === r.id ? r.color : "transparent",
              color: role === r.id ? "white" : "var(--ink-600)",
              display: "flex", alignItems: "center", gap: 6, cursor: "pointer", border: "none",
            }}>
            <span style={{ fontSize: 13 }}>{r.icon}</span>{r.l}
          </button>
        ))}
      </div>
    </div>
  );
}

const BUYER_GROUPS = [
  { label: "Mua xe", items: [
    { href: "/", l: "🏠 Trang chủ" },
    { href: "/browse", l: "🔍 Danh sách xe" },
    { href: "/cars/XN-2024-0142", l: "📋 Chi tiết xe" },
    { href: "/checkout/XN-2024-0142", l: "💳 Đặt cọc" },
  ]},
  { label: "Tài khoản", items: [{ href: "/dashboard", l: "📊 Dashboard" }] },
  { label: "Khác", items: [
    { href: "/blog", l: "📰 Tin tức" },
    { href: "/login", l: "🔐 Đăng nhập" },
  ]},
];
const SELLER_GROUPS = [
  { label: "Bán xe", items: [{ href: "/sell", l: "📤 Đăng tin" }] },
  { label: "Quản lý", items: [{ href: "/dashboard", l: "📊 Dashboard" }] },
  { label: "Khám phá", items: [
    { href: "/", l: "🏠 Trang chủ" },
    { href: "/browse", l: "🔍 Danh sách xe" },
  ]},
];
const ADMIN_GROUPS = [
  { label: "Internal Admin", items: [
    { href: "/admin", l: "📊 Tổng quan" },
    { href: "/admin/listings", l: "🚗 Xe & Offers" },
    { href: "/admin/listings/XN-2024-0142", l: "📋 Chi tiết xe (full)" },
    { href: "/admin/users", l: "👥 Người dùng" },
    { href: "/admin/escrow", l: "🔒 Escrow" },
    { href: "/admin/reports", l: "📈 Báo cáo" },
  ]},
  { label: "Public", items: [{ href: "/", l: "🏠 Public site" }] },
];
const ROLE_COLORS: Record<Role, string> = {
  buyer: "oklch(0.55 0.15 240)",
  seller: "oklch(0.55 0.18 145)",
  admin: "oklch(0.18 0.01 230)",
};

export function DemoControls() {
  return (
    <>
      <RoleSwitcher />
      <DemoNav />
    </>
  );
}

export function DemoNav() {
  const role = useAppStore((s) => s.role);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const groups = role === "admin" ? ADMIN_GROUPS : role === "seller" ? SELLER_GROUPS : BUYER_GROUPS;

  return (
    <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 100 }}>
      {open && (
        <div style={{ background: "oklch(0.18 0.01 230)", borderRadius: 12, padding: 8, marginBottom: 8, boxShadow: "0 12px 32px oklch(0 0 0 / 0.2)", minWidth: 260, maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ padding: "8px 12px 6px", fontSize: 10, fontWeight: 700, color: ROLE_COLORS[role], textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {role === "admin" ? "⚙ Admin View" : role === "seller" ? "🚗 Seller View" : "🛒 Buyer View"}
          </div>
          {groups.map((g) => (
            <div key={g.label}>
              <div style={{ fontSize: 10, color: "oklch(1 0 0 / 0.4)", padding: "8px 12px 4px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{g.label}</div>
              {g.items.map((i) => {
                const active = pathname === i.href;
                return (
                  <a key={i.href} href={i.href} onClick={() => setOpen(false)}
                    style={{
                      display: "block", textAlign: "left",
                      padding: "7px 12px", borderRadius: 6, fontSize: 13,
                      background: active ? "oklch(1 0 0 / 0.1)" : "transparent",
                      color: active ? "white" : "oklch(1 0 0 / 0.7)",
                      textDecoration: "none",
                    }}>
                    {i.l}
                  </a>
                );
              })}
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="btn"
        style={{ background: ROLE_COLORS[role], color: "white", borderRadius: 999, padding: "12px 20px", fontSize: 13, boxShadow: "0 8px 24px oklch(0 0 0 / 0.2)", border: "none", cursor: "pointer" }}>
        {open ? "✕ Đóng" : "☰ Demo"}
      </button>
    </div>
  );
}
