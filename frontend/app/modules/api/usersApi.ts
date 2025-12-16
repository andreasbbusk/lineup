import { apiClient, handleApiError } from "./apiClient";
import { components } from "@/app/modules/types/api";

type BlockedUserResponse = components["schemas"]["BlockedUserResponse"];
type BlockStatusResponse = components["schemas"]["BlockStatusResponse"];

/**
 * Block a user
 * Adds the user to your blocked list and removes direct conversations
 */
export async function blockUser(userId: string): Promise<void> {
  const { error, response } = await apiClient.POST("/users/{userId}/block", {
    params: { path: { userId } },
  });

  if (error) {
    handleApiError(error, response);
  }
}

/**
 * Unblock a user
 * Removes the user from your blocked list
 */
export async function unblockUser(userId: string): Promise<void> {
  const { error, response } = await apiClient.DELETE("/users/{userId}/block", {
    params: { path: { userId } },
  });

  if (error) {
    handleApiError(error, response);
  }
}

/**
 * Check block status between current user and target user
 */
export async function getBlockStatus(
  userId: string
): Promise<BlockStatusResponse> {
  const { data, error, response } = await apiClient.GET(
    "/users/{userId}/block-status",
    {
      params: { path: { userId } },
    }
  );

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data as BlockStatusResponse;
}

/**
 * Get list of blocked users
 */
export async function getBlockedUsers(): Promise<BlockedUserResponse[]> {
  const { data, error, response } = await apiClient.GET("/users/blocked");

  if (error) {
    handleApiError(error, response);
  }

  // Backend returns { data: BlockedUser[] }
  if (!data || !("data" in data)) {
    return [];
  }

  return (data.data as unknown as BlockedUserResponse[]) || [];
}
