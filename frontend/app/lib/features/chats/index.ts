// lib/features/chats/index.ts

// Types
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

// API
export { chatApi } from "./api";
export { chatKeys } from "./queryKeys";

// Hooks
export {
  useConversations,
  useConversation,
  useUnreadCount,
  useChatMessages,
  useSendMessage,
  useDeleteMessage,
  useMarkAsRead,
  useMessageSubscription,
  useConversationSubscription,
} from "./hooks";

// Components
export {
  ChatRow,
  ConversationList,
  MessageBubble,
  MessageInput,
  ChatWindow,
} from "./components";

// Utils
export {
  formatMessageTime,
  formatConversationTime,
  formatFullTime,
  truncateMessage,
  getConversationDisplayInfo,
} from "./utils/helpers";

export { mapRealtimeMessage } from "./utils/realtimeAdapter";
