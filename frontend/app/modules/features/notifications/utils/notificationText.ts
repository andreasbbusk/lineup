import type { NotificationResponse } from "../types";

/**
 * Get the notification text based on notification type and entity type
 */
export function getNotificationText(notification: NotificationResponse): string {
  switch (notification.type) {
    case "connection_request":
      return "wants to connect";
    case "connection_accepted":
      return "accepted your connection request";
    case "collaboration_request":
      return "wants to collaborate";
    case "like":
      // Check entity type to determine if it's a post, story, etc.
      if (notification.entityType === "post") {
        return "liked your note";
      }
      return "liked your story";
    case "comment":
      return "commented on your post";
    case "tagged_in_post":
      return "tagged you in a post";
    case "review":
      return "left you a review";
    case "message":
      return "sent you a message";
    default:
      return "interacted with you";
  }
}

