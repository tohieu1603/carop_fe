"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Offer, PageResult, SellerViewOffer, Transaction } from "@/types/api";

export interface OffersPageQuery {
  cursor?: number;
  limit?: number;
}

const KEYS = {
  byListingSeller: (listingId: string, q: OffersPageQuery) => ["offers", "seller-view", listingId, q] as const,
  mine: (q: OffersPageQuery) => ["offers", "mine", q] as const,
  adminByListing: (listingId: string, q: OffersPageQuery) => ["admin", "offers", listingId, q] as const,
};

// POST /api/listings/:id/offers
export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, amount, message }: { listingId: string; amount: number; message?: string }) =>
      api.post<{ offer: Offer }>(`/api/listings/${listingId}/offers`, { amount, message }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      qc.invalidateQueries({ queryKey: ["listings", "detail", v.listingId] });
    },
  });
}

// GET /api/listings/:id/offers/seller-view
export function useSellerViewOffers(listingId: string | undefined, query: OffersPageQuery = {}) {
  return useQuery({
    queryKey: KEYS.byListingSeller(listingId ?? "", query),
    enabled: !!listingId,
    queryFn: () =>
      api.get<PageResult<SellerViewOffer, number>>(
        `/api/listings/${listingId}/offers/seller-view`,
        query as Record<string, unknown>,
      ),
  });
}

// GET /api/me/offers
export function useMyOffers(query: OffersPageQuery = {}) {
  return useQuery({
    queryKey: KEYS.mine(query),
    queryFn: () => api.get<PageResult<Offer, number>>("/api/me/offers", query as Record<string, unknown>),
  });
}

// POST /api/offers/:id/withdraw
export function useWithdrawOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => api.post<{ offer: Offer }>(`/api/offers/${id}/withdraw`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["offers"] }),
  });
}

// GET /api/admin/listings/:id/offers
export function useAdminListingOffers(listingId: string | undefined, query: OffersPageQuery = {}) {
  return useQuery({
    queryKey: KEYS.adminByListing(listingId ?? "", query),
    enabled: !!listingId,
    queryFn: () =>
      api.get<PageResult<Offer, number>>(
        `/api/admin/listings/${listingId}/offers`,
        query as Record<string, unknown>,
      ),
  });
}

// POST /api/admin/offers/:id/accept
export function useAcceptOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      api.post<{ offer: Offer; transaction: Transaction }>(`/api/admin/offers/${id}/accept`, { note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

// POST /api/admin/offers/:id/reject
export function useRejectOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post<{ offer: Offer }>(`/api/admin/offers/${id}/reject`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["offers"] }),
  });
}
