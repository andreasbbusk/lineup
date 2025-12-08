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

export function shouldShowAvatar(
  message: Message,
  nextMessage: Message | undefined
): boolean {
  return !nextMessage || nextMessage.senderId !== message.senderId;
}

export function shouldShowTimestamp(
  message: Message,
  prevMessage: Message | undefined,
  config: MessageGroupingConfig = {}
): boolean {
  const { timestampGapMs = DEFAULT_TIMESTAMP_GAP_MS } = config;

  if (!prevMessage?.createdAt || !message.createdAt) return true;

  const prevDate = new Date(prevMessage.createdAt);
  const currentDate = new Date(message.createdAt);

  const isDifferentDay =
    prevDate.getDate() !== currentDate.getDate() ||
    prevDate.getMonth() !== currentDate.getMonth() ||
    prevDate.getFullYear() !== currentDate.getFullYear();

  return (
    isDifferentDay ||
    currentDate.getTime() - prevDate.getTime() >= timestampGapMs
  );
}

export function isFirstUnreadMessage(
  message: Message,
  prevMessage: Message | undefined,
  currentUserId: string,
  messageIndex: number
): boolean {
  if (message.senderId === currentUserId) return false;

  const isCurrentUnread =
    message.readReceipts &&
    !message.readReceipts.some((receipt) => receipt.userId === currentUserId);

  if (!isCurrentUnread) return false;

  return (
    messageIndex === 0 ||
    (prevMessage?.readReceipts?.some(
      (receipt) => receipt.userId === currentUserId
    ) ??
      false)
  );
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
