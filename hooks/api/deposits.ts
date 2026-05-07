"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, newIdempotencyKey } from "@/lib/api/client";
import type { Deposit, DepositStatus, PageResult, PaymentInit } from "@/types/api";

export interface DepositsPageQuery {
  cursor?: number;
  limit?: number;
  status?: DepositStatus;
}

const KEYS = {
  mine: (q: DepositsPageQuery) => ["deposits", "mine", q] as const,
  detail: (id: string) => ["deposits", "detail", id] as const,
  admin: (q: DepositsPageQuery) => ["admin", "deposits", q] as const,
};

// POST /api/listings/:id/deposit
export function useCreateDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId }: { listingId: string }) =>
      api.post<{ deposit: Deposit; payment: PaymentInit }>(
        `/api/listings/${listingId}/deposit`,
        {},
        { idempotencyKey: newIdempotencyKey() },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deposits"] });
    },
  });
}

// GET /api/me/deposits
export function useMyDeposits(query: DepositsPageQuery = {}) {
  return useQuery({
    queryKey: KEYS.mine(query),
    queryFn: () => api.get<PageResult<Deposit, number>>("/api/me/deposits", query as Record<string, unknown>),
  });
}

// GET /api/me/deposits/:id
export function useDeposit(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.detail(id ?? ""),
    enabled: !!id,
    queryFn: () => api.get<{ deposit: Deposit }>(`/api/me/deposits/${id}`),
  });
}

// GET /api/admin/deposits
export function useAdminDeposits(query: DepositsPageQuery = {}) {
  return useQuery({
    queryKey: KEYS.admin(query),
    queryFn: () => api.get<PageResult<Deposit, number>>("/api/admin/deposits", query as Record<string, unknown>),
  });
}

// POST /api/admin/deposits/jobs/forfeit-overdue
export function useForfeitOverdueDeposits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ forfeited: number }>("/api/admin/deposits/jobs/forfeit-overdue"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deposits"] }),
  });
}

// POST /api/admin/deposits/:id/refund
export function useRefundDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post<{ deposit: Deposit }>(`/api/admin/deposits/${id}/refund`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deposits"] }),
  });
}
