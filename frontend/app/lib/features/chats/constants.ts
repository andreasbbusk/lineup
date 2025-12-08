export const MESSAGE_PREVIEW_LENGTH = 50;
export const CONVERSATION_PREVIEW_LENGTH = 40;
export const TYPING_INDICATOR_TIMEOUT_MS = 2000;
export const DEFAULT_SKELETON_COUNT = 5;
export const DEFAULT_MESSAGES_PAGE_SIZE = 50;

export const STALE_TIME = {
  CONVERSATIONS: 60_000,
  MESSAGES: 60_000,
  CONNECTIONS: 300_000,
  USER_SEARCH: 30_000,
} as const;

export const MESSAGE_ACTION_CONFIG = {
  HAPTIC_FEEDBACK_MS: 50,
  EDITED_LABEL_TEXT: "(edited)",
  TOAST_DURATION_MS: 3000,
} as const;

export const MESSAGE_STATES = {
  DELETED_TEXT: "This message was deleted.",
  EMPTY_CHAT_TEXT: "No messages yet. Start the conversation!",
  NO_DIRECT_CHATS: "No direct chats yet",
  NO_GROUP_CHATS: "No group chats yet",
} as const;

export const SCROLL_CONFIG = {
  AUTO_SCROLL_THRESHOLD: 150,
  LOAD_MORE_THRESHOLD: 100,
} as const;

export const MESSAGE_GROUPING = {
  TIMESTAMP_GAP_MS: 5 * 60 * 1000,
} as const;

export const STYLES = {
  MESSAGE_BUBBLE: {
    sent: "bg-dark-cyan-blue text-white rounded-br-none",
    received: "bg-melting-glacier text-black rounded-bl-none",
    deleted: "italic text-grey border border-light-grey",
  },
} as const;