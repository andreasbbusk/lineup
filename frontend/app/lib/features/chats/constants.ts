/**
 * Shared constants for the chats feature
 */

// ============================================================================
// UI Display
// ============================================================================

/** Maximum characters shown in message preview within a conversation row */
export const MESSAGE_PREVIEW_LENGTH = 50;

/** Maximum characters shown in conversation name/preview */
export const CONVERSATION_PREVIEW_LENGTH = 40;

/** Milliseconds before typing indicator automatically stops */
export const TYPING_INDICATOR_TIMEOUT_MS = 2000;

/** Number of skeleton loaders shown during initial load */
export const DEFAULT_SKELETON_COUNT = 5;

// ============================================================================
// Data Fetching
// ============================================================================

/** Number of messages fetched per pagination request */
export const DEFAULT_MESSAGES_PAGE_SIZE = 50;

/** How long cached data remains fresh before refetching (in milliseconds) */
export const STALE_TIME = {
  CONVERSATIONS: 60_000, // 1 minute
  MESSAGES: 60_000, // 1 minute
  CONNECTIONS: 300_000, // 5 minutes
  USER_SEARCH: 30_000, // 30 seconds
} as const;


export const MESSAGE_ACTION_CONFIG = {
  HAPTIC_FEEDBACK_MS: 50,
  EDITED_LABEL_TEXT: "(edited)",
  TOAST_DURATION_MS: 3000,
} as const;
