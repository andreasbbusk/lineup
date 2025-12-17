import { supabase } from "../../config/supabase.config.js";
import { createHttpError } from "../../utils/error-handler.js";
import type { SendMessageDto, EditMessageDto } from "./messages.dto.js";
import {
  mapMessageToResponse,
  mapMessagesToResponse,
} from "./messages.mapper.js";
import type {
  PaginatedMessagesResponse,
  MessageResponse,
} from "../../types/api.types.js";

const MESSAGE_SELECT = `
  id,
  conversation_id,
  sender_id,
  content,
  media_ids,
  is_edited,
  edited_at,
  is_deleted,
  deleted_at,
  reply_to_message_id,
  created_at,
  sent_via_websocket,
  status,
  sender:profiles!messages_sender_id_fkey(id, username, first_name, last_name, avatar_url)
`;

export class MessagesService {
  private async verifyParticipant(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    const { data } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .is("left_at", null)
      .single();
    return !!data;
  }

  async getMessages(
    userId: string,
    conversationId: string,
    pagination: { before_message_id?: string; limit: number }
  ): Promise<PaginatedMessagesResponse> {
    if (!(await this.verifyParticipant(conversationId, userId))) {
      throw createHttpError({
        message: "Not a participant",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Fetch one extra message to check if there are more
    let query = supabase
      .from("messages")
      .select(MESSAGE_SELECT)
      .eq("conversation_id", conversationId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(pagination.limit + 1);

    if (pagination.before_message_id) {
      const { data: cursor } = await supabase
        .from("messages")
        .select("created_at")
        .eq("id", pagination.before_message_id)
        .single();

      if (cursor) query = query.lt("created_at", cursor.created_at);
    }

    const { data, error } = await query;
    if (error)
      throw createHttpError({
        message: `Fetch failed: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });

    const allMessages = data || [];

    // Check if there are more messages (we fetched limit + 1)
    const hasMore = allMessages.length > pagination.limit;

    // Remove the extra message we fetched for the hasMore check
    const messagesToReturn = hasMore
      ? allMessages.slice(0, pagination.limit)
      : allMessages;

    // Reverse to chronological order (oldest first) and map to camelCase
    const sortedMessages = messagesToReturn.reverse();
    const mappedMessages = mapMessagesToResponse(sortedMessages);

    // nextCursor is the oldest message ID (first in the sorted array)
    const nextCursor =
      hasMore && mappedMessages.length > 0 ? mappedMessages[0].id : null;

    return {
      messages: mappedMessages,
      hasMore,
      nextCursor,
    };
  }

  async sendMessage(
    userId: string,
    dto: SendMessageDto
  ): Promise<MessageResponse> {
    if (!(await this.verifyParticipant(dto.conversation_id, userId))) {
      throw createHttpError({
        message: "Not a participant",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: dto.conversation_id,
        sender_id: userId,
        content: dto.content,
        media_ids: dto.media_ids || null,
        reply_to_message_id: dto.reply_to_message_id || null,
      })
      .select(
        `*, sender:profiles!messages_sender_id_fkey(id, username, first_name, last_name, avatar_url)`
      )
      .single();

    if (error)
      throw createHttpError({
        message: `Send failed: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });

    return mapMessageToResponse(data);
  }

  async editMessage(userId: string, messageId: string, dto: EditMessageDto) {
    const { data, error } = await supabase
      .from("messages")
      .update({
        content: dto.content,
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq("id", messageId)
      .eq("sender_id", userId)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error)
      throw createHttpError({
        message: `Edit failed: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    if (!data)
      throw createHttpError({
        message: "Message not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });

    // Check if this is the last message and update conversation preview
    const { data: conversation } = await supabase
      .from("conversations")
      .select("last_message_id")
      .eq("id", data.conversation_id)
      .single();

    if (conversation?.last_message_id === messageId) {
      await supabase
        .from("conversations")
        .update({
          last_message_preview: dto.content,
        })
        .eq("id", data.conversation_id);
    }

    return data;
  }

  async deleteMessage(userId: string, messageId: string): Promise<void> {
    // Get the message info before deleting
    const { data: messageToDelete } = await supabase
      .from("messages")
      .select("id, conversation_id")
      .eq("id", messageId)
      .eq("sender_id", userId)
      .single();

    if (!messageToDelete)
      throw createHttpError({
        message: "Message not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });

    const { data, error } = await supabase
      .from("messages")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        content: "[Deleted]",
      })
      .eq("id", messageId)
      .eq("sender_id", userId)
      .select();

    if (error)
      throw createHttpError({
        message: `Delete failed: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });

    // Check if this was the last message and update conversation accordingly
    const { data: conversation } = await supabase
      .from("conversations")
      .select("last_message_id")
      .eq("id", messageToDelete.conversation_id)
      .single();

    // If the deleted message was the last message, find the new last message
    if (conversation?.last_message_id === messageId) {
      const { data: newLastMessage } = await supabase
        .from("messages")
        .select("id, content, created_at")
        .eq("conversation_id", messageToDelete.conversation_id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Update conversation with new last message (or null if no messages left)
      await supabase
        .from("conversations")
        .update({
          last_message_id: newLastMessage?.id || null,
          last_message_preview: newLastMessage?.content || null,
          last_message_at: newLastMessage?.created_at || null,
        })
        .eq("id", messageToDelete.conversation_id);
    }
  }

  async markAsRead(userId: string, messageIds: string[]) {
    if (!messageIds.length) return { success: true };

    const receipts = messageIds.map((id) => ({
      message_id: id,
      user_id: userId,
    }));

    const { error: receiptError } = await supabase
      .from("message_read_receipts")
      .upsert(receipts, { onConflict: "message_id,user_id" });

    if (receiptError)
      throw createHttpError({
        message: `Read receipt failed: ${receiptError.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });

    const { data: message } = await supabase
      .from("messages")
      .select("conversation_id")
      .eq("id", messageIds[0])
      .single();

    if (message) {
      await supabase
        .from("conversation_participants")
        .update({
          last_read_message_id: messageIds[messageIds.length - 1],
          last_read_at: new Date().toISOString(),
          unread_count: 0,
        })
        .eq("conversation_id", message.conversation_id)
        .eq("user_id", userId);
    }

    return { success: true };
  }

  async setTypingIndicator(
    userId: string,
    conversationId: string,
    isTyping: boolean
  ) {
    const { error } = await supabase
      .from("conversation_participants")
      .update({
        is_typing: isTyping,
        last_typing_at: isTyping ? new Date().toISOString() : null,
      })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .is("left_at", null);

    if (error)
      throw createHttpError({
        message: `Typing indicator failed: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
  }
}
