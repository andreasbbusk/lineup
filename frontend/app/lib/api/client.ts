import { useAppStore } from "../stores/app-store";
import { ErrorResponse } from "../types/api-types";

interface RequestOptions {
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

class ApiError extends Error {
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

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & RequestOptions = {}
  ): Promise<T> {
    const { headers = {}, requiresAuth = false, ...fetchOptions } = options;

    // Add auth header if required or if token exists
    const accessToken = useAppStore.getState().accessToken;
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Always send JSON
    headers["Content-Type"] = "application/json";

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // Handle non-OK responses
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Parse JSON response
      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or parsing error
      throw new ApiError(
        0,
        "NETWORK_ERROR",
        "Could not connect to server. Check your internet connection.",
        error
      );
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: ErrorResponse;

    try {
      errorData = await response.json();
    } catch {
      // Couldn't parse error response
      throw new ApiError(
        response.status,
        "UNKNOWN_ERROR",
        "An unexpected error occurred. Please try again later."
      );
    }

    // Map common errors to English messages
    let userMessage = errorData.error;

    if (response.status === 401) {
      // Unauthorized - clear auth and show message
      useAppStore.getState().clearAuth();
      userMessage = "Your session has expired. Please sign in again.";
    } else if (response.status === 409 && errorData.code === "CONFLICT") {
      userMessage = "This email or username is already in use.";
    } else if (response.status === 400) {
      userMessage = "Invalid data. Please check your entries.";
    } else if (response.status >= 500) {
      userMessage = "Server error. Please try again in a moment.";
    }

    throw new ApiError(
      response.status,
      errorData.code,
      userMessage,
      errorData.details
    );
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
      ...options,
    });
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      ...options,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export { ApiError };
