"use client";

import { Conversation } from "../../types";
import { formatConversationTime } from "../../utils/formatting/time";
import { truncateMessage } from "../../utils/formatting/text";
import { getConversationDisplayInfo } from "../../utils/conversation";
import { Avatar, getInitials } from "../../../../components/avatar";
import { CONVERSATION_PREVIEW_LENGTH } from "../../constants";

type ChatRowProps = {
  conversation: Conversation;
  currentUserId: string;
  onClick: () => void;
};

export function ChatRow({
  conversation,
  currentUserId,
  onClick,
}: ChatRowProps) {
  const { name, avatarUrl } = getConversationDisplayInfo(
    conversation,
    currentUserId
  );

  const isSentByMe = conversation.creator?.id === currentUserId;

  const hasUnread = conversation.unreadCount > 0;

  const otherUser = conversation.participants?.find(
    (p) => p.userId !== currentUserId
  )?.user;

  const previewText = conversation.lastMessagePreview
    ? (isSentByMe ? "You: " : "") +
      truncateMessage(
        conversation.lastMessagePreview,
        CONVERSATION_PREVIEW_LENGTH
      )
    : conversation.type === "direct"
    ? "No messages yet"
    : "Group created";

  const previewStyle = hasUnread
    ? "text-black font-medium italic"
    : isSentByMe
    ? "text-grey font-normal"
    : "text-grey font-medium italic";

  return (
    <>
      <button
        onClick={onClick}
        className="flex w-full items-center gap-4 px-6 py-4 hover:bg-melting-glacier transition-colors"
      >
        <Avatar
          src={avatarUrl}
          alt={name}
          fallback={getInitials(otherUser?.firstName, otherUser?.lastName)}
          size="lg"
          showUnreadIndicator={hasUnread}
        />
        <div className="flex-1 min-w-0 text-left flex flex-col gap-1.5">
          <h3 className="heading-3 text-black leading-tight truncate tracking-wide">
            {name}
          </h3>
          <p
            className={`text-base truncate leading-tight tracking-wide ${previewStyle}`}
          >
            {previewText}
          </p>
        </div>
        <div className="shrink-0 text-sm text-grey leading-none font-normal">
          {formatConversationTime(conversation.lastMessageAt ?? null)}
        </div>
      </button>
      <div className="h-px mx-6 bg-light-grey" />
    </>
  );
}
