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
  UpdateConversationDto,
  AddParticipantsDto,
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
  MESSAGE_ACTION_CONFIG,
  MESSAGE_STATES,
  SCROLL_CONFIG,
  MESSAGE_GROUPING,
  STYLES,
} from "./constants";

// ============================================================================
// API & Keys
// ============================================================================

export { chatApi } from "./api";
export { chatKeys } from "./queryKeys";

// ============================================================================
// Hooks - Query & Mutations
// ============================================================================

export { useChatMessages } from "./hooks/query/messages";
export { useConnectedUsers } from "@/app/modules/hooks/queries";
export {
  useConversation,
  useConversations,
  useUnreadCount,
} from "./hooks/query/conversations";
export { useSendMessage } from "./hooks/query/messageMutations";
export {
  useEditMessage,
  useDeleteMessage,
} from "./hooks/query/messageMutations";
export {
  useMarkAsRead,
  useCreateConversation,
  useLeaveConversation,
  useUpdateConversation,
  useAddParticipants,
  useRemoveParticipant,
} from "./hooks/query/conversationMutations";

// ============================================================================
// Hooks - Realtime
// ============================================================================

export { useMessageSubscription } from "./hooks/realtime/useMessageSubscription";
export { useConversationSubscription } from "./hooks/realtime/useConversationSubscription";
export { useTypingSubscription } from "./hooks/realtime/useTypingSubscription";
export { useTypingStore } from "./stores/typingStore";
export { useMessageActionsStore } from "./stores/messageStore";

// ============================================================================
// Hooks - UI
// ============================================================================

export { useMessageScroll } from "./hooks/useMessageScroll";

// ============================================================================
// Components - List
// ============================================================================

export { ChatRow } from "./components/chats-interface/chat-row";
export { ConversationList } from "./components/chats-interface/conversation-list";

// ============================================================================
// Components - Window
// ============================================================================

export { ChatHeader } from "./components/message-interface/chat-header";
export { MessageList } from "./components/message-interface/message-list";
export { MessageBubble } from "./components/message-interface/message-bubble";
export { MessageInput } from "./components/message-interface/message-input";
export { TypingIndicator } from "./components/message-interface/typing-indicator";
export { MessageActionsMenu } from "./components/message-interface/message-actions";
export { EditModeBanner } from "./components/message-interface/edit-mode-banner";

// ============================================================================
// Components - New Chat
// ============================================================================

export { UserSuggestionRow } from "./components/new-interface/user-suggestion-row";
export { UserSearchList } from "./components/new-interface/user-search-list";

// ============================================================================
// Components - Settings
// ============================================================================

export { GroupInfoSection } from "./components/settings-interface/group-info-section";
export { MembersSection } from "./components/settings-interface/members-section";
export { AddMembersSection } from "./components/settings-interface/add-members-section";
export { ConfirmationDialog } from "./components/confirmation-dialog";

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
