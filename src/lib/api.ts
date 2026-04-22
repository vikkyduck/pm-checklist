/**
 * API-клиент для бэкенда чек-листа PM.
 * Базовый URL берётся из VITE_API_URL.
 * Если переменная не задана — режим "демо без сервера" (прогресс только в localStorage).
 */

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";

const TOKEN_KEY = "pm_checklist_jwt";
const USER_KEY = "pm_checklist_user";

export const isApiConfigured = () => Boolean(API_URL);

export type AuthUser = { email: string; name: string };

export const auth = {
  getToken: (): string | null =>
    typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY),
  getUser: (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  setSession: (token: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new Error("VITE_API_URL не задан");
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = auth.getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (res.status === 401) {
    auth.clear();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  requestMagicLink: (email: string, name: string) =>
    request<{ ok: true }>("/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    }),
  verifyToken: (token: string) =>
    request<{ token: string; user: AuthUser }>(
      `/auth/verify?token=${encodeURIComponent(token)}`,
    ),
  getProgress: () =>
    request<{ progress: Record<string, boolean> }>("/checklist"),
  saveProgress: (progress: Record<string, boolean>) =>
    request<{ ok: true }>("/checklist", {
      method: "PUT",
      body: JSON.stringify({ progress }),
    }),
};
