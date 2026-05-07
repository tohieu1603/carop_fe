"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "@/types/api";
import { setAccessToken } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  permissions: string[];
  hydrated: boolean;
  setSession: (p: { user: User; accessToken?: string; permissions?: string[] }) => void;
  setMe: (p: { user: User; permissions: string[] }) => void;
  clear: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      permissions: [],
      hydrated: false,
      setSession: ({ user, accessToken, permissions }) => {
        if (accessToken) setAccessToken(accessToken);
        set({ user, permissions: permissions ?? [] });
      },
      setMe: ({ user, permissions }) => set({ user, permissions }),
      clear: () => {
        setAccessToken(null);
        set({ user: null, permissions: [] });
      },
    }),
    {
      name: "xengap.auth",
      partialize: (s) => ({ user: s.user, permissions: s.permissions }),
      onRehydrateStorage: () => (state) => {
        // mark hydrated next tick
        setTimeout(() => state && useAuth.setState({ hydrated: true }), 0);
      },
    },
  ),
);

export function hasRole(role: Role | undefined, allowed: Role[]): boolean {
  if (!role) return false;
  return allowed.includes(role);
}

export function hasAnyRole(user: User | null, allowed: Role[]): boolean {
  return !!user && hasRole(user.role, allowed);
}
