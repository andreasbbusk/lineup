import type { NotificationResponse } from "../types";
import { getPostType } from "./notificationHelpers";

/**
 * Get the notification text based on notification type and entity type
 */
export function getNotificationText(
  notification: NotificationResponse
): string {
  // Infer post subtype (e.g., "request") if present
  const postType = getPostType(notification);

  const isRequestPost =
    (notification.entityType === "post" &&
      typeof postType === "string" &&
      postType.toLowerCase() === "request") ||
    notification.type === "collaboration_request";

  // If the post is a collaboration request, always use the request copy
  if (isRequestPost) {
    return "wants to collaborate with you!";
  }

  switch (notification.type) {
    case "connection_request":
      return "wants to connect";
    case "connection_accepted":
      return "accepted your connection request";
    case "like":
      // Check entity type to determine if it's a post, story, etc.
      if (notification.entityType === "post") {
        return "liked your note";
      }
      return "liked your story";
    case "comment":
      return "commented on your note";
    case "tagged_in_post":
      return "tagged you in a note";
    case "review":
      return "left you a review";
    case "message":
      return "sent you a message";
    default:
      return "interacted with you";
  }
}
