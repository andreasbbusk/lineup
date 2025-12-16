import { apiClient, handleApiError } from "../../api/apiClient";
import type { components } from "../../types/api";
import { deduplicateConnectionRequests } from "../utils/connectionRequests";

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
 * Returns the count of unread notifications
 * Note: This fetches all unread notifications to count them.
 * For better performance, consider using a dedicated count endpoint.
 */
export async function getUnreadCount(): Promise<number> {
  const { data, error, response } = await apiClient.GET("/notifications", {
    params: {
      query: {
        grouped: true,
        unreadOnly: true,
        limit: 100,
      },
    },
  });

  if (error) {
    handleApiError(error, response);
  }

  // If no data or notifications, return 0
  if (!data || !data.notifications) {
    return 0;
  }

  // Count unread notifications
  if (Array.isArray(data.notifications)) {
    return data.notifications.length;
  }

  // If grouped, count all unread notifications across all types
  // Deduplicate connection requests to match how they're displayed
  const grouped = data.notifications as GroupedNotificationsResponse;
  const connectionRequests = [
    ...grouped.connection_request,
    ...grouped.connection_accepted,
  ];
  const uniqueConnectionRequests =
    deduplicateConnectionRequests(connectionRequests);

  // Count all notification types, using deduplicated connection requests
  return (
    uniqueConnectionRequests.length +
    grouped.like.length +
    grouped.comment.length +
    grouped.tagged_in_post.length +
    grouped.review.length +
    grouped.collaboration_request.length +
    grouped.message.length
  );
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
