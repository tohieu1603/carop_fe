"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Dispute, DisputeDecision, DisputeStatus, PageResult, Transaction } from "@/types/api";

export interface AdminDisputesQuery {
  status?: DisputeStatus;
  cursor?: number;
  limit?: number;
}

const KEY = (q: AdminDisputesQuery) => ["admin", "disputes", q] as const;

// GET /api/admin/disputes
export function useAdminDisputes(query: AdminDisputesQuery = {}) {
  return useQuery({
    queryKey: KEY(query),
    queryFn: () => api.get<PageResult<Dispute, number>>("/api/admin/disputes", query as Record<string, unknown>),
  });
}

// POST /api/admin/disputes/:id/resolve
export function useResolveDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      decision,
      splitPct,
      rationale,
    }: {
      id: string;
      decision: DisputeDecision;
      splitPct?: number;
      rationale: string;
    }) =>
      api.post<{ dispute: Dispute; transaction: Transaction }>(`/api/admin/disputes/${id}/resolve`, {
        decision,
        splitPct,
        rationale,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "disputes"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
