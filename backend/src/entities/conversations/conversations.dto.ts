import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsUUID,
  Length,
} from "class-validator";
import { ConversationInsert } from "../../utils/supabase-helpers.js";
import { ConversationType } from "../../utils/supabase-helpers.js";

/**
 * DTO for creating a conversation
 *
 * Used when creating a new direct message or group conversation.
 * The created_by is automatically extracted from the authentication token.
 *
 * For "direct" type conversations, name is not required.
 * For "group" type conversations, name is required.
 *
 * @example
 * {
 *   "type": "group",
 *   "name": "Band Practice",
 *   "avatarUrl": "https://example.com/avatar.jpg",
 *   "participantIds": ["user-id-1", "user-id-2"]
 * }
 */
export class CreateConversationDto
  implements
    Omit<
      ConversationInsert,
      | "created_by"
      | "created_at"
      | "updated_at"
      | "id"
      | "last_message_id"
      | "last_message_preview"
      | "last_message_at"
    >
{
  /**
   * Conversation type: "direct" or "group"
   * @example "group"
   */
  @IsEnum(["direct", "group"], {
    message: "Type must be 'direct' or 'group'",
  })
  type!: ConversationType;

  /**
   * Optional name for the conversation (required for groups)
   * @example "Band Practice"
   */
  @IsOptional()
  @IsString()
  @Length(1, 100, {
    message: "Name must be between 1 and 100 characters",
  })
  name?: string | null;

  /**
   * Optional avatar URL for group conversations
   * @example "https://example.com/avatar.jpg"
   */
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  /**
   * Array of user IDs to add as participants (excluding the creator)
   * For direct messages, should contain exactly one user ID
   * For groups, can contain multiple user IDs (max 7 additional users, 8 total including creator)
   * @example ["user-id-1", "user-id-2"]
   */
  @IsArray()
  @IsUUID(4, {
    each: true,
    message: "Each participant ID must be a valid UUID",
  })
  @IsString({ each: true })
  participantIds!: string[];
}

/**
 * DTO for updating a conversation
 *
 * Used when updating conversation settings like name or avatar.
 * Only group conversations can be updated.
 *
 * @example
 * {
 *   "name": "Updated Group Name",
 *   "avatarUrl": "https://example.com/new-avatar.jpg"
 * }
 */
export class UpdateConversationDto {
  /**
   * Updated name for the conversation
   * @example "Updated Group Name"
   */
  @IsOptional()
  @IsString()
  @Length(1, 100, {
    message: "Name must be between 1 and 100 characters",
  })
  name?: string | null;

  /**
   * Updated avatar URL for the conversation
   * @example "https://example.com/new-avatar.jpg"
   */
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;
}
