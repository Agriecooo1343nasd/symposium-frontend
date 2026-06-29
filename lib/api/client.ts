import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiErrorBody, ApiResponse } from "./types";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

const ACCESS_KEY = "nas_access_token";
const REFRESH_KEY = "nas_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken?: string }>>(
      `${baseURL}/auth/refresh`,
      { refreshToken: refresh },
      { headers: { "Content-Type": "application/json" } },
    );
    const payload = data.data;
    const access = payload?.accessToken ?? (payload as unknown as { tokens?: { accessToken: string } })?.tokens?.accessToken;
    if (!access) return null;
    const nextRefresh =
      payload?.refreshToken ?? (payload as unknown as { tokens?: { refreshToken: string } })?.tokens?.refreshToken;
    setTokens(access, nextRefresh ?? refresh);
    return access;
  } catch {
    clearTokens();
    return null;
  }
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config;
    if (!original || original._retry || error.response?.status !== 401) {
      return Promise.reject(error);
    }
    original._retry = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
    const token = await refreshPromise;
    if (!token) return Promise.reject(error);
    original.headers.Authorization = `Bearer ${token}`;
    return apiClient(original);
  },
);

export function unwrapApi<T>(res: { data: ApiResponse<T> }): T {
  return res.data.data;
}

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Request failed";
}

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}
