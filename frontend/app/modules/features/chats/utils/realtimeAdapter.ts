import { Message } from "../types";

/**
 * Raw message record from Supabase realtime events (snake_case)
 * 
 * Note: This is ONLY used for Supabase Realtime events which come directly
 * from the database in snake_case format. API responses are now camelCase
 * from the backend and don't need mapping.
 */
export type DbMessageRecord = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  media_ids?: string[] | null;
  is_edited?: boolean | null;
  edited_at?: string | null;
  is_deleted?: boolean | null;
  deleted_at?: string | null;
  reply_to_message_id?: string | null;
  created_at: string | null;
  sent_via_websocket?: boolean | null;
};

/**
 * Database profile record (snake_case)
 */
type DbProfileRecord = {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

/**
 * Complete message record with sender relation from database (snake_case)
 */
export type DbMessageWithSender = DbMessageRecord & {
  sender?: DbProfileRecord;
};

/**
 * Converts a raw Supabase Realtime event (snake_case) into our frontend Message type (camelCase).
 * 
 * Note: Realtime events do NOT include relations (sender, media, replyTo),
 * so those will be undefined. The message will still render, just without
 * sender info until the cache is refreshed.
 */ 
export function mapRealtimeMessage(row: DbMessageRecord): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    mediaIds: row.media_ids ?? null,
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
 * Converts a complete database message with sender relation (snake_case) 
 * into our frontend Message type (camelCase).
 * 
 * Use this when you fetch the complete message with sender data from the database.
 */
export function mapMessageWithSender(row: DbMessageWithSender): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    mediaIds: row.media_ids ?? null,
    isEdited: row.is_edited ?? false,
    editedAt: row.edited_at ?? null,
    isDeleted: row.is_deleted ?? false,
    deletedAt: row.deleted_at ?? null,
    replyToMessageId: row.reply_to_message_id ?? null,
    createdAt: row.created_at,
    sentViaWebsocket: row.sent_via_websocket ?? false,
    sender: row.sender
      ? {
          id: row.sender.id,
          username: row.sender.username,
          firstName: row.sender.first_name,
          lastName: row.sender.last_name,
          avatarUrl: row.sender.avatar_url,
        }
      : undefined,
    replyTo: undefined,
    media: undefined,
  };
}
