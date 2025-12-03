import { IsBoolean } from "class-validator";

/**
 * DTO for updating a notification
 *
 * Used when marking a notification as read or unread.
 *
 * @example
 * {
 *   "isRead": true
 * }
 */
export class UpdateNotificationDto {
  /**
   * Whether the notification is read
   * @example true
   */
  @IsBoolean()
  isRead!: boolean;
}
