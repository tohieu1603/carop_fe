"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/api/notifications";

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const q = useNotifications({ limit: 50, unreadOnly });
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();
  return (
    <>
      <PageHeader
        title="Thông báo"
        subtitle={`${q.data?.unreadCount ?? 0} chưa đọc`}
        actions={
          <>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
              <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
              Chỉ chưa đọc
            </label>
            <button className="btn btn-secondary btn-sm" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
              Đánh dấu đọc tất cả
            </button>
          </>
        }
      />
      <div className="card" style={{ overflow: "hidden" }}>
        {q.isLoading ? (
          <div style={{ padding: 24, color: "var(--ink-500)" }}>Đang tải…</div>
        ) : !q.data?.items.length ? (
          <div style={{ padding: 24, color: "var(--ink-500)" }}>Không có thông báo.</div>
        ) : (
          q.data.items.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.readAt && markOne.mutate({ id: n.id })}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                cursor: n.readAt ? "default" : "pointer",
                background: n.readAt ? "transparent" : "var(--green-50)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontWeight: 600 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{n.createdAt.slice(0, 16).replace("T", " ")}</div>
              </div>
              {n.body && <div style={{ fontSize: 13, color: "var(--ink-600)", marginTop: 4 }}>{n.body}</div>}
            </div>
          ))
        )}
      </div>
    </>
  );
}
