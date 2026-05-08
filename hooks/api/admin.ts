"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Transaction } from "@/types/api";

export interface StatsSummary {
  listingsCount: number;
  offersCount: number;
  buyersCount: number;
  gmvPotential: string;
  gmvRealized: string;
}

export type FunnelStep = { name: string; count: number };
export type FunnelData = FunnelStep[];

// GET /api/admin/stats/summary
export function useAdminSummary(range: "7d" | "30d" | "90d" = "30d") {
  return useQuery({
    queryKey: ["admin", "stats", "summary", range],
    queryFn: () => api.get<StatsSummary>("/api/admin/stats/summary", { range }),
  });
}

// GET /api/admin/stats/funnel
export function useAdminFunnel(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: ["admin", "stats", "funnel", from, to],
    enabled,
    queryFn: () => api.get<FunnelData>("/api/admin/stats/funnel", { from, to }),
  });
}

// POST /api/events
export function useTrackEvent() {
  return useMutation({
    mutationFn: (body: { type: string; refType?: string; refId?: string; meta?: Record<string, unknown> }) =>
      api.post<{ accepted: true }>("/api/events", body),
  });
}

// POST /api/admin/jobs/forfeit-overdue
export function useJobForfeitOverdue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ forfeited: number }>("/api/admin/jobs/forfeit-overdue"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deposits"] }),
  });
}

// POST /api/admin/jobs/payout/:txnId
export function useJobPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ txnId }: { txnId: string }) =>
      api.post<{ promoted?: boolean; transaction?: Transaction }>(`/api/admin/jobs/payout/${txnId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

// POST /api/admin/jobs/refresh-user-stats
export function useJobRefreshUserStats() {
  return useMutation({
    mutationFn: () => api.post<{ refreshed: true }>("/api/admin/jobs/refresh-user-stats"),
  });
}

// POST /api/admin/jobs/reset-listings-sequence
export function useJobResetListingSequence() {
  return useMutation({
    mutationFn: () => api.post<{ reset: true }>("/api/admin/jobs/reset-listings-sequence"),
  });
}
