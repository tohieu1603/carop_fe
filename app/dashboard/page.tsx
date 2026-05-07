"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useMyListings } from "@/hooks/api/listings";
import { useMyOffers } from "@/hooks/api/offers";
import { useMyTransactions } from "@/hooks/api/transactions";
import { useNotifications } from "@/hooks/api/notifications";
import { HasRole } from "@/components/RequireRole";

export default function DashboardHome() {
  const user = useAuth((s) => s.user);
  const myListings = useMyListings({ limit: 5 });
  const myOffers = useMyOffers({ limit: 5 });
  const myTxns = useMyTransactions({ limit: 5 });
  const notif = useNotifications({ limit: 1 });

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Xin chào {user?.fullName || ""}</h1>
      <p style={{ color: "var(--ink-500)", fontSize: 13, marginTop: 4 }}>
        Vai trò: <b>{user?.role}</b> · KYC: <b>{user?.kycStatus}</b>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 24 }}>
        <Stat label="Thông báo chưa đọc" value={notif.data?.unreadCount ?? "—"} href="/dashboard/notifications" />
        <HasRole roles={["BUYER"]}>
          <Stat
            label="Offer đang chờ"
            value={myOffers.data?.items.filter((o) => o.status === "PENDING").length ?? "—"}
            href="/dashboard/offers"
          />
        </HasRole>
        <HasRole roles={["SELLER", "ADMIN", "SUPER_ADMIN"]}>
          <Stat label="Tin của tôi" value={myListings.data?.items.length ?? "—"} href="/dashboard/listings" />
        </HasRole>
        <Stat label="Giao dịch" value={myTxns.data?.items.length ?? "—"} href="/dashboard/transactions" />
      </div>

      <HasRole roles={["BUYER"]}>
        <Section title="Offer gần đây" href="/dashboard/offers">
          {myOffers.isLoading ? (
            <Empty>Đang tải…</Empty>
          ) : myOffers.data?.items.length ? (
            myOffers.data.items.slice(0, 5).map((o) => (
              <Row
                key={o.id}
                left={`Listing ${o.listingId}`}
                middle={`${o.amount} VND`}
                right={o.status}
                href={`/cars/${o.listingId}`}
              />
            ))
          ) : (
            <Empty>Chưa có offer nào.</Empty>
          )}
        </Section>
      </HasRole>

      <HasRole roles={["SELLER", "ADMIN", "SUPER_ADMIN"]}>
        <Section title="Tin của tôi" href="/dashboard/listings">
          {myListings.isLoading ? (
            <Empty>Đang tải…</Empty>
          ) : myListings.data?.items.length ? (
            myListings.data.items.slice(0, 5).map((l) => (
              <Row key={l.id} left={`${l.brand} ${l.model} ${l.year}`} middle={l.status} right={l.id} href={`/dashboard/listings/${l.id}`} />
            ))
          ) : (
            <Empty>Chưa có tin nào.</Empty>
          )}
        </Section>
      </HasRole>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link href={href} className="card" style={{ padding: 16, textDecoration: "none", color: "inherit" }}>
      <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{label}</div>
      <div className="mono" style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
        {value}
      </div>
    </Link>
  );
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h2>
        <Link href={href} style={{ fontSize: 13, color: "var(--green-700)" }}>
          Xem tất cả →
        </Link>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>{children}</div>
    </section>
  );
}

function Row({ left, middle, right, href }: { left: string; middle: string; right: string; href?: string }) {
  const inner = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr auto",
        gap: 16,
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        alignItems: "center",
      }}
    >
      <div>{left}</div>
      <div className="mono" style={{ fontSize: 13, color: "var(--ink-500)" }}>{middle}</div>
      <span className="badge badge-neutral">{right}</span>
    </div>
  );
  return href ? (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      {inner}
    </Link>
  ) : (
    inner
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 24, textAlign: "center", color: "var(--ink-500)", fontSize: 14 }}>{children}</div>;
}
