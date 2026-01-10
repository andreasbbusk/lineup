import { MessageResponse } from "../../types/api.types.js";

/**
 * Internal types for documentation and IDE autocomplete.
 * Functions accept 'any' for flexibility with dynamic Supabase queries.
 */
type Profile = {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

type Media = {
  id: string;
  url: string;
  thumbnail_url: string | null;
  type: string;
};

const mapProfile = (p: Profile) => ({
  id: p.id,
  username: p.username,
  firstName: p.first_name ?? null,
  lastName: p.last_name ?? null,
  avatarUrl: p.avatar_url ?? null,
});

const mapMedia = (m: Media) => ({
  id: m.id,
  url: m.url,
  thumbnailUrl: m.thumbnail_url ?? null,
  type: m.type,
});

export function mapMessageToResponse(message: any): MessageResponse {
  return {
    id: message.id,
    conversationId: message.conversation_id,
    senderId: message.sender_id,
    content: message.content,
    mediaIds: message.media_ids ?? null,
    isEdited: message.is_edited,
    editedAt: message.edited_at ?? null,
    isDeleted: message.is_deleted,
    deletedAt: message.deleted_at ?? null,
    replyToMessageId: message.reply_to_message_id ?? null,
    createdAt: message.created_at,
    sender: message.sender ? mapProfile(message.sender) : undefined,
    replyTo: message.reply_to
      ? mapMessageToResponse(message.reply_to)
      : undefined,
    media: message.media?.map(mapMedia),
  };
}

export function mapMessagesToResponse(messages: any[]): MessageResponse[] {
  return messages.map(mapMessageToResponse);
}
