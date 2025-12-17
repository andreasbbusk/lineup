import { apiClient, handleApiError } from "../../api/apiClient";
import type { components } from "../../types/api";

type NotificationResponse = components["schemas"]["NotificationResponse"];
type GroupedNotificationsResponse =
  components["schemas"]["GroupedNotificationsResponse"];
/**
 * Get notifications for the authenticated user
 * Returns notifications grouped by type for easy filtering
 *
 * @param grouped - If true, returns notifications grouped by type
 * @param unreadOnly - If true, only return unread notifications
 * @param limit - Maximum number of notifications to return (1-100, default: 20)
 */
export async function getNotifications(options?: {
  grouped?: boolean;
  unreadOnly?: boolean;
  limit?: number;
}): Promise<
  | { notifications: NotificationResponse[]; nextCursor?: string }
  | { notifications: GroupedNotificationsResponse; nextCursor?: string }
> {
  const { data, error, response } = await apiClient.GET("/notifications", {
    params: {
      query: {
        grouped: options?.grouped,
        unreadOnly: options?.unreadOnly,
        limit: options?.limit || 20,
      },
    },
  });

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data as
    | { notifications: NotificationResponse[]; nextCursor?: string }
    | { notifications: GroupedNotificationsResponse; nextCursor?: string };
}

/**
 * Get unread notification count
 * Returns the count of unread notifications using the optimized count endpoint
 */
export async function getUnreadCount(): Promise<number> {
  const { data, error, response } = await apiClient.GET("/notifications/count");

  if (error) {
    handleApiError(error, response);
  }

  return data?.count ?? 0;
}

/**
 * Mark a notification as read or unread
 */
export async function updateNotification(
  notificationId: string,
  isRead: boolean
): Promise<NotificationResponse> {
  const { data, error, response } = await apiClient.PATCH(
    "/notifications/{notificationId}",
    {
      params: {
        path: { notificationId },
      },
      body: {
        isRead,
      },
    }
  );

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<void> {
  const { error, response } = await apiClient.DELETE(
    "/notifications/{notificationId}",
    {
      params: {
        path: { notificationId },
      },
    }
  );

  // Verify we got a response first
  if (!response) {
    throw new Error("Failed to delete notification: No response from server");
  }

  // Check for errors (but openapi-fetch may not set error for 204 responses)
  if (error) {
    handleApiError(error, response);
  }

  // Verify successful deletion (204 No Content is expected for DELETE)
  // openapi-fetch may not set error for 204 responses, so check status explicitly
  if (response.status !== 204 && response.status !== 200) {
    throw new Error(
      `Failed to delete notification: Unexpected status ${response.status}`
    );
  }
}
