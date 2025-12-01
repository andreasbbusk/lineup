import { MessageRow } from "../../utils/supabase-helpers.js";
import {
  MessageResponse,
  MessageReadReceiptResponse,
} from "../../types/api.types.js";

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
 * Media structure from Supabase
 */
type MediaRow = {
  id: string;
  url: string;
  thumbnail_url: string | null;
  type: string;
};

/**
 * Supabase message response with nested sender, reply, read receipts, and media relations
 */
type SupabaseMessageWithRelations = MessageRow & {
  sender?: PartialProfile;
  reply_to?: SupabaseMessageWithRelations;
  read_receipts?: Array<{
    message_id: string;
    user_id: string;
    read_at: string | null;
    user?: PartialProfile;
  }>;
  media?: MediaRow[];
};

/**
 * Maps a partial profile to a simple user object
 */
function mapPartialProfileToUser(profile: PartialProfile) {
  return {
    id: profile.id,
    username: profile.username,
    firstName: profile.first_name ?? undefined,
    lastName: profile.last_name ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
  };
}

/**
 * Maps read receipt to API format
 */
function mapReadReceiptToResponse(receipt: {
  message_id: string;
  user_id: string;
  read_at: string | null;
  user?: PartialProfile;
}): MessageReadReceiptResponse {
  return {
    messageId: receipt.message_id,
    userId: receipt.user_id,
    readAt: receipt.read_at,
    user: receipt.user ? mapPartialProfileToUser(receipt.user) : undefined,
  };
}

/**
 * Maps Supabase message response with nested relations to API format
 * Converts snake_case to camelCase and includes sender, reply, read receipts, and media
 */
export function mapMessageToResponse(
  message: SupabaseMessageWithRelations
): MessageResponse {
  return {
    id: message.id,
    conversationId: message.conversation_id,
    senderId: message.sender_id,
    content: message.content,
    mediaIds: message.media_ids ?? undefined,
    isEdited: message.is_edited,
    editedAt: message.edited_at ?? undefined,
    isDeleted: message.is_deleted,
    deletedAt: message.deleted_at ?? undefined,
    replyToMessageId: message.reply_to_message_id ?? undefined,
    createdAt: message.created_at,
    sentViaWebsocket: message.sent_via_websocket,
    sender: message.sender
      ? mapPartialProfileToUser(message.sender)
      : undefined,
    replyTo: message.reply_to
      ? mapMessageToResponse(message.reply_to)
      : undefined,
    readReceipts: message.read_receipts
      ? message.read_receipts.map(mapReadReceiptToResponse)
      : undefined,
    media: message.media
      ? message.media.map((m) => ({
          id: m.id,
          url: m.url,
          thumbnailUrl: m.thumbnail_url ?? undefined,
          type: m.type,
        }))
      : undefined,
  };
}

/**
 * Maps array of Supabase message responses to API format
 */
export function mapMessagesToResponse(
  messages: SupabaseMessageWithRelations[]
): MessageResponse[] {
  return messages.map(mapMessageToResponse);
}
