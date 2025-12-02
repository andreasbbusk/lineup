import { IsString, IsOptional, IsArray, IsUUID, Length } from "class-validator";
import { MessageInsert } from "../../utils/supabase-helpers.js";

/**
 * DTO for creating a message
 *
 * Used when sending a message in a conversation.
 * The sender_id is automatically extracted from the authentication token.
 *
 * @example
 * {
 *   "content": "Hey, how are you?",
 *   "mediaIds": ["media-id-1", "media-id-2"],
 *   "replyToMessageId": "message-id-to-reply-to"
 * }
 */
export class CreateMessageDto
  implements
    Omit<
      MessageInsert,
      | "sender_id"
      | "conversation_id"
      | "created_at"
      | "id"
      | "is_edited"
      | "edited_at"
      | "is_deleted"
      | "deleted_at"
      | "sent_via_websocket"
    >
{
  /**
   * Message content (1-5000 characters)
   * Required if media_ids is not provided
   * @example "Hey, how are you?"
   */
  @IsOptional()
  @IsString()
  @Length(1, 5000, {
    message: "Message content must be between 1 and 5000 characters",
  })
  content?: string | null;

  /**
   * Array of media IDs to attach to the message
   * @example ["media-id-1", "media-id-2"]
   */
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true, message: "Each media ID must be a valid UUID" })
  @IsString({ each: true })
  mediaIds?: string[] | null;

  /**
   * Optional ID of the message this is replying to
   * @example "message-id-to-reply-to"
   */
  @IsOptional()
  @IsUUID(4, { message: "Reply to message ID must be a valid UUID" })
  @IsString()
  replyToMessageId?: string | null;
}

/**
 * DTO for updating a message
 *
 * Used when editing a message. Only the sender can edit their own messages,
 * and only within 15 minutes of sending.
 *
 * @example
 * {
 *   "content": "Updated message content"
 * }
 */
export class UpdateMessageDto {
  /**
   * Updated message content (1-5000 characters)
   * @example "Updated message content"
   */
  @IsString()
  @Length(1, 5000, {
    message: "Message content must be between 1 and 5000 characters",
  })
  content!: string;
}
