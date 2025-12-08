import { createAuthenticatedClient } from "../../config/supabase.config.js";
import { createHttpError } from "../../utils/error-handler.js";
import {
  mapConversationsToResponse,
  mapConversationToResponse,
} from "./conversations.mapper.js";
import { ConversationResponse } from "../../types/api.types.js";
import {
  CreateConversationDto,
  UpdateConversationDto,
} from "./conversations.dto.js";

const CONVERSATION_SELECT = `
  *,
  creator:profiles!conversations_created_by_fkey(id, username, first_name, last_name, avatar_url),
  participants:conversation_participants(
    *,
    user:profiles!conversation_participants_user_id_fkey(id, username, first_name, last_name, avatar_url)
  )
`;

export class ConversationsService {
  private async verifyParticipant(
    supabase: any,
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

  async getUserConversations(
    userId: string,
    token: string
  ): Promise<ConversationResponse[]> {
    const supabase = createAuthenticatedClient(token);

    const { data: participantData, error: participantError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId)
      .is("left_at", null);

    if (participantError)
      throw createHttpError({
        message: `Failed to fetch participants: ${participantError.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    if (!participantData?.length) return [];

    const { data, error } = await supabase
      .from("conversations")
      .select(CONVERSATION_SELECT)
      .in(
        "id",
        participantData.map((p) => p.conversation_id)
      )
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (error)
      throw createHttpError({
        message: `Failed to fetch conversations: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });

    // Fetch sender IDs for last messages
    const conversationsWithMessages = data || [];
    const messageIds = conversationsWithMessages
      .map((c) => c.last_message_id)
      .filter(Boolean);

    let messageSenders: Record<string, string> = {};
    if (messageIds.length > 0) {
      const { data: messages } = await supabase
        .from("messages")
        .select("id, sender_id")
        .in("id", messageIds as string[]);

      messageSenders = (messages || []).reduce((acc, msg) => {
        acc[msg.id] = msg.sender_id;
        return acc;
      }, {} as Record<string, string>);
    }

    // Add sender_id to conversations
    const conversationsWithSenders = conversationsWithMessages.map((conv) => ({
      ...conv,
      last_message_sender_id: conv.last_message_id
        ? messageSenders[conv.last_message_id] || null
        : null,
    }));

    return mapConversationsToResponse(conversationsWithSenders, userId);
  }

  async getConversationById(
    conversationId: string,
    userId: string,
    token: string
  ): Promise<ConversationResponse> {
    const supabase = createAuthenticatedClient(token);

    if (!(await this.verifyParticipant(supabase, conversationId, userId))) {
      throw createHttpError({
        message: "Not a participant",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    const { data, error } = await supabase
      .from("conversations")
      .select(CONVERSATION_SELECT)
      .eq("id", conversationId)
      .single();

    if (error || !data)
      throw createHttpError({
        message: "Conversation not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });

    // Fetch sender ID for last message if it exists
    let lastMessageSenderId = null;
    if (data.last_message_id) {
      const { data: message } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("id", data.last_message_id)
        .single();
      lastMessageSenderId = message?.sender_id || null;
    }

    return mapConversationToResponse(
      { ...data, last_message_sender_id: lastMessageSenderId },
      userId
    );
  }

  async createConversation(
    userId: string,
    data: CreateConversationDto,
    token: string
  ): Promise<ConversationResponse> {
    const supabase = createAuthenticatedClient(token);

    // Validate
    if (data.type === "group" && !data.name) {
      throw createHttpError({
        message: "Group conversations must have a name",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }
    if (data.type === "direct" && data.participantIds.length !== 1) {
      throw createHttpError({
        message: "Direct conversations need exactly 1 other participant",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }
    if (data.type === "group" && data.participantIds.length + 1 > 8) {
      throw createHttpError({
        message: "Max 8 participants in groups",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }
    if (data.participantIds.includes(userId)) {
      throw createHttpError({
        message: "Cannot add yourself",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Verify participants exist
    const { data: participants, error: participantsError } = await supabase
      .from("profiles")
      .select("id")
      .in("id", data.participantIds);

    if (
      participantsError ||
      participants?.length !== data.participantIds.length
    ) {
      throw createHttpError({
        message: "One or more participants not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // For direct conversations, check if one already exists between these users
    if (data.type === "direct") {
      const otherUserId = data.participantIds[0];

      // Find all direct conversations where the current user is a participant
      const { data: userConversations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId)
        .is("left_at", null);

      if (userConversations && userConversations.length > 0) {
        const conversationIds = userConversations.map((c) => c.conversation_id);

        // Check if the other user is also in any of these direct conversations
        const { data: existingDirectConversation } = await supabase
          .from("conversations")
          .select(
            `
            id,
            type,
            conversation_participants!inner(user_id)
          `
          )
          .in("id", conversationIds)
          .eq("type", "direct")
          .eq("conversation_participants.user_id", otherUserId)
          .is("conversation_participants.left_at", null)
          .limit(1)
          .single();

        if (existingDirectConversation) {
          // Return the existing direct conversation
          return this.getConversationById(
            existingDirectConversation.id,
            userId,
            token
          );
        }
      }
    }

    // Create conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        type: data.type,
        name: data.name ?? null,
        avatar_url: data.avatarUrl ?? null,
        created_by: userId,
      })
      .select()
      .single();

    if (conversationError || !conversation) {
      throw createHttpError({
        message: `Failed to create: ${conversationError?.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    // Add participants (creator + others)
    const participantInserts = [
      {
        conversation_id: conversation.id,
        user_id: userId,
        is_admin: data.type === "group",
      },
      ...data.participantIds.map((id) => ({
        conversation_id: conversation.id,
        user_id: id,
        is_admin: false,
      })),
    ];

    const { error: participantsInsertError } = await supabase
      .from("conversation_participants")
      .insert(participantInserts);

    if (participantsInsertError) {
      await supabase.from("conversations").delete().eq("id", conversation.id); // Rollback
      throw createHttpError({
        message: `Failed to add participants: ${participantsInsertError.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return this.getConversationById(conversation.id, userId, token);
  }

  async updateConversation(
    conversationId: string,
    userId: string,
    data: UpdateConversationDto,
    token: string
  ): Promise<ConversationResponse> {
    const supabase = createAuthenticatedClient(token);

    const { data: conversation, error: fetchError } = await supabase
      .from("conversations")
      .select("type, created_by")
      .eq("id", conversationId)
      .single();

    if (fetchError || !conversation)
      throw createHttpError({
        message: "Conversation not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    if (conversation.type === "direct")
      throw createHttpError({
        message: "Cannot update direct conversations",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    if (!(await this.verifyParticipant(supabase, conversationId, userId))) {
      throw createHttpError({
        message: "Not a participant",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Check admin permission
    const { data: participant } = await supabase
      .from("conversation_participants")
      .select("is_admin")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .is("left_at", null)
      .single();

    if (conversation.created_by !== userId && !participant?.is_admin) {
      throw createHttpError({
        message: "Only creator or admins can update",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Update
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;

    const { error: updateError } = await supabase
      .from("conversations")
      .update(updateData)
      .eq("id", conversationId);

    if (updateError)
      throw createHttpError({
        message: `Update failed: ${updateError.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });

    return this.getConversationById(conversationId, userId, token);
  }

  async deleteConversation(
    conversationId: string,
    userId: string,
    token: string
  ): Promise<void> {
    const supabase = createAuthenticatedClient(token);

    const { data: conversation, error: fetchError } = await supabase
      .from("conversations")
      .select("type")
      .eq("id", conversationId)
      .single();

    if (fetchError || !conversation)
      throw createHttpError({
        message: "Conversation not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });

    const { error } = await supabase
      .from("conversation_participants")
      .update({ left_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .is("left_at", null);

    if (error)
      throw createHttpError({
        message: `Failed to leave: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
  }

  async getUnreadCount(
    userId: string,
    token: string
  ): Promise<{ unread_count: number }> {
    const { data, error } = await createAuthenticatedClient(token)
      .from("conversation_participants")
      .select("unread_count")
      .eq("user_id", userId)
      .is("left_at", null);

    if (error)
      throw createHttpError({
        message: `Unread count fetch failed: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });

    return {
      unread_count:
        data?.reduce((sum, p) => sum + (p.unread_count || 0), 0) || 0,
    };
  }
}
