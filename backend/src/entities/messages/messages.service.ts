import { createAuthenticatedClient } from "../../config/supabase.config.js";
import { MessageInsert, MessageUpdate } from "../../utils/supabase-helpers.js";
import { createHttpError } from "../../utils/error-handler.js";
import {
  mapMessagesToResponse,
  mapMessageToResponse,
} from "./messages.mapper.js";
import { MessageResponse } from "../../types/api.types.js";
import { CreateMessageDto, UpdateMessageDto } from "./messages.dto.js";

export class MessagesService {
  /**
   * Get messages for a conversation
   * Returns messages with sender info, read receipts, and optional reply data
   * Supports cursor-based pagination
   */
  async getConversationMessages(
    conversationId: string,
    userId: string,
    token: string,
    cursor?: string,
    limit: number = 50,
    before?: boolean
  ): Promise<{ messages: MessageResponse[]; nextCursor?: string }> {
    const authedSupabase = createAuthenticatedClient(token);

    // Verify user is a participant
    const { data: participant } = await authedSupabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .is("left_at", null)
      .single();

    if (!participant) {
      throw createHttpError({
        message: "Conversation not found or access denied",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Build query
    let query = authedSupabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        ),
        reply_to:messages!messages_reply_to_message_id_fkey(
          id,
          conversation_id,
          sender_id,
          content,
          created_at,
          sender:profiles!messages_sender_id_fkey(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        ),
        read_receipts:message_read_receipts(
          message_id,
          user_id,
          read_at,
          user:profiles!message_read_receipts_user_id_fkey(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        )
      `
      )
      .eq("conversation_id", conversationId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: before ? false : true })
      .limit(limit + 1);

    // Apply cursor
    if (cursor) {
      if (before) {
        query = query.lt("created_at", cursor);
      } else {
        query = query.gt("created_at", cursor);
      }
    }

    const { data: messages, error } = await query;

    if (error) {
      throw createHttpError({
        message: `Failed to fetch messages: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    if (!messages || messages.length === 0) {
      return { messages: [] };
    }

    // Check if there's a next page
    const hasNextPage = messages.length > limit;
    const messagesToReturn = hasNextPage ? messages.slice(0, limit) : messages;
    const nextCursor = hasNextPage
      ? messagesToReturn[messagesToReturn.length - 1].created_at ?? undefined
      : undefined;

    // Get all unique media IDs from messages
    const allMediaIds = new Set<string>();
    messagesToReturn.forEach((msg) => {
      if (msg.media_ids && Array.isArray(msg.media_ids)) {
        msg.media_ids.forEach((id) => allMediaIds.add(id));
      }
    });

    // Fetch media objects
    let mediaMap = new Map<string, any>();
    if (allMediaIds.size > 0) {
      const { data: media } = await authedSupabase
        .from("media")
        .select("id, url, thumbnail_url, type")
        .in("id", Array.from(allMediaIds));

      media?.forEach((m) => {
        mediaMap.set(m.id, m);
      });
    }

    // Attach media to messages
    const messagesWithMedia = messagesToReturn.map((msg) => ({
      ...msg,
      media:
        msg.media_ids && Array.isArray(msg.media_ids)
          ? msg.media_ids
              .map((id) => mediaMap.get(id))
              .filter(Boolean)
              .map((m) => ({
                id: m.id,
                url: m.url,
                thumbnailUrl: m.thumbnail_url ?? undefined,
                type: m.type,
              }))
          : [],
    }));

    return {
      messages: mapMessagesToResponse(messagesWithMedia as any),
      nextCursor,
    };
  }

  /**
   * Create a message in a conversation
   * Only participants can send messages
   */
  async createMessage(
    conversationId: string,
    userId: string,
    data: CreateMessageDto,
    token: string
  ): Promise<MessageResponse> {
    const authedSupabase = createAuthenticatedClient(token);

    // Validate that content or mediaIds is provided
    if (!data.content && (!data.mediaIds || data.mediaIds.length === 0)) {
      throw createHttpError({
        message: "Message must have content or media",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Verify user is a participant
    const { data: participant } = await authedSupabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .is("left_at", null)
      .single();

    if (!participant) {
      throw createHttpError({
        message: "You are not a participant in this conversation",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Verify replyToMessageId exists and is in the same conversation
    if (data.replyToMessageId) {
      const { data: replyMessage } = await authedSupabase
        .from("messages")
        .select("conversation_id")
        .eq("id", data.replyToMessageId)
        .eq("conversation_id", conversationId)
        .single();

      if (!replyMessage) {
        throw createHttpError({
          message: "Reply message not found or not in this conversation",
          statusCode: 404,
          code: "NOT_FOUND",
        });
      }
    }

    // Create the message
    const messageInsert: MessageInsert = {
      conversation_id: conversationId,
      sender_id: userId,
      content: data.content ?? null,
      media_ids: data.mediaIds ?? null,
      reply_to_message_id: data.replyToMessageId ?? null,
    };

    const { data: newMessage, error } = await authedSupabase
      .from("messages")
      .insert(messageInsert)
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        ),
        reply_to:messages!messages_reply_to_message_id_fkey(
          id,
          conversation_id,
          sender_id,
          content,
          created_at,
          sender:profiles!messages_sender_id_fkey(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        )
      `
      )
      .single();

    if (error || !newMessage) {
      throw createHttpError({
        message: `Failed to create message: ${error?.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    // Fetch complete message with all relations
    return this.getMessageById(newMessage.id, userId, token);
  }

  /**
   * Get a message by ID
   */
  async getMessageById(
    messageId: string,
    userId: string,
    token: string
  ): Promise<MessageResponse> {
    const authedSupabase = createAuthenticatedClient(token);

    const { data: message, error } = await authedSupabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        ),
        reply_to:messages!messages_reply_to_message_id_fkey(
          id,
          conversation_id,
          sender_id,
          content,
          created_at,
          sender:profiles!messages_sender_id_fkey(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        ),
        read_receipts:message_read_receipts(
          message_id,
          user_id,
          read_at,
          user:profiles!message_read_receipts_user_id_fkey(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        )
      `
      )
      .eq("id", messageId)
      .single();

    if (error || !message) {
      throw createHttpError({
        message: "Message not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Verify user is a participant in the conversation
    const { data: participant } = await authedSupabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("conversation_id", message.conversation_id)
      .eq("user_id", userId)
      .is("left_at", null)
      .single();

    if (!participant) {
      throw createHttpError({
        message: "Access denied",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Get media if media_ids exist
    let media: any[] = [];
    if (
      message.media_ids &&
      Array.isArray(message.media_ids) &&
      message.media_ids.length > 0
    ) {
      const { data: mediaData } = await authedSupabase
        .from("media")
        .select("id, url, thumbnail_url, type")
        .in("id", message.media_ids);

      media =
        mediaData?.map((m) => ({
          id: m.id,
          url: m.url,
          thumbnailUrl: m.thumbnail_url ?? undefined,
          type: m.type,
        })) || [];
    }

    const messageWithMedia = {
      ...message,
      media,
    };

    return mapMessageToResponse(messageWithMedia as any);
  }

  /**
   * Update a message
   * Only the sender can update their own messages, and only within 15 minutes
   */
  async updateMessage(
    messageId: string,
    userId: string,
    data: UpdateMessageDto,
    token: string
  ): Promise<MessageResponse> {
    const authedSupabase = createAuthenticatedClient(token);

    // Verify message exists and user is the sender
    const { data: message, error: fetchError } = await authedSupabase
      .from("messages")
      .select("sender_id, created_at")
      .eq("id", messageId)
      .single();

    if (fetchError || !message) {
      throw createHttpError({
        message: "Message not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    if (message.sender_id !== userId) {
      throw createHttpError({
        message: "You can only edit your own messages",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Check if message is within 15 minutes of creation
    const messageAge = Date.now() - new Date(message.created_at!).getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    if (messageAge > fifteenMinutes) {
      throw createHttpError({
        message: "Messages can only be edited within 15 minutes of sending",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Update the message
    const messageUpdate: MessageUpdate = {
      content: data.content,
      is_edited: true,
      edited_at: new Date().toISOString(),
    };

    const { error: updateError } = await authedSupabase
      .from("messages")
      .update(messageUpdate)
      .eq("id", messageId);

    if (updateError) {
      throw createHttpError({
        message: `Failed to update message: ${updateError.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    // Fetch updated message
    return this.getMessageById(messageId, userId, token);
  }

  /**
   * Delete a message (soft delete)
   * Only the sender can delete their own messages
   */
  async deleteMessage(
    messageId: string,
    userId: string,
    token: string
  ): Promise<void> {
    const authedSupabase = createAuthenticatedClient(token);

    // Verify message exists and user is the sender
    const { data: message, error: fetchError } = await authedSupabase
      .from("messages")
      .select("sender_id")
      .eq("id", messageId)
      .single();

    if (fetchError || !message) {
      throw createHttpError({
        message: "Message not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    if (message.sender_id !== userId) {
      throw createHttpError({
        message: "You can only delete your own messages",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Soft delete
    const { error } = await authedSupabase
      .from("messages")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        content: null, // Clear content on delete
      })
      .eq("id", messageId);

    if (error) {
      throw createHttpError({
        message: `Failed to delete message: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }
  }

  /**
   * Mark messages as read
   * Creates read receipts for messages in a conversation
   */
  async markMessagesAsRead(
    conversationId: string,
    userId: string,
    messageIds: string[],
    token: string
  ): Promise<void> {
    const authedSupabase = createAuthenticatedClient(token);

    // Verify user is a participant
    const { data: participant } = await authedSupabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .is("left_at", null)
      .single();

    if (!participant) {
      throw createHttpError({
        message: "You are not a participant in this conversation",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Verify all messages belong to this conversation
    const { data: messages } = await authedSupabase
      .from("messages")
      .select("id")
      .eq("conversation_id", conversationId)
      .in("id", messageIds);

    if (!messages || messages.length !== messageIds.length) {
      throw createHttpError({
        message: "One or more messages not found in this conversation",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Create or update read receipts
    const readReceipts = messageIds.map((messageId) => ({
      message_id: messageId,
      user_id: userId,
      read_at: new Date().toISOString(),
    }));

    const { error } = await authedSupabase
      .from("message_read_receipts")
      .upsert(readReceipts, { onConflict: "message_id,user_id" });

    if (error) {
      throw createHttpError({
        message: `Failed to mark messages as read: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    // Update participant's last_read_message_id
    const latestMessageId = messageIds[messageIds.length - 1];
    await authedSupabase
      .from("conversation_participants")
      .update({
        last_read_message_id: latestMessageId,
        last_read_at: new Date().toISOString(),
      })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
  }
}
