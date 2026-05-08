"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type {
  Fuel,
  InspectionSummary,
  Listing,
  ListingImage,
  ListingStatus,
  PageResult,
  Severity,
  Transmission,
} from "@/types/api";

export interface PublicListingQuery {
  q?: string;
  brand?: string;
  severity?: Severity;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  sort?: "newest" | "priceAsc" | "priceDesc";
  cursor?: string;
  limit?: number;
}

export interface MyListingsQuery {
  cursor?: string;
  limit?: number;
  status?: ListingStatus;
}

export interface AdminListingsQuery {
  status?: string;
  severity?: Severity;
  q?: string;
  cursor?: string;
  limit?: number;
}

export interface CreateListingDto {
  brand: string;
  model: string;
  year: number;
  vin: string;
  mileage: number;
  transmission: Transmission;
  fuel: Fuel;
  location: string;
  floodDate: string;
  floodDepthCm: number;
  floodLocation: string;
  severity: Severity;
  damage?: Record<string, unknown>;
  repairs?: string[];
  minPrice: string;
  originalPrice: string;
  description?: string;
  warranty?: string;
  imageKeys: string[];
}

export type UpdateListingDto = Partial<Omit<CreateListingDto, "vin" | "year" | "originalPrice">> & {
  version: number;
};

const KEYS = {
  list: (q: PublicListingQuery) => ["listings", "list", q] as const,
  detail: (id: string) => ["listings", "detail", id] as const,
  inspection: (id: string) => ["listings", "inspection", id] as const,
  mine: (q: MyListingsQuery) => ["listings", "mine", q] as const,
  adminList: (q: AdminListingsQuery) => ["admin", "listings", q] as const,
};

// GET /api/listings
export function useListings(query: PublicListingQuery = {}) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn: () => api.get<PageResult<Listing>>("/api/listings", query as Record<string, unknown>),
  });
}

// GET /api/listings/:id
export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.detail(id ?? ""),
    enabled: !!id,
    queryFn: () => api.get<Listing & { images: ListingImage[] }>(`/api/listings/${id}`),
  });
}

// GET /api/listings/:id/inspection
export function useListingInspection(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.inspection(id ?? ""),
    enabled: !!id,
    queryFn: () => api.get<InspectionSummary | null>(`/api/listings/${id}/inspection`),
  });
}

// POST /api/listings — BE returns flat Listing
export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateListingDto) => api.post<Listing>("/api/listings", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

// PATCH /api/listings/:id — BE returns flat Listing (partial fields)
export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateListingDto }) =>
      api.patch<Listing>(`/api/listings/${id}`, body),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(vars.id) });
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

// POST /api/listings/:id/hide — BE returns flat {id, status}
export function useHideListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => api.post<{ id: string; status: string }>(`/api/listings/${id}/hide`),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(v.id) });
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

// POST /api/listings/:id/unhide — BE returns flat {id, status}
export function useUnhideListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => api.post<{ id: string; status: string }>(`/api/listings/${id}/unhide`),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(v.id) });
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

// GET /api/me/listings
export function useMyListings(query: MyListingsQuery = {}) {
  return useQuery({
    queryKey: KEYS.mine(query),
    queryFn: () => api.get<PageResult<Listing>>("/api/me/listings", query as Record<string, unknown>),
  });
}

// POST /api/admin/listings/:id/approve — BE returns flat Listing
export function useApproveListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => api.post<Listing>(`/api/admin/listings/${id}/approve`),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(v.id) });
      qc.invalidateQueries({ queryKey: ["admin", "listings"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

// POST /api/admin/listings/:id/sold — BE returns flat Listing
export function useMarkListingSold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, finalPrice }: { id: string; finalPrice: number }) =>
      api.post<Listing>(`/api/admin/listings/${id}/sold`, { finalPrice }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: KEYS.detail(v.id) });
      qc.invalidateQueries({ queryKey: ["admin", "listings"] });
    },
  });
}

// GET /api/admin/listings
export function useAdminListings(query: AdminListingsQuery = {}) {
  return useQuery({
    queryKey: KEYS.adminList(query),
    queryFn: () => api.get<PageResult<Listing>>("/api/admin/listings", query as Record<string, unknown>),
  });
}
