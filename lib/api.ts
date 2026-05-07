// API layer — swap MOCK with real backend by changing BASE_URL and removing mock fallbacks
import type { Car, Offer, Buyer, BlogPost } from "./types";
import { MOCK_CARS, MOCK_OFFERS, MOCK_BUYERS, MOCK_POSTS, SELLER_MIN_PRICES, LISTING_STATUS } from "./mock-data";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const USE_MOCK = !BASE_URL;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (USE_MOCK) throw new Error("MOCK_FALLBACK");
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

// === Cars ===
export const carsApi = {
  list: async (params?: { brand?: string; severity?: string; minPrice?: number; maxPrice?: number }): Promise<Car[]> => {
    try {
      const q = new URLSearchParams(params as any).toString();
      return await request<Car[]>(`/cars${q ? `?${q}` : ""}`);
    } catch {
      let cars = [...MOCK_CARS];
      if (params?.brand) cars = cars.filter((c) => c.brand === params.brand);
      if (params?.severity) cars = cars.filter((c) => c.severity === params.severity);
      if (params?.minPrice) cars = cars.filter((c) => c.price >= params.minPrice!);
      if (params?.maxPrice) cars = cars.filter((c) => c.price <= params.maxPrice!);
      return cars;
    }
  },
  get: async (id: string): Promise<Car | null> => {
    try { return await request<Car>(`/cars/${id}`); }
    catch { return MOCK_CARS.find((c) => c.id === id) || null; }
  },
  create: async (data: Partial<Car>): Promise<Car> => {
    try { return await request<Car>("/cars", { method: "POST", body: JSON.stringify(data) }); }
    catch { return { ...(data as Car), id: `XN-${Date.now()}` }; }
  },
  getStatus: async (id: string): Promise<string> => {
    try { return await request<{ status: string }>(`/cars/${id}/status`).then((r) => r.status); }
    catch { return LISTING_STATUS[id] || "active"; }
  },
};

// === Offers ===
export const offersApi = {
  listByCar: async (carId: string): Promise<Offer[]> => {
    try { return await request<Offer[]>(`/cars/${carId}/offers`); }
    catch { return MOCK_OFFERS[carId] || []; }
  },
  listByBuyer: async (buyerId: string): Promise<Offer[]> => {
    try { return await request<Offer[]>(`/buyers/${buyerId}/offers`); }
    catch { return Object.values(MOCK_OFFERS).flat().filter((o) => o.buyerId === buyerId); }
  },
  create: async (data: { carId: string; amount: number; message?: string }): Promise<Offer> => {
    try { return await request<Offer>("/offers", { method: "POST", body: JSON.stringify(data) }); }
    catch {
      return { id: `OF-${Date.now()}`, buyerId: "B-021", amount: data.amount, message: data.message || "", date: new Date().toISOString().slice(0, 10), status: "pending" };
    }
  },
  accept: async (offerId: string): Promise<void> => { try { await request(`/offers/${offerId}/accept`, { method: "POST" }); } catch {} },
  reject: async (offerId: string): Promise<void> => { try { await request(`/offers/${offerId}/reject`, { method: "POST" }); } catch {} },
};

// === Buyers / Sellers / Admin ===
export const buyersApi = {
  list: async (): Promise<Buyer[]> => { try { return await request<Buyer[]>("/buyers"); } catch { return MOCK_BUYERS; } },
  get: async (id: string): Promise<Buyer | null> => { try { return await request<Buyer>(`/buyers/${id}`); } catch { return MOCK_BUYERS.find((b) => b.id === id) || null; } },
};

export const adminApi = {
  getSellerMinPrice: async (carId: string): Promise<number | null> => {
    try { return await request<{ minPrice: number }>(`/admin/cars/${carId}/seller-min`).then((r) => r.minPrice); }
    catch { return SELLER_MIN_PRICES[carId] || null; }
  },
  getSpread: async (carId: string): Promise<{ topOffer: number; sellerMin: number; spread: number } | null> => {
    try { return await request(`/admin/cars/${carId}/spread`); }
    catch {
      const offers = MOCK_OFFERS[carId] || [];
      const topOffer = Math.max(0, ...offers.map((o) => o.amount));
      const sellerMin = SELLER_MIN_PRICES[carId] || 0;
      return { topOffer, sellerMin, spread: topOffer - sellerMin };
    }
  },
};

// === Blog ===
export const blogApi = {
  list: async (category?: string): Promise<BlogPost[]> => {
    try {
      const q = category && category !== "Tất cả" ? `?category=${encodeURIComponent(category)}` : "";
      return await request<BlogPost[]>(`/posts${q}`);
    } catch {
      return category && category !== "Tất cả" ? MOCK_POSTS.filter((p) => p.category === category) : MOCK_POSTS;
    }
  },
  get: async (slug: string): Promise<BlogPost | null> => {
    try { return await request<BlogPost>(`/posts/${slug}`); }
    catch { return MOCK_POSTS.find((p) => p.slug === slug) || null; }
  },
};

// === Auth (placeholder) ===
export const authApi = {
  login: async (phone: string, otp: string): Promise<{ token: string; user: { id: string; name: string } }> => {
    try { return await request("/auth/login", { method: "POST", body: JSON.stringify({ phone, otp }) }); }
    catch { return { token: "mock-token", user: { id: "B-021", name: "Nguyễn V. An" } }; }
  },
  register: async (data: { phone: string; name: string }): Promise<{ token: string }> => {
    try { return await request("/auth/register", { method: "POST", body: JSON.stringify(data) }); }
    catch { return { token: "mock-token" }; }
  },
};
