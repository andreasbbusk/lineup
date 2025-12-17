import { Request as ExpressRequest } from "express";
import {
  Controller,
  Get,
  Patch,
  Delete,
  Path,
  Body,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { extractUserId } from "../../utils/auth-helpers.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { NotificationsService } from "./notifications.service.js";
import { UpdateNotificationDto } from "./notifications.dto.js";
import {
  NotificationResponse,
  GroupedNotificationsResponse,
} from "../../types/api.types.js";

@Route("notifications")
@Tags("Notifications")
export class NotificationsController extends Controller {
  private notificationsService = new NotificationsService();

  /**
   * Get notifications for the authenticated user
   *
   * Returns notifications for the authenticated user with optional filters.
   * Supports filtering by type and unread status, with cursor-based pagination.
   * When grouped=true, returns notifications organized by type for easy filtering.
   *
   * @summary Get user notifications
   * @param type Filter by notification type (ignored if grouped=true)
   * @param unreadOnly If true, only return unread notifications
   * @param cursor Cursor for pagination (ISO timestamp)
   * @param limit Maximum number of notifications to return (1-100, default: 50)
   * @param grouped If true, returns notifications grouped by type as an object
   * @returns Notifications with pagination cursor (flat array or grouped by type)
   * @throws 401 if not authenticated
   */
  @Security("bearerAuth")
  @Get("/")
  public async getNotifications(
    @Query() type?: string,
    @Query() unreadOnly?: boolean,
    @Query() cursor?: string,
    @Query() limit?: number,
    @Query() grouped?: boolean,
    @Request() request?: ExpressRequest
  ): Promise<
    | {
        notifications: NotificationResponse[];
        nextCursor?: string;
      }
    | {
        notifications: GroupedNotificationsResponse;
        nextCursor?: string;
      }
  > {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request!);
      const token =
        request!.headers.authorization?.replace("Bearer ", "") || "";

      return this.notificationsService.getUserNotifications(
        userId,
        token,
        type,
        unreadOnly,
        cursor,
        limit || 50,
        grouped || false
      );
    });
  }

  /**
   * Get a notification by ID
   *
   * Returns a specific notification with actor information.
   * Only the recipient can access their own notifications.
   *
   * @summary Get notification by ID
   * @param notificationId The UUID of the notification to retrieve
   * @returns The notification with actor information
   * @throws 401 if not authenticated
   * @throws 403 if user is not the recipient
   * @throws 404 if notification not found
   */
  @Security("bearerAuth")
  @Get("{notificationId}")
  public async getNotification(
    @Path() notificationId: string,
    @Request() request?: ExpressRequest
  ): Promise<NotificationResponse> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request!);
      const token =
        request!.headers.authorization?.replace("Bearer ", "") || "";

      return this.notificationsService.getNotificationById(
        notificationId,
        userId,
        token
      );
    });
  }

  /**
   * Update a notification
   *
   * Marks a notification as read or unread.
   * Only the recipient can update their own notifications.
   *
   * @summary Mark notification as read/unread
   * @param notificationId The UUID of the notification to update
   * @param body Update data including isRead status
   * @returns The updated notification
   * @throws 400 if validation fails
   * @throws 401 if not authenticated
   * @throws 403 if user is not the recipient
   * @throws 404 if notification not found
   */
  @Security("bearerAuth")
  @Patch("{notificationId}")
  public async updateNotification(
    @Path() notificationId: string,
    @Body() body: UpdateNotificationDto,
    @Request() request?: ExpressRequest
  ): Promise<NotificationResponse> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request!);
      const token =
        request!.headers.authorization?.replace("Bearer ", "") || "";

      return this.notificationsService.updateNotification(
        notificationId,
        userId,
        body,
        token
      );
    });
  }

  /**
   * Get unread notification count
   *
   * Returns the total count of unread notifications for the authenticated user.
   * This is optimized for badge display and avoids fetching all notification data.
   *
   * @summary Get unread notification count
   * @returns Object containing the count of unread notifications
   * @throws 401 if not authenticated
   */
  @Security("bearerAuth")
  @Get("/count")
  public async getUnreadCount(
    @Request() request?: ExpressRequest
  ): Promise<{ count: number }> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request!);
      const token =
        request!.headers.authorization?.replace("Bearer ", "") || "";

      const count = await this.notificationsService.getUnreadCount(
        userId,
        token
      );
      return { count };
    });
  }

  /**
   * Delete a notification
   *
   * Permanently deletes a notification.
   * Only the recipient can delete their own notifications.
   *
   * @summary Delete a notification
   * @param notificationId The UUID of the notification to delete
   * @returns No content on success
   * @throws 401 if not authenticated
   * @throws 403 if user is not the recipient
   * @throws 404 if notification not found
   */
  @Security("bearerAuth")
  @Delete("{notificationId}")
  public async deleteNotification(
    @Path() notificationId: string,
    @Request() request?: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request!);
        const token =
          request!.headers.authorization?.replace("Bearer ", "") || "";

        return this.notificationsService.deleteNotification(
          notificationId,
          userId,
          token
        );
      },
      204
    );
  }
}
