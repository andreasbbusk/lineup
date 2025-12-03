// lib/features/chats/types.ts
import { components } from "@/app/lib/types/api";

// --- Entity Types ---
export type Conversation = components["schemas"]["ConversationResponse"];
export type Participant = components["schemas"]["ConversationParticipantResponse"];

// Convert snake_case API response to camelCase for frontend
export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  mediaIds: string[] | null;
  isEdited: boolean;
  editedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  replyToMessageId: string | null;
  createdAt: string;
  sentViaWebsocket: boolean;
  sender?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  replyTo?: Message;
  media?: Array<{
    id: string;
    url: string;
    thumbnailUrl: string | null;
    type: "image" | "video";
  }>;
};

// --- DTOs ---
export type CreateConversationDto = components["schemas"]["CreateConversationDto"];
export type SendMessageDto = components["schemas"]["SendMessageDto"];
export type EditMessageDto = components["schemas"]["EditMessageDto"];
export type MarkMessagesReadDto = components["schemas"]["MarkMessagesReadDto"];

// --- UI Helpers ---
export type UIMessage = Message & {
  isSending?: boolean;
  isError?: boolean;
};

// Grouped conversations for UI
export type GroupedConversations = {
  direct: Conversation[];
  groups: Conversation[];
};
