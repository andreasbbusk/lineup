// lib/features/chats/utils/realtimeAdapter.ts
import { Message } from "../types";

/**
 * Raw message record from Supabase database (snake_case)
 */
export type DbMessageRecord = Record<string, unknown> & {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_ids?: string[] | null;
  is_edited?: boolean;
  edited_at?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
  reply_to_message_id?: string | null;
  created_at: string;
  sent_via_websocket?: boolean;
  sender?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  reply_to?: DbMessageRecord;
  media?: Array<{
    id: string;
    url: string;
    thumbnail_url: string | null;
    type: "image" | "video";
  }>;
};

/**
 * Converts a raw Supabase DB row (snake_case) into our frontend Message type (camelCase).
 * Note: Realtime events do NOT include relations (sender, media), so those will be undefined initially.
 */
export function mapRealtimeMessage(row: DbMessageRecord): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    mediaIds: row.media_ids || null,
    isEdited: row.is_edited ?? false,
    editedAt: row.edited_at ?? null,
    isDeleted: row.is_deleted ?? false,
    deletedAt: row.deleted_at ?? null,
    replyToMessageId: row.reply_to_message_id ?? null,
    createdAt: row.created_at,
    sentViaWebsocket: row.sent_via_websocket ?? false,

    // Relations are missing in raw realtime events
    sender: undefined,
    replyTo: undefined,
    media: undefined,
  };
}

/**
 * Converts a snake_case API message response to camelCase frontend type
 */
export function mapApiMessage(apiMessage: DbMessageRecord): Message {
  return {
    id: apiMessage.id,
    conversationId: apiMessage.conversation_id,
    senderId: apiMessage.sender_id,
    content: apiMessage.content,
    mediaIds: apiMessage.media_ids ?? null,
    isEdited: apiMessage.is_edited ?? false,
    editedAt: apiMessage.edited_at ?? null,
    isDeleted: apiMessage.is_deleted ?? false,
    deletedAt: apiMessage.deleted_at ?? null,
    replyToMessageId: apiMessage.reply_to_message_id ?? null,
    createdAt: apiMessage.created_at,
    sentViaWebsocket: apiMessage.sent_via_websocket ?? false,
    sender: apiMessage.sender ? {
      id: apiMessage.sender.id,
      username: apiMessage.sender.username,
      firstName: apiMessage.sender.first_name,
      lastName: apiMessage.sender.last_name,
      avatarUrl: apiMessage.sender.avatar_url ?? null,
    } : undefined,
    replyTo: apiMessage.reply_to ? mapApiMessage(apiMessage.reply_to) : undefined,
    media: apiMessage.media?.map(m => ({
      id: m.id,
      url: m.url,
      thumbnailUrl: m.thumbnail_url,
      type: m.type,
    })) ?? undefined,
  };
}
