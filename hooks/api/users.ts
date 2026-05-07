"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { KycRequest, KycRequestStatus, PageResult, Role, User, UserStatus } from "@/types/api";

const ME_KEY = ["users", "me"] as const;
const ADMIN_USERS_KEY = (q: AdminUserListQuery) => ["admin", "users", q] as const;
const ADMIN_KYC_KEY = (q: AdminKycListQuery) => ["admin", "kyc", q] as const;

export interface AdminUserListQuery {
  role?: Role;
  status?: UserStatus;
  q?: string;
  cursor?: string;
  limit?: number;
}

export interface AdminKycListQuery {
  status?: KycRequestStatus;
  cursor?: string;
  limit?: number;
}

// GET /api/users/me
export function useUserMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: () => api.get<{ user: User }>("/api/users/me"),
  });
}

// PATCH /api/users/me
export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { fullName?: string; email?: string; avatarKey?: string }) =>
      api.patch<{ user: User }>("/api/users/me", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ME_KEY });
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

// POST /api/users/me/kyc
export function useSubmitKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { frontKey: string; backKey: string; selfieKey: string }) =>
      api.post<{ kycRequestId: string; status: "PENDING" }>("/api/users/me/kyc", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ME_KEY });
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

// GET /api/admin/users
export function useAdminUsers(query: AdminUserListQuery = {}) {
  return useQuery({
    queryKey: ADMIN_USERS_KEY(query),
    queryFn: () => api.get<PageResult<User>>("/api/admin/users", query as Record<string, unknown>),
  });
}

// POST /api/admin/users/:id/block
export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post<{ user: User }>(`/api/admin/users/${id}/block`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

// POST /api/admin/users/:id/unblock
export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => api.post<{ user: User }>(`/api/admin/users/${id}/unblock`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

// GET /api/admin/kyc
export function useAdminKyc(query: AdminKycListQuery = {}) {
  return useQuery({
    queryKey: ADMIN_KYC_KEY(query),
    queryFn: () => api.get<PageResult<KycRequest>>("/api/admin/kyc", query as Record<string, unknown>),
  });
}

// POST /api/admin/kyc/:id/decision
export function useDecideKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, reason }: { id: string; decision: "APPROVE" | "REJECT"; reason?: string }) =>
      api.post<{ kycRequest: KycRequest; user: User }>(`/api/admin/kyc/${id}/decision`, { decision, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "kyc"] });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
