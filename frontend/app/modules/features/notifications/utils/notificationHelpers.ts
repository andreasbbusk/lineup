import type { NotificationResponse } from "../types";

/**
 * Extended notification type with optional post data
 */
type ExtendedNotification = NotificationResponse & {
  postType?: string;
  post?: {
    type?: string;
    media?: Array<{ url?: string }>;
  };
  entitySubtype?: string;
};

/**
 * Extract post type from notification
 */
export function getPostType(
  notification: NotificationResponse
): string | undefined {
  const extended = notification as unknown as ExtendedNotification;
  return extended.postType || extended.post?.type || extended.entitySubtype;
}

/**
 * Get story image URL from notification
 */
export function getStoryImageUrl(
  notification: NotificationResponse
): string | undefined {
  const extended = notification as unknown as ExtendedNotification;
  return extended.post?.media?.[0]?.url;
}

/**
 * Check if notification is for a story
 */
export function isStoryNotification(
  notification: NotificationResponse
): boolean {
  const postType = getPostType(notification);
  return (
    notification.entityType === "story" ||
    postType?.toLowerCase() === "story"
  );
}

/**
 * Check if notification should show action button
 */
export function shouldShowActionButton(
  notification: NotificationResponse
): boolean {
  return (
    notification.type === "connection_request" ||
    notification.type === "collaboration_request"
  );
}

/**
 * Check if notification should navigate to a post
 */
export function shouldNavigateToPost(
  notification: NotificationResponse
): boolean {
  return (
    notification.type === "like" ||
    notification.type === "comment" ||
    notification.type === "tagged_in_post" ||
    notification.type === "collaboration_request"
  );
}

