import type { ApiErrorBody, ApiErrorCode } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";

// Client gọi REST API sang Spring Boot (architecture.md §3, §5).
// Tự động gắn JWT Bearer token từ authStore và ngôn ngữ hiện tại (Accept-Language).
// Lỗi được chuẩn hóa thành ApiError với errorCode để UI ánh xạ sang t.apiErrors.*.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export class ApiError extends Error {
  readonly errorCode: ApiErrorCode;
  readonly status?: number;

  constructor(errorCode: ApiErrorCode, status?: number, message?: string) {
    super(message || errorCode);
    this.name = "ApiError";
    this.errorCode = errorCode;
    this.status = status;
  }
}

const errorCodeFromStatus = (status: number): ApiErrorCode => {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  return "SERVER_ERROR";
};

// Chuyển mọi lỗi (ApiError hoặc lỗi bất kỳ) thành mã lỗi chuẩn để hiển thị qua i18n.
export const toApiErrorCode = (error: unknown): ApiErrorCode =>
  error instanceof ApiError ? error.errorCode : "SERVER_ERROR";

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token } = useAuthStore.getState();
  const { language } = useLanguageStore.getState();

  const headers = new Headers(init.headers);
  headers.set("Accept-Language", language);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("NETWORK_ERROR");
  }

  if (!response.ok) {
    let body: Partial<ApiErrorBody> | null = null;
    try {
      body = await response.json();
    } catch {}
    throw new ApiError(errorCodeFromStatus(response.status), response.status, body?.message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
