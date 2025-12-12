import {
  ConversationResponse,
  ConversationParticipantResponse,
} from "../../types/api.types.js";

/**
 * Internal types for documentation and IDE autocomplete.
 * These describe the expected shape of Supabase query results,
 * but functions accept 'any' for flexibility with dynamic queries.
 */
type Profile = {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

type Participant = {
  user_id: string;
  conversation_id: string;
  joined_at: string;
  left_at: string | null;
  is_admin: boolean;
  last_read_message_id: string | null;
  last_read_at: string | null;
  notifications_enabled: boolean;
  is_muted: boolean;
  unread_count?: number;
  user?: Profile;
};

const mapProfile = (p: Profile) => ({
  id: p.id,
  username: p.username,
  firstName: p.first_name ?? null,
  lastName: p.last_name ?? null,
  avatarUrl: p.avatar_url ?? null,
});

const mapParticipant = (p: Participant): ConversationParticipantResponse => ({
  userId: p.user_id,
  conversationId: p.conversation_id,
  joinedAt: p.joined_at,
  leftAt: p.left_at ?? null,
  isAdmin: p.is_admin,
  lastReadMessageId: p.last_read_message_id ?? null,
  lastReadAt: p.last_read_at ?? null,
  notificationsEnabled: p.notifications_enabled,
  isMuted: p.is_muted,
  user: p.user ? mapProfile(p.user) : undefined,
});

export function mapConversationToResponse(
  conversation: any,
  currentUserId?: string
): ConversationResponse {
  const currentParticipant = currentUserId
    ? conversation.participants?.find((p: any) => p.user_id === currentUserId)
    : null;

  return {
    id: conversation.id,
    type: conversation.type as "direct" | "group",
    name: conversation.name,
    avatarUrl: conversation.avatar_url,
    createdBy: conversation.created_by,
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
    lastMessageId: conversation.last_message_id ?? null,
    lastMessagePreview: conversation.last_message_preview ?? null,
    lastMessageAt: conversation.last_message_at ?? null,
    lastMessageSenderId: conversation.last_message_sender_id ?? null,
    unreadCount: currentParticipant?.unread_count || 0,
    relatedPostId: (conversation as any).related_post_id ?? null,
    creator: conversation.creator
      ? mapProfile(conversation.creator)
      : undefined,
    participants: (conversation.type === "group"
      ? conversation.participants?.filter((p: any) => !p.left_at)
      : conversation.participants
    )?.map(mapParticipant),
  };
}

export function mapConversationsToResponse(
  conversations: any[],
  currentUserId?: string
): ConversationResponse[] {
  return conversations.map((c) => mapConversationToResponse(c, currentUserId));
}
