/**
 * Message grouping utilities for chat UI display logic.
 * Determines when to show avatars, timestamps, and unread dividers based on
 * message sequence, time gaps, and read status.
 */

import { Message } from "../types";

type MessageGroupingConfig = {
  timestampGapMs?: number;
};

export type MessageGroupingInfo = {
  showAvatar: boolean;
  showTimestamp: boolean;
  isFirstUnread: boolean;
};

const DEFAULT_TIMESTAMP_GAP_MS = 5 * 60 * 1000;

// Show avatar at the last message in a group from the same sender
export function shouldShowAvatar(
  message: Message,
  nextMessage: Message | undefined
): boolean {
  return !nextMessage || nextMessage.senderId !== message.senderId;
}

// Show timestamp when different day or time gap exceeds threshold
export function shouldShowTimestamp(
  message: Message,
  prevMessage: Message | undefined,
  config: MessageGroupingConfig = {}
): boolean {
  const { timestampGapMs = DEFAULT_TIMESTAMP_GAP_MS } = config;

  if (!prevMessage || !prevMessage.createdAt || !message.createdAt) {
    return true;
  }

  const prevDate = new Date(prevMessage.createdAt);
  const currentDate = new Date(message.createdAt);

  const isDifferentDay =
    prevDate.getDate() !== currentDate.getDate() ||
    prevDate.getMonth() !== currentDate.getMonth() ||
    prevDate.getFullYear() !== currentDate.getFullYear();

  if (isDifferentDay) return true;

  const timeDiff = currentDate.getTime() - prevDate.getTime();
  return timeDiff >= timestampGapMs;
}

// Show unread divider at first unread message
export function isFirstUnreadMessage(
  message: Message,
  prevMessage: Message | undefined,
  currentUserId: string,
  messageIndex: number
): boolean {
  const isMe = message.senderId === currentUserId;
  if (isMe) return false;

  const isCurrentUnread =
    message.readReceipts &&
    !message.readReceipts.some((receipt) => receipt.userId === currentUserId);

  if (!isCurrentUnread) return false;

  const wasPreviousRead =
    messageIndex === 0 ||
    (prevMessage?.readReceipts?.some(
      (receipt) => receipt.userId === currentUserId
    ) ?? false);

  return wasPreviousRead;
}

export function getMessageGroupingInfo(
  message: Message,
  prevMessage: Message | undefined,
  nextMessage: Message | undefined,
  currentUserId: string,
  messageIndex: number,
  config: MessageGroupingConfig = {}
): MessageGroupingInfo {
  return {
    showAvatar: shouldShowAvatar(message, nextMessage),
    showTimestamp: shouldShowTimestamp(message, prevMessage, config),
    isFirstUnread: isFirstUnreadMessage(
      message,
      prevMessage,
      currentUserId,
      messageIndex
    ),
  };
}
