"use client";

import type { ApiResponse } from "@/types/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4123";

const TOKEN_KEY = "xengap.accessToken";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
  // notify listeners
  window.dispatchEvent(new Event("xengap:auth-change"));
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message?: string, details?: unknown) {
    super(message || code);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface ReqInit extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, unknown>;
  raw?: boolean;
  idempotencyKey?: string;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (r) => {
        if (!r.ok) return null;
        const json = (await r.json()) as ApiResponse<{ accessToken: string }>;
        if (!json.ok) return null;
        setAccessToken(json.data.accessToken);
        return json.data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        // small delay to dedupe concurrent calls
        setTimeout(() => (refreshPromise = null), 50);
      });
  }
  return refreshPromise;
}

export async function apiFetch<T>(path: string, init: ReqInit = {}): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  if (init.query) {
    for (const [k, v] of Object.entries(init.query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) || {}),
  };
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;

  const doFetch = (auth?: string) =>
    fetch(url.toString(), {
      method: init.method || "GET",
      credentials: "include",
      headers: auth ? { ...headers, Authorization: `Bearer ${auth}` } : headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });

  let res = await doFetch();

  // try refresh on 401 (once)
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) res = await doFetch(newToken);
  }

  if (res.status === 204) return undefined as T;

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    /* non-json */
  }

  if (!res.ok || !json || json.ok === false) {
    const err = (json && !json.ok && json.error) || { code: "UNKNOWN", message: res.statusText };
    throw new ApiError(res.status, err.code, err.message, "details" in err ? err.details : undefined);
  }

  return json.data;
}

export const api = {
  get: <T,>(path: string, query?: Record<string, unknown>) => apiFetch<T>(path, { method: "GET", query }),
  post: <T,>(path: string, body?: unknown, opts?: { idempotencyKey?: string }) =>
    apiFetch<T>(path, { method: "POST", body, idempotencyKey: opts?.idempotencyKey }),
  patch: <T,>(path: string, body?: unknown) => apiFetch<T>(path, { method: "PATCH", body }),
  put: <T,>(path: string, body?: unknown) => apiFetch<T>(path, { method: "PUT", body }),
  del: <T,>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};

export function newIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return ([1e7] as unknown as string).toString().replace(/[018]/g, (c) =>
    (
      Number(c) ^
      (Math.random() * 16 >> (Number(c) / 4))
    ).toString(16),
  );
}
