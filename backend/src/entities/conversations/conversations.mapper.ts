import {
  ConversationRow,
  ConversationParticipantRow,
} from "../../utils/supabase-helpers.js";
import {
  ConversationResponse,
  ConversationParticipantResponse,
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
 * Supabase conversation participant response with nested user relation
 */
type SupabaseParticipantWithRelations = ConversationParticipantRow & {
  user?: PartialProfile;
};

/**
 * Supabase conversation response with nested creator and participants relations
 */
type SupabaseConversationWithRelations = ConversationRow & {
  creator?: PartialProfile;
  participants?: SupabaseParticipantWithRelations[];
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
 * Maps Supabase participant response to API format
 */
function mapParticipantToResponse(
  participant: SupabaseParticipantWithRelations
): ConversationParticipantResponse {
  return {
    userId: participant.user_id,
    conversationId: participant.conversation_id,
    joinedAt: participant.joined_at,
    leftAt: participant.left_at ?? undefined,
    isAdmin: participant.is_admin,
    lastReadMessageId: participant.last_read_message_id ?? undefined,
    lastReadAt: participant.last_read_at ?? undefined,
    notificationsEnabled: participant.notifications_enabled,
    isMuted: participant.is_muted,
    user: participant.user
      ? mapPartialProfileToUser(participant.user)
      : undefined,
  };
}

/**
 * Maps Supabase conversation response with nested relations to API format
 * Converts snake_case to camelCase and includes creator and participants
 */
export function mapConversationToResponse(
  conversation: SupabaseConversationWithRelations
): ConversationResponse {
  return {
    id: conversation.id,
    type: conversation.type as "direct" | "group",
    name: conversation.name,
    avatarUrl: conversation.avatar_url,
    createdBy: conversation.created_by,
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
    lastMessageId: conversation.last_message_id ?? undefined,
    lastMessagePreview: conversation.last_message_preview ?? undefined,
    lastMessageAt: conversation.last_message_at ?? undefined,
    creator: conversation.creator
      ? mapPartialProfileToUser(conversation.creator)
      : undefined,
    participants: conversation.participants
      ? conversation.participants.map(mapParticipantToResponse)
      : undefined,
  };
}

/**
 * Maps array of Supabase conversation responses to API format
 */
export function mapConversationsToResponse(
  conversations: SupabaseConversationWithRelations[]
): ConversationResponse[] {
  return conversations.map(mapConversationToResponse);
}
