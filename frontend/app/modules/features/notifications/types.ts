import type { components } from "../../types/api";

// Re-export notification types from generated API types
export type NotificationResponse = components["schemas"]["NotificationResponse"];
export type NotificationType =
  | "like"
  | "comment"
  | "connection_request"
  | "connection_accepted"
  | "tagged_in_post"
  | "review"
  | "collaboration_request"
  | "message";

// Notification actor type
export type NotificationActor = NotificationResponse["actor"];

/**
 * Grouped notifications response type
 * Maps notification types to arrays of notifications
 */
export type GroupedNotificationsResponse = {
  like: NotificationResponse[];
  comment: NotificationResponse[];
  connection_request: NotificationResponse[];
  connection_accepted: NotificationResponse[];
  tagged_in_post: NotificationResponse[];
  review: NotificationResponse[];
  collaboration_request: NotificationResponse[];
  message: NotificationResponse[];
};

