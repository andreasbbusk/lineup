import type { NotificationResponse } from "../types";
import type { GroupedNotificationsResponse } from "../api";

/**
 * Groups an array of notifications by their type
 * Returns a GroupedNotificationsResponse with all notification types as keys
 */
export function groupNotificationsByType(
  notifications: NotificationResponse[]
): GroupedNotificationsResponse {
  const grouped: GroupedNotificationsResponse = {
    like: [],
    comment: [],
    connection_request: [],
    connection_accepted: [],
    tagged_in_post: [],
    review: [],
    collaboration_request: [],
    message: [],
  };

  notifications.forEach((notification) => {
    const type = notification.type as keyof GroupedNotificationsResponse;
    if (type in grouped) {
      grouped[type].push(notification);
    }
  });

  return grouped;
}

