"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@/hooks/api/auth";
import type { Role } from "@/types/api";

interface NavItem {
  href: string;
  label: string;
  roles?: Role[];
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Chung",
    items: [
      { href: "/dashboard", label: "Tổng quan" },
      { href: "/dashboard/profile", label: "Hồ sơ" },
      { href: "/dashboard/notifications", label: "Thông báo" },
    ],
  },
  {
    section: "Mua",
    items: [
      { href: "/dashboard/offers", label: "Offer của tôi", roles: ["BUYER"] },
      { href: "/dashboard/deposits", label: "Đặt cọc", roles: ["BUYER", "ADMIN", "SUPER_ADMIN"] },
      { href: "/dashboard/transactions", label: "Giao dịch", roles: ["BUYER", "SELLER", "INSPECTOR", "ADMIN", "SUPER_ADMIN"] },
    ],
  },
  {
    section: "Bán",
    items: [
      { href: "/dashboard/listings", label: "Tin của tôi", roles: ["SELLER", "ADMIN", "SUPER_ADMIN"] },
      { href: "/dashboard/listings/new", label: "+ Đăng tin", roles: ["SELLER", "ADMIN", "SUPER_ADMIN"] },
    ],
  },
  {
    section: "Kiểm định",
    items: [
      { href: "/dashboard/inspector/requests", label: "Yeu cau kiem dinh", roles: ["INSPECTOR", "ADMIN", "SUPER_ADMIN"] },
      { href: "/inspector/queue", label: "Hang doi (moi)", roles: ["INSPECTOR", "ADMIN", "SUPER_ADMIN"] },
    ],
  },
  {
    section: "Quản trị",
    items: [
      { href: "/dashboard/admin/users", label: "Người dùng", roles: ["ADMIN", "SUPER_ADMIN"] },
      { href: "/dashboard/admin/kyc", label: "Duyệt KYC", roles: ["ADMIN", "SUPER_ADMIN"] },
      { href: "/dashboard/admin/listings", label: "Tin đăng", roles: ["ADMIN", "SUPER_ADMIN"] },
      { href: "/dashboard/admin/transactions", label: "Giao dịch", roles: ["ADMIN", "SUPER_ADMIN"] },
      { href: "/dashboard/admin/disputes", label: "Khiếu nại", roles: ["ADMIN", "SUPER_ADMIN"] },
      { href: "/dashboard/admin/blog", label: "Bài viết", roles: ["ADMIN", "SUPER_ADMIN"] },
      { href: "/dashboard/admin/stats", label: "Báo cáo KPI", roles: ["ADMIN", "SUPER_ADMIN"] },
    ],
  },
];

function visible(items: NavItem[], role: Role | undefined) {
  return items.filter((i) => !i.roles || (role && i.roles.includes(role)));
}

export function Sidebar() {
  const path = usePathname();
  const user = useAuth((s) => s.user);
  const logout = useLogout();

  return (
    <aside
      style={{
        background: "var(--ink-900)",
        color: "white",
        padding: 20,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link href="/" style={{ fontWeight: 700, fontSize: 18, color: "var(--green-300)", textDecoration: "none" }}>
        xengap.vn
      </Link>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
        {user ? `${user.fullName} · ${user.role}` : ""}
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28, flex: 1 }}>
        {NAV.map((section) => {
          const items = visible(section.items, user?.role);
          if (items.length === 0) return null;
          return (
            <div key={section.section}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {section.section}
              </div>
              {items.map((it) => {
                const active = path === it.href || (it.href !== "/dashboard" && path.startsWith(it.href));
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    style={{
                      display: "block",
                      color: active ? "var(--green-300)" : "rgba(255,255,255,0.85)",
                      textDecoration: "none",
                      padding: "7px 10px",
                      borderRadius: 6,
                      background: active ? "rgba(255,255,255,0.06)" : "transparent",
                      fontSize: 14,
                    }}
                  >
                    {it.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => logout.mutate()}
        className="btn btn-secondary btn-sm"
        style={{ marginTop: 16 }}
      >
        Đăng xuất
      </button>
    </aside>
  );
}
