"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "./types";
import type { Listing } from "@/types/api";

interface AppState {
  role: Role;
  user: { name: string; initials: string } | null;
  offerCar: Listing | null;
  setRole: (r: Role) => void;
  setUser: (u: AppState["user"]) => void;
  openOfferModal: (c: Listing) => void;
  closeOfferModal: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: "buyer",
      user: { name: "Nguyễn V. An", initials: "NA" },
      offerCar: null,
      setRole: (role) => {
        const user =
          role === "seller"
            ? { name: "Phạm Văn Bình", initials: "PB" }
            : role === "admin"
            ? { name: "Admin xengap", initials: "AD" }
            : { name: "Nguyễn V. An", initials: "NA" };
        set({ role, user });
      },
      setUser: (user) => set({ user }),
      openOfferModal: (offerCar) => set({ offerCar }),
      closeOfferModal: () => set({ offerCar: null }),
    }),
    { name: "xengap-store" }
  )
);
