import { createAuthenticatedClient } from "../../config/supabase.config.js";
import {
  NotificationUpdate,
  NotificationType,
} from "../../utils/supabase-helpers.js";
import { createHttpError } from "../../utils/error-handler.js";
import {
  mapNotificationsToResponse,
  mapNotificationToResponse,
} from "./notifications.mapper.js";
import { NotificationResponse } from "../../types/api.types.js";
import { UpdateNotificationDto } from "./notifications.dto.js";

export class NotificationsService {
  /**
   * Get notifications for the authenticated user
   * Returns notifications with actor information
   * Supports filtering by type and unread status
   */
  async getUserNotifications(
    userId: string,
    token: string,
    type?: string,
    unreadOnly?: boolean,
    cursor?: string,
    limit: number = 50
  ): Promise<{ notifications: NotificationResponse[]; nextCursor?: string }> {
    const authedSupabase = createAuthenticatedClient(token);

    // Build query
    let query = authedSupabase
      .from("notifications")
      .select(
        `
        *,
        actor:profiles!notifications_actor_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit + 1); // Fetch one extra to determine if there's a next page

    // Apply filters
    if (type) {
      // Validate and cast type to NotificationType enum
      query = query.eq("type", type as NotificationType);
    }

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    // Apply cursor
    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: notifications, error } = await query;

    if (error) {
      throw createHttpError({
        message: `Failed to fetch notifications: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    if (!notifications || notifications.length === 0) {
      return { notifications: [] };
    }

    // Check if there's a next page
    const hasNextPage = notifications.length > limit;
    const notificationsToReturn = hasNextPage
      ? notifications.slice(0, limit)
      : notifications;
    const nextCursor = hasNextPage
      ? notificationsToReturn[notificationsToReturn.length - 1].created_at ??
        undefined
      : undefined;

    return {
      notifications: mapNotificationsToResponse(notificationsToReturn as any),
      nextCursor,
    };
  }

  /**
   * Get a notification by ID
   * Only the recipient can access their own notifications
   */
  async getNotificationById(
    notificationId: string,
    userId: string,
    token: string
  ): Promise<NotificationResponse> {
    const authedSupabase = createAuthenticatedClient(token);

    const { data: notification, error } = await authedSupabase
      .from("notifications")
      .select(
        `
        *,
        actor:profiles!notifications_actor_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("id", notificationId)
      .single();

    if (error || !notification) {
      throw createHttpError({
        message: "Notification not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Verify user is the recipient
    if (notification.recipient_id !== userId) {
      throw createHttpError({
        message: "Access denied",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    return mapNotificationToResponse(notification as any);
  }

  /**
   * Update a notification (mark as read/unread)
   * Only the recipient can update their own notifications
   */
  async updateNotification(
    notificationId: string,
    userId: string,
    data: UpdateNotificationDto,
    token: string
  ): Promise<NotificationResponse> {
    const authedSupabase = createAuthenticatedClient(token);

    // Verify notification exists and user is the recipient
    const { data: notification, error: fetchError } = await authedSupabase
      .from("notifications")
      .select("recipient_id")
      .eq("id", notificationId)
      .single();

    if (fetchError || !notification) {
      throw createHttpError({
        message: "Notification not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    if (notification.recipient_id !== userId) {
      throw createHttpError({
        message: "You can only update your own notifications",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Update the notification
    const updateData: NotificationUpdate = {
      is_read: data.isRead,
      read_at: data.isRead ? new Date().toISOString() : null,
    };

    const { error: updateError } = await authedSupabase
      .from("notifications")
      .update(updateData)
      .eq("id", notificationId);

    if (updateError) {
      throw createHttpError({
        message: `Failed to update notification: ${updateError.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    // Fetch updated notification
    return this.getNotificationById(notificationId, userId, token);
  }

  /**
   * Delete a notification
   * Only the recipient can delete their own notifications
   */
  async deleteNotification(
    notificationId: string,
    userId: string,
    token: string
  ): Promise<void> {
    const authedSupabase = createAuthenticatedClient(token);

    // Verify notification exists and user is the recipient
    const { data: notification, error: fetchError } = await authedSupabase
      .from("notifications")
      .select("recipient_id")
      .eq("id", notificationId)
      .single();

    if (fetchError || !notification) {
      throw createHttpError({
        message: "Notification not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    if (notification.recipient_id !== userId) {
      throw createHttpError({
        message: "You can only delete your own notifications",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Delete the notification
    const { error } = await authedSupabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      throw createHttpError({
        message: `Failed to delete notification: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }
  }
}
