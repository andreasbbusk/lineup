import {
  createAuthenticatedClient,
  supabase,
} from "../../config/supabase.config.js";
import {
  ConversationInsert,
  ConversationUpdate,
  ConversationParticipantInsert,
} from "../../utils/supabase-helpers.js";
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

export class ConversationsService {
  /**
   * Get all conversations for the authenticated user
   * Returns conversations with creator and participants
   */
  async getUserConversations(
    userId: string,
    token: string
  ): Promise<ConversationResponse[]> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    // First, get conversation IDs where user is an active participant
    const { data: participantData, error: participantError } =
      await authedSupabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId)
        .is("left_at", null);

    if (participantError) {
      throw createHttpError({
        message: `Failed to fetch participant data: ${participantError.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    if (!participantData || participantData.length === 0) {
      return [];
    }

    const conversationIds = participantData.map((p) => p.conversation_id);

    // Get conversations where user is a participant
    const { data: conversations, error } = await authedSupabase
      .from("conversations")
      .select(
        `
        *,
        creator:profiles!conversations_created_by_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        ),
        participants:conversation_participants(
          *,
          user:profiles!conversation_participants_user_id_fkey(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        )
      `
      )
      .in("id", conversationIds)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (error) {
      throw createHttpError({
        message: `Failed to fetch conversations: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapConversationsToResponse(conversations || []);
  }

  /**
   * Get a conversation by ID
   * Returns conversation with creator and participants
   */
  async getConversationById(
    conversationId: string,
    userId: string,
    token: string
  ): Promise<ConversationResponse> {
    // Create authenticated Supabase client for RLS
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

    // Get the conversation
    const { data: conversation, error } = await authedSupabase
      .from("conversations")
      .select(
        `
        *,
        creator:profiles!conversations_created_by_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        ),
        participants:conversation_participants(
          *,
          user:profiles!conversation_participants_user_id_fkey(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        )
      `
      )
      .eq("id", conversationId)
      .single();

    if (error || !conversation) {
      throw createHttpError({
        message: "Conversation not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    return mapConversationToResponse(conversation);
  }

  /**
   * Create a conversation
   * Creates a direct message or group conversation with participants
   */
  async createConversation(
    userId: string,
    data: CreateConversationDto,
    token: string
  ): Promise<ConversationResponse> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    // Validate conversation type requirements
    if (data.type === "group" && !data.name) {
      throw createHttpError({
        message: "Group conversations must have a name",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Validate participant count
    const totalParticipants = data.participant_ids.length + 1; // +1 for creator
    if (data.type === "direct" && data.participant_ids.length !== 1) {
      throw createHttpError({
        message: "Direct conversations must have exactly one other participant",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }
    if (data.type === "group" && totalParticipants > 8) {
      throw createHttpError({
        message: "Group conversations can have at most 8 participants",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Validate that user is not adding themselves
    if (data.participant_ids.includes(userId)) {
      throw createHttpError({
        message: "You cannot add yourself as a participant",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Verify all participants exist
    const { data: participants, error: participantsError } =
      await authedSupabase
        .from("profiles")
        .select("id")
        .in("id", data.participant_ids);

    if (
      participantsError ||
      !participants ||
      participants.length !== data.participant_ids.length
    ) {
      throw createHttpError({
        message: "One or more participants not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Create the conversation
    const conversationInsert: ConversationInsert = {
      type: data.type,
      name: data.name ?? null,
      avatar_url: data.avatar_url ?? null,
      created_by: userId,
    };

    const { data: conversation, error: conversationError } =
      await authedSupabase
        .from("conversations")
        .insert(conversationInsert)
        .select()
        .single();

    if (conversationError || !conversation) {
      throw createHttpError({
        message: `Failed to create conversation: ${conversationError?.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    // Add creator as participant
    const creatorParticipant: ConversationParticipantInsert = {
      conversation_id: conversation.id,
      user_id: userId,
      is_admin: data.type === "group", // Creator is admin for groups
    };

    // Add other participants
    const participantInserts: ConversationParticipantInsert[] = [
      creatorParticipant,
      ...data.participant_ids.map((participantId) => ({
        conversation_id: conversation.id,
        user_id: participantId,
        is_admin: false,
      })),
    ];

    const { error: participantsInsertError } = await authedSupabase
      .from("conversation_participants")
      .insert(participantInserts);

    if (participantsInsertError) {
      // Rollback: Delete the conversation if participant insertion fails
      await authedSupabase
        .from("conversations")
        .delete()
        .eq("id", conversation.id);

      throw createHttpError({
        message: `Failed to add participants: ${participantsInsertError.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    // Fetch complete conversation with relations
    return this.getConversationById(conversation.id, userId, token);
  }

  /**
   * Update a conversation
   * Only group conversations can be updated, and only by admins or creator
   */
  async updateConversation(
    conversationId: string,
    userId: string,
    data: UpdateConversationDto,
    token: string
  ): Promise<ConversationResponse> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    // Verify conversation exists and user has permission
    const { data: conversation, error: fetchError } = await authedSupabase
      .from("conversations")
      .select("type, created_by")
      .eq("id", conversationId)
      .single();

    if (fetchError || !conversation) {
      throw createHttpError({
        message: "Conversation not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    if (conversation.type === "direct") {
      throw createHttpError({
        message: "Direct conversations cannot be updated",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Check if user is creator or admin
    const { data: participant } = await authedSupabase
      .from("conversation_participants")
      .select("is_admin")
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

    if (conversation.created_by !== userId && !participant.is_admin) {
      throw createHttpError({
        message:
          "Only conversation creator or admins can update the conversation",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Update the conversation
    const updateData: ConversationUpdate = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.avatar_url !== undefined) {
      updateData.avatar_url = data.avatar_url;
    }

    const { error: updateError } = await authedSupabase
      .from("conversations")
      .update(updateData)
      .eq("id", conversationId);

    if (updateError) {
      throw createHttpError({
        message: `Failed to update conversation: ${updateError.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    // Fetch updated conversation
    return this.getConversationById(conversationId, userId, token);
  }

  /**
   * Delete a conversation or leave a group
   * For direct messages: soft delete (marks as left)
   * For groups: removes user from participants
   */
  async deleteConversation(
    conversationId: string,
    userId: string,
    token: string
  ): Promise<void> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    // Get conversation type
    const { data: conversation, error: fetchError } = await authedSupabase
      .from("conversations")
      .select("type")
      .eq("id", conversationId)
      .single();

    if (fetchError || !conversation) {
      throw createHttpError({
        message: "Conversation not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // For direct messages, mark as left
    // For groups, remove from participants
    const { error } = await authedSupabase
      .from("conversation_participants")
      .update({ left_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .is("left_at", null);

    if (error) {
      throw createHttpError({
        message: `Failed to leave conversation: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }
  }
}
