import type { NotificationResponse } from "../types";

/**
 * Type guard to check if a notification has an entityId
 */
export function hasEntityId(
  notification: NotificationResponse
): notification is NotificationResponse & { entityId: string } {
  return typeof notification.entityId === "string" && notification.entityId.length > 0;
}

/**
 * Type guard to check if a notification has an id
 */
export function hasNotificationId(
  notification: NotificationResponse
): notification is NotificationResponse & { id: string } {
  return typeof notification.id === "string" && notification.id.length > 0;
}

/**
 * Type guard to check if a notification has an actorId
 */
export function hasActorId(
  notification: NotificationResponse
): notification is NotificationResponse & { actorId: string } {
  return typeof notification.actorId === "string" && notification.actorId.length > 0;
}

