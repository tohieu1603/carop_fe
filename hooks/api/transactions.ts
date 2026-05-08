"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, newIdempotencyKey } from "@/lib/api/client";
import type { Dispute, PageResult, PaymentInit, Transaction, TxnStatus } from "@/types/api";

export interface MyTxnQuery {
  role?: "buyer" | "seller";
  cursor?: number;
  limit?: number;
  status?: TxnStatus;
}
export interface AdminTxnQuery {
  status?: TxnStatus;
  cursor?: number;
  limit?: number;
}

const KEYS = {
  detail: (id: string) => ["transactions", "detail", id] as const,
  mine: (q: MyTxnQuery) => ["transactions", "mine", q] as const,
  admin: (q: AdminTxnQuery) => ["admin", "transactions", q] as const,
};

// GET /api/transactions/:id — BE returns flat Transaction (not {transaction: Transaction})
export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.detail(id ?? ""),
    enabled: !!id,
    queryFn: () => api.get<Transaction>(`/api/transactions/${id}`),
  });
}

// POST /api/transactions/:id/pay-balance — BE returns {transactionId, amount, redirectUrl, replayed}
export function usePayBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      api.post<{ transactionId: string; amount: string; redirectUrl?: string; replayed: boolean }>(
        `/api/transactions/${id}/pay-balance`,
        {},
        { idempotencyKey: newIdempotencyKey() },
      ),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(v.id) });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

// POST /api/transactions/:id/confirm-receipt — likely flat Transaction
export function useConfirmReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      api.post<Transaction>(`/api/transactions/${id}/confirm-receipt`, { note }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(v.id) });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

// POST /api/transactions/:id/dispute — likely flat {id, transactionId, status}
export function useOpenDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, evidence }: { id: string; reason: string; evidence?: string[] }) =>
      api.post<{ id: string; transactionId: string; status: string }>(`/api/transactions/${id}/dispute`, { reason, evidence }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(v.id) });
      qc.invalidateQueries({ queryKey: ["disputes"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

// GET /api/me/transactions
export function useMyTransactions(query: MyTxnQuery = {}) {
  return useQuery({
    queryKey: KEYS.mine(query),
    queryFn: () => api.get<PageResult<Transaction, number>>("/api/me/transactions", query as Record<string, unknown>),
  });
}

// GET /api/admin/transactions
export function useAdminTransactions(query: AdminTxnQuery = {}) {
  return useQuery({
    queryKey: KEYS.admin(query),
    queryFn: () =>
      api.get<PageResult<Transaction, number>>("/api/admin/transactions", query as Record<string, unknown>),
  });
}

// POST /api/admin/transactions — BE returns flat Transaction
export function useAdminCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId, finalPrice }: { offerId: string; finalPrice: string }) =>
      api.post<Transaction>("/api/admin/transactions", { offerId, finalPrice }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "transactions"] }),
  });
}

// POST /api/admin/transactions/:id/run-payout — BE returns {ran: boolean, reason?: string}
export function useRunPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      api.post<{ ran: boolean; reason?: string }>(`/api/admin/transactions/${id}/run-payout`),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(v.id) });
      qc.invalidateQueries({ queryKey: ["admin", "transactions"] });
    },
  });
}
