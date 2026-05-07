"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Notification, PageResult } from "@/types/api";

export interface NotificationQuery {
  cursor?: number;
  limit?: number;
  unreadOnly?: boolean;
}

const KEY = (q: NotificationQuery) => ["notifications", q] as const;

interface NotificationsPage extends PageResult<Notification, number> {
  unreadCount: number;
}

// GET /api/me/notifications
export function useNotifications(query: NotificationQuery = {}) {
  return useQuery({
    queryKey: KEY(query),
    queryFn: () => api.get<NotificationsPage>("/api/me/notifications", query as Record<string, unknown>),
  });
}

// POST /api/me/notifications/read-all
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ updated: number }>("/api/me/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// POST /api/me/notifications/:id/read
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => api.post<{ notification: Notification }>(`/api/me/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
