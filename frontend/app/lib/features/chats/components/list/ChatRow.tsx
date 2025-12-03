"use client";

import Image from "next/image";
import { Conversation } from "../../types";
import {
  formatConversationTime,
  truncateMessage,
} from "../../utils/dateHelpers";

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
  // Determine display name and avatar based on conversation type
  const getDisplayInfo = () => {
    if (conversation.type === "group") {
      return {
        name: conversation.name || "Unnamed Group",
        avatarUrl: conversation.avatarUrl,
      };
    }

    // For direct messages, find the other participant
    const otherParticipant = conversation.participants?.find(
      (p) => p.userId !== currentUserId
    );

    if (otherParticipant?.user) {
      return {
        name: `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`,
        avatarUrl: otherParticipant.user.avatarUrl,
      };
    }

    return {
      name: "Unknown User",
      avatarUrl: null,
    };
  };

  const { name, avatarUrl } = getDisplayInfo();
  const lastMessagePreview = conversation.lastMessagePreview
    ? truncateMessage(conversation.lastMessagePreview, 40)
    : "No messages yet";
  const timeDisplay = formatConversationTime(
    conversation.lastMessageAt ?? null
  );
  const hasUnread = conversation.unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={48}
            height={48}
            className="rounded-full aspect-square object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 text-lg font-medium">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {hasUnread && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-crocus-yellow rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-black">
              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <h3
            className={`text-base truncate ${
              hasUnread ? "font-semibold" : "font-medium"
            }`}
          >
            {name}
          </h3>
          {timeDisplay && (
            <span className="text-xs text-grey shrink-0 ml-2">
              {timeDisplay}
            </span>
          )}
        </div>
        <p
          className={`text-sm truncate ${
            hasUnread ? "text-black font-medium" : "text-grey"
          }`}
        >
          {lastMessagePreview}
        </p>
      </div>
    </button>
  );
}
