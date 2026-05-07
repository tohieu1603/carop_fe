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

// POST /api/inspector/requests/:id/claim
export function useClaimInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      api.post<{ request: InspectionRequest }>(`/api/inspector/requests/${id}/claim`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inspector", "requests"] }),
  });
}

// POST /api/inspector/requests/:id/report
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
      api.post<{ report: InspectionReport; request: InspectionRequest; listing: Listing }>(
        `/api/inspector/requests/${id}/report`,
        body,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspector"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
