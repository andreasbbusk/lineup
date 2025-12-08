// lib/features/chats/index.ts

// ============================================================================
// Re-exports from other features
// ============================================================================

// Re-export search infrastructure for convenience
export { useUserSearch } from "@/app/lib/features/search";

// ============================================================================
// Types
// ============================================================================

export type {
  Conversation,
  Message,
  UIMessage,
  Participant,
  GroupedConversations,
  PaginatedMessages,
  CreateConversationDto,
  SendMessageDto,
  EditMessageDto,
  MarkMessagesReadDto,
} from "./types";

// ============================================================================
// Constants
// ============================================================================

export {
  MESSAGE_PREVIEW_LENGTH,
  CONVERSATION_PREVIEW_LENGTH,
  TYPING_INDICATOR_TIMEOUT_MS,
  DEFAULT_MESSAGES_PAGE_SIZE,
  DEFAULT_SKELETON_COUNT,
  STALE_TIME,
} from "./constants";

// ============================================================================
// API & Keys
// ============================================================================

export { chatApi } from "./api";
export { chatKeys } from "./queryKeys";

// ============================================================================
// Hooks - Query & Mutations
// ============================================================================

export { useChatMessages } from "./hooks/query/useChatMessages";
export {
  useConversations,
  useUnreadCount,
} from "./hooks/query/useConversations";
export { useConversation } from "./hooks/query/useConversation";
export { useSendMessage } from "./hooks/query/useSendMessage";
export { useDeleteMessage } from "./hooks/query/useDeleteMessage";
export { useMarkAsRead } from "./hooks/query/useMarkAsRead";
export { useConnections } from "./hooks/query/useConnections";
export { useCreateConversation } from "./hooks/query/useCreateConversation";

// ============================================================================
// Hooks - Realtime
// ============================================================================

export { useMessageSubscription } from "./hooks/realtime/useMessageSubscription";
export { useConversationSubscription } from "./hooks/realtime/useConversationSubscription";

// ============================================================================
// Hooks - UI
// ============================================================================

export { useMessageScroll } from "./hooks/useMessageScroll";

// ============================================================================
// Components - Shared
// ============================================================================

export { Avatar, getInitials } from "../../../components/avatar";

// ============================================================================
// Components - List
// ============================================================================

export { ChatRow } from "./components/list/chat-row";
export { ConversationList } from "./components/list/conversation-list";

// ============================================================================
// Components - Window
// ============================================================================

export { MessageBubble } from "./components/window/message-bubble";
export { MessageInput } from "./components/window/message-input";
export { MessageActionsMenu } from "./components/window/message-actions";
export { EditModeBanner } from "./components/window/edit-mode-banner";
export { DeleteConfirmDialog } from "./components/window/delete-confirm-dialog";
export { ChatWindow } from "./components/window/chat-window";

// ============================================================================
// Components - New Chat
// ============================================================================

export { UserSuggestionRow } from "./components/new-chat/user-suggestion-row";
export { UserSearchList } from "./components/new-chat/user-search-list";

// ============================================================================
// Utils
// ============================================================================

export {
  formatMessageTime,
  formatConversationTime,
  formatFullTime,
  formatMessageSessionTime,
} from "./utils/formatting/time";

export { truncateMessage } from "./utils/formatting/text";

export { getConversationDisplayInfo } from "./utils/conversation";

export { mapRealtimeMessage } from "./utils/realtimeAdapter";

export {
  shouldShowAvatar,
  shouldShowTimestamp,
  isFirstUnreadMessage,
  getMessageGroupingInfo,
} from "./utils/messageGrouping";

export type { MessageGroupingInfo } from "./utils/messageGrouping";
