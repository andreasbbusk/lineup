import createClient from "openapi-fetch";
import type { paths } from "@/app/lib/types/api";
import { useAppStore } from "@/app/lib/stores/app-store";
import { ErrorResponse } from "@/app/lib/types/api-types";

// Create the typed client
export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Middleware to add auth token
apiClient.use({
  async onRequest({ request }) {
    const token = useAppStore.getState().accessToken;
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
});

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Helper to handle error responses consistently
export function handleApiError(
  error: ErrorResponse,
  response?: Response
): never {
  if (response?.status === 401) {
    useAppStore.getState().clearAuth();
    throw new ApiError(
      401,
      "UNAUTHORIZED",
      "Your session has expired. Please sign in again."
    );
  }

  const message = error.error || "An unexpected error occurred";
  const code = error.code || "UNKNOWN_ERROR";
  const status = response?.status || 0;

  // Log full error details for debugging
  console.error("API Error Details:", {
    status,
    code,
    message,
    error,
    details: error.details,
  });

  throw new ApiError(status, code, message, error.details);
}
