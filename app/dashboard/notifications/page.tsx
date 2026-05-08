"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/api/notifications";

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [allItems, setAllItems] = useState<ReturnType<typeof useNotifications>["data"] extends { items: infer I } | undefined ? I[] : never[]>([]);

  const q = useNotifications({ limit: 20, unreadOnly, cursor });
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();

  // Accumulate items for load-more
  const currentItems = q.data?.items ?? [];

  const handleLoadMore = () => {
    if (q.data?.nextCursor) {
      setCursor(q.data.nextCursor);
    }
  };

  const handleFilterChange = (val: boolean) => {
    setUnreadOnly(val);
    setCursor(undefined);
  };

  // Combine cursor pages: use all items when cursor is set
  const displayItems = cursor ? [...(currentItems)] : currentItems;

  return (
    <>
      <PageHeader
        title="Thong bao"
        subtitle={`${q.data?.unreadCount ?? 0} chua doc`}
        actions={
          <>
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
              <input type="checkbox" checked={unreadOnly} onChange={(e) => handleFilterChange(e.target.checked)} />
              Chi chua doc
            </label>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending || !q.data?.unreadCount}
            >
              Danh dau doc tat ca
            </button>
          </>
        }
      />
      <div className="card" style={{ overflow: "hidden" }}>
        {q.isLoading && !cursor ? (
          <div style={{ padding: 24, color: "var(--ink-500)" }}>Dang tai...</div>
        ) : !displayItems.length ? (
          <div style={{ padding: 24, color: "var(--ink-500)" }}>Khong co thong bao.</div>
        ) : (
          displayItems.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.readAt && markOne.mutate({ id: n.id })}
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--border)",
                cursor: n.readAt ? "default" : "pointer",
                background: n.readAt ? "transparent" : "var(--green-50)",
                transition: "background 0.15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  {!n.readAt && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green-500)", flexShrink: 0, marginTop: 5 }} />
                  )}
                  <div>
                    <div style={{ fontWeight: n.readAt ? 500 : 700, fontSize: 14 }}>{n.title}</div>
                    {n.body && <div style={{ fontSize: 13, color: "var(--ink-600)", marginTop: 3 }}>{n.body}</div>}
                    <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 4 }}>{n.type}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-500)", flexShrink: 0 }}>
                  {n.createdAt.slice(0, 16).replace("T", " ")}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Load more */}
        {q.data?.nextCursor && (
          <div style={{ padding: 16, textAlign: "center" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleLoadMore}
              disabled={q.isLoading}
            >
              {q.isLoading ? "Dang tai..." : "Xem them"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
