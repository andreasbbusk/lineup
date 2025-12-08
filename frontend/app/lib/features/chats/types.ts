// Single source of truth: @/app/lib/types/api.d.ts
import type { components } from "@/app/lib/types/api";

// --- Entity Types (from api.d.ts) ---
export type Conversation = components["schemas"]["ConversationResponse"];
export type Participant =
  components["schemas"]["ConversationParticipantResponse"];
export type Message = components["schemas"]["MessageResponse"];
export type PaginatedMessages =
  components["schemas"]["PaginatedMessagesResponse"];

// --- DTOs (from api.d.ts) ---
export type CreateConversationDto =
  components["schemas"]["CreateConversationDto"];
export type SendMessageDto = components["schemas"]["SendMessageDto"];
export type EditMessageDto = components["schemas"]["EditMessageDto"];
export type MarkMessagesReadDto = components["schemas"]["MarkMessagesReadDto"];
export type UserSearchResult = components["schemas"]["UserSearchResult"];

// --- Frontend-only UI Types ---
export type UIMessage = Message & {
  isSending?: boolean;
  isError?: boolean;
};

export type GroupedConversations = {
  direct: Conversation[];
  groups: Conversation[];
};
