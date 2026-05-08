"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { InspectionReport, InspectionRequest, Listing, PageResult } from "@/types/api";

export interface InspectorRequestsQuery {
  location?: string;
  cursor?: number;
  limit?: number;
}

const KEY = (q: InspectorRequestsQuery) => ["inspector", "requests", q] as const;

// GET /api/inspector/requests
export function useInspectorRequests(query: InspectorRequestsQuery = {}) {
  return useQuery({
    queryKey: KEY(query),
    queryFn: () =>
      api.get<PageResult<InspectionRequest, number>>("/api/inspector/requests", query as Record<string, unknown>),
  });
}

// POST /api/inspector/requests/:id/claim — returns flat { id, status }
export function useClaimInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      api.post<{ id: string; status: string }>(`/api/inspector/requests/${id}/claim`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inspector", "requests"] }),
  });
}

// POST /api/inspector/requests/:id/report — returns flat { id, requestId, listingId, approved, score, listingApplied }
export function useSubmitInspectionReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: {
        score: number;
        damage?: Record<string, unknown>;
        repairs?: string[];
        approved: boolean;
        notes?: string;
        evidenceKeys?: string[];
      };
    }) =>
      api.post<{
        id: string;
        requestId: string;
        listingId: string;
        approved: boolean;
        score: number;
        listingApplied: boolean;
      }>(`/api/inspector/requests/${id}/report`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspector"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
