/**
 * Centralized query keys for notifications
 * Ensures consistency across all notification-related queries
 */
export const NOTIFICATION_QUERY_KEYS = {
  /**
   * Base key for all notification queries
   */
  all: ["notifications"] as const,

  /**
   * Key for grouped notifications query
   */
  grouped: (unreadOnly?: boolean) =>
    ["notifications", "grouped", unreadOnly] as const,

  /**
   * Key for unread count query
   */
  unreadCount: ["notifications", "unread-count"] as const,
} as const;

