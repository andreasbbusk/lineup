import { ProfileUpdateRequest, UserProfile } from "../../types/api-types";
import { apiClient } from "../client";

/**
 * Get user profile by username
 * Public endpoint - returns public data unless viewing own profile
 */
export async function getUserProfile(username: string): Promise<UserProfile> {
  return apiClient.get<UserProfile>(`/users/${username}`);
}

/**
 * Update user profile
 * Requires authentication
 */
export async function updateUserProfile(
  username: string,
  data: ProfileUpdateRequest
): Promise<UserProfile> {
  return apiClient.put<UserProfile>(`/users/${username}`, data);
}
