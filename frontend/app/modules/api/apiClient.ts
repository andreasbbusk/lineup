import createClient from "openapi-fetch";
import type { paths } from "@/app/modules/types/api";
import { supabase } from "@/app/modules/supabase/client";
import { useAppStore } from "@/app/modules/stores/Store";
import { ErrorResponse } from "@/app/modules/types/apiTypes";

// Create the typed client
export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Middleware to add auth token from Supabase session
apiClient.use({
  async onRequest({ request }) {
    // Get token directly from Supabase (the source of truth)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;

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
  error: ErrorResponse | unknown,
  response?: Response
): never {
  if (response?.status === 401) {
    // Session expired - trigger logout and reinit
    const store = useAppStore.getState();
    store.logout(); // This calls supabase.auth.signOut() + clears state

    throw new ApiError(
      401,
      "UNAUTHORIZED",
      "Your session has expired. Please sign in again."
    );
  }

  // Handle different error formats from openapi-fetch
  let message = "An unexpected error occurred";
  let code = "UNKNOWN_ERROR";
  let details: unknown = undefined;

  if (error && typeof error === "object") {
    // Check if it's an ErrorResponse format
    if ("error" in error) {
      const errorResponse = error as ErrorResponse;
      message = errorResponse.error || message;
      code = errorResponse.code || code;
      details = errorResponse.details;
    } else if ("message" in error) {
      // Handle standard Error objects
      message = String(error.message);
    } else if (
      "data" in error &&
      error.data &&
      typeof error.data === "object"
    ) {
      // Handle openapi-fetch error format with nested data
      const errorData = error.data as Record<string, unknown>;
      message = String(errorData.error || errorData.message || message);
      code = String(errorData.code || code);
      details = errorData.details;
    } else {
      // Try to extract message from any object
      const errorObj = error as Record<string, unknown>;
      message = String(errorObj.message || errorObj.error || message);
      code = String(errorObj.code || code);
      details = errorObj.details || errorObj;
    }
  } else if (typeof error === "string") {
    message = error;
  }

  const status = response?.status || 0;

  // Log full error details for debugging
  console.error("API Error Details:", {
    status,
    code,
    message,
    error,
    details,
    errorType: typeof error,
    errorKeys:
      error && typeof error === "object" ? Object.keys(error) : undefined,
    response: response
      ? {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        }
      : undefined,
  });

  throw new ApiError(status, code, message, details);
}
