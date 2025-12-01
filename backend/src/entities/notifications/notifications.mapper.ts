import { NotificationRow } from "../../utils/supabase-helpers.js";
import { NotificationResponse } from "../../types/api.types.js";

/**
 * Partial profile structure returned by Supabase select queries
 */
type PartialProfile = {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

/**
 * Supabase notification response with nested actor relation
 */
type SupabaseNotificationWithRelations = NotificationRow & {
  actor?: PartialProfile;
};

/**
 * Maps a partial profile to a simple user object
 */
function mapPartialProfileToUser(profile: PartialProfile) {
  return {
    id: profile.id,
    username: profile.username,
    firstName: profile.first_name ?? null,
    lastName: profile.last_name ?? null,
    avatarUrl: profile.avatar_url ?? null,
  };
}

/**
 * Maps Supabase notification response with nested relations to API format
 * Converts snake_case to camelCase and includes actor information
 */
export function mapNotificationToResponse(
  notification: SupabaseNotificationWithRelations
): NotificationResponse {
  return {
    id: notification.id,
    recipientId: notification.recipient_id,
    actorId: notification.actor_id ?? null,
    type: notification.type,
    entityType: notification.entity_type ?? null,
    entityId: notification.entity_id ?? null,
    title: notification.title,
    body: notification.body ?? null,
    actionUrl: notification.action_url ?? null,
    isRead: notification.is_read,
    isArchived: null, // Field not in current database schema - maybe implement later if needed?
    createdAt: notification.created_at,
    readAt: notification.read_at ?? null,
    sentViaWebsocket: notification.sent_via_websocket,
    actor: notification.actor
      ? mapPartialProfileToUser(notification.actor)
      : undefined,
  };
}

/**
 * Maps array of Supabase notification responses to API format
 */
export function mapNotificationsToResponse(
  notifications: SupabaseNotificationWithRelations[]
): NotificationResponse[] {
  return notifications.map(mapNotificationToResponse);
}
