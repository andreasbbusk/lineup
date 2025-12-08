import { apiClient, handleApiError } from "../../api/api-client";
import type { UserProfile, ProfileUpdateRequest } from "./types";

// Re-export types for backward compatibility
export type { UserProfile, ProfileUpdateRequest };

/**
 * Get user profile by username
 * Public endpoint - returns public data unless viewing own profile
 */
export async function getUserProfile(username: string): Promise<UserProfile> {
  const { data, error, response } = await apiClient.GET("/users/{username}", {
    params: {
      path: { username },
    },
  });

  if (error) {
    handleApiError(error, response);
  }

  return data;
}

/**
 * Update user profile
 * Requires authentication
 */
export async function updateUserProfile(
  username: string,
  updates: ProfileUpdateRequest
): Promise<UserProfile> {
  const { data, error, response } = await apiClient.PUT("/users/{username}", {
    params: {
      path: { username },
    },
    body: updates,
  });

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}
