import { Conversation } from "../types";

// ============================================================================
// Time Formatting Constants
// ============================================================================

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

const DATE_PAD_LENGTH = 2;
const DATE_PAD_CHAR = "0";
const TWO_DIGIT_YEAR_START = -2;

// ============================================================================
// Time Formatting Helpers
// ============================================================================

/**
 * Formats a date as relative time (if recent) or absolute date (if older)
 * @param isShort - Whether to use compact format (e.g., "5m" vs "5m ago")
 */
const formatTime = (date: Date, diffMs: number, isShort: boolean) => {
  const minutes = Math.floor(diffMs / MS_PER_MINUTE);
  const hours = Math.floor(diffMs / MS_PER_HOUR);
  const days = Math.floor(diffMs / MS_PER_DAY);

  // Recent times: show relative
  if (minutes < 1) return isShort ? "Now" : "Just now";
  if (minutes < MINUTES_PER_HOUR)
    return isShort ? `${minutes}m` : `${minutes}m ago`;
  if (hours < HOURS_PER_DAY) return isShort ? `${hours}h` : `${hours}h ago`;
  if (days === 1) return "Yesterday";

  // Older times: show absolute date
  const month = String(date.getMonth() + 1).padStart(
    DATE_PAD_LENGTH,
    DATE_PAD_CHAR
  );
  const day = String(date.getDate()).padStart(DATE_PAD_LENGTH, DATE_PAD_CHAR);
  const year = String(date.getFullYear()).slice(TWO_DIGIT_YEAR_START);

  return isShort ? `${month}/${day}` : `${month}/${day}/${year}`;
};

/** Format timestamp for message detail view (full relative time) */
export const formatMessageTime = (timestamp: string | null) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return formatTime(date, Date.now() - date.getTime(), false);
};

/** Format timestamp for conversation list (compact time) */
export const formatConversationTime = (timestamp: string | null) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return formatTime(date, Date.now() - date.getTime(), true);
};

/** Format timestamp as 24-hour clock time (e.g., "14:30") */
export const formatFullTime = (timestamp: string | null) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);

  const hours = String(date.getHours()).padStart(
    DATE_PAD_LENGTH,
    DATE_PAD_CHAR
  );
  const minutes = String(date.getMinutes()).padStart(
    DATE_PAD_LENGTH,
    DATE_PAD_CHAR
  );

  return `${hours}:${minutes}`;
};

// ============================================================================
// Text Helpers
// ============================================================================

const TRUNCATION_SUFFIX = "...";

/** Truncate text to maximum length with ellipsis */
export const truncateMessage = (content: string, maxLength: number) =>
  content.length <= maxLength
    ? content
    : `${content.substring(0, maxLength)}${TRUNCATION_SUFFIX}`;

// ============================================================================
// Conversation Helpers
// ============================================================================

const DEFAULT_GROUP_NAME = "Group Chat";
const DEFAULT_CONVERSATION_NAME = "Chat";

/**
 * Get display name and avatar for a conversation
 * - Group chats: use conversation name/avatar
 * - Direct messages: use other participant's name/avatar
 */
export const getConversationDisplayInfo = (
  conversation: Conversation,
  userId: string
) => {
  if (conversation.type === "group") {
    return {
      name: conversation.name || DEFAULT_GROUP_NAME,
      avatarUrl: conversation.avatarUrl,
    };
  }

  const otherUser = conversation.participants?.find(
    (participant) => participant.userId !== userId
  )?.user;

  if (!otherUser) {
    return { name: DEFAULT_CONVERSATION_NAME, avatarUrl: null };
  }

  return {
    name: `${otherUser.firstName} ${otherUser.lastName}`,
    avatarUrl: otherUser.avatarUrl,
  };
};
