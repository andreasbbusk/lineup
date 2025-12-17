import type { NotificationResponse } from "../types";

/**
 * Sort notifications by createdAt in descending order (newest first)
 * Notifications with null createdAt are sorted to the end
 */
export function sortNotificationsByDateDesc(
  notifications: NotificationResponse[]
): NotificationResponse[] {
  return [...notifications].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
}
