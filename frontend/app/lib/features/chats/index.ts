// lib/features/chats/index.ts

// Types
export type {
  Conversation,
  Message,
  UIMessage,
  Participant,
  GroupedConversations,
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
} from "./utils/dateHelpers";
export { mapRealtimeMessage, mapApiMessage } from "./utils/realtimeAdapter";
