"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import type { AuthMe, User } from "@/types/api";

const KEY = ["auth", "me"] as const;

// POST /api/auth/register
export function useRegister() {
  return useMutation({
    mutationFn: (body: { phone: string; password: string; fullName: string }) =>
      api.post<{ userId: string; otpDevHint?: string }>("/api/auth/register", body),
  });
}

// POST /api/auth/verify-otp
export function useVerifyOtp() {
  const setSession = useAuth((s) => s.setSession);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { phone: string; otp: string; deviceId?: string }) =>
      api.post<{ accessToken: string; user: User }>("/api/auth/verify-otp", body),
    onSuccess: ({ user, accessToken }) => {
      setSession({ user, accessToken });
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

// POST /api/auth/login
export function useLogin() {
  const setSession = useAuth((s) => s.setSession);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { phone: string; password: string; deviceId?: string }) =>
      api.post<{ accessToken: string; user: User }>("/api/auth/login", body),
    onSuccess: ({ user, accessToken }) => {
      setSession({ user, accessToken });
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

// POST /api/auth/logout
export function useLogout() {
  const clear = useAuth((s) => s.clear);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<void>("/api/auth/logout"),
    onSettled: () => {
      clear();
      qc.clear();
    },
  });
}

// POST /api/auth/logout-all
export function useLogoutAll() {
  const clear = useAuth((s) => s.clear);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<void>("/api/auth/logout-all"),
    onSettled: () => {
      clear();
      qc.clear();
    },
  });
}

// POST /api/auth/forgot
export function useForgotPassword() {
  return useMutation({
    mutationFn: (body: { phone: string }) => api.post<{ message: string }>("/api/auth/forgot", body),
  });
}

// POST /api/auth/reset
export function useResetPassword() {
  return useMutation({
    mutationFn: (body: { phone: string; otp: string; newPassword: string }) =>
      api.post<{ message: string }>("/api/auth/reset", body),
  });
}

// POST /api/auth/change-password/request-otp
export function useRequestChangePasswordOtp() {
  return useMutation({
    mutationFn: () => api.post<{ otpDevHint?: string }>("/api/auth/change-password/request-otp"),
  });
}

// POST /api/auth/change-password
export function useChangePassword() {
  const clear = useAuth((s) => s.clear);
  return useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string; otp: string }) =>
      api.post<{ message: string }>("/api/auth/change-password", body),
    onSuccess: () => clear(),
  });
}

// GET /api/auth/me
export function useMe(opts?: { enabled?: boolean }) {
  const setMe = useAuth((s) => s.setMe);
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const data = await api.get<AuthMe>("/api/auth/me");
      setMe(data);
      return data;
    },
    enabled: opts?.enabled ?? true,
    staleTime: 60_000,
  });
}
