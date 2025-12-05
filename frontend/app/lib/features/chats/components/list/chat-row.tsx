import Image from "next/image";
import { Conversation } from "../../types";
import {
  formatConversationTime,
  truncateMessage,
  getConversationDisplayInfo,
} from "../../utils/helpers";

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
  const lastMessagePreview = conversation.lastMessagePreview
    ? truncateMessage(conversation.lastMessagePreview, 40)
    : "No messages yet";
  const timeDisplay = formatConversationTime(
    conversation.lastMessageAt ?? null
  );
  const hasUnread = conversation.unreadCount > 0;

  return (
    <div className="w-full">
      <button
        onClick={onClick}
        className="flex w-full items-start gap-5 py-5 hover:bg-melting-glacier transition-colors group"
      >
        {/* Avatar */}
        <div className="relative shrink-0 size-[64px]">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="size-full rounded-full bg-light-grey flex items-center justify-center">
              <span className="text-grey text-xl font-medium">
                {name?.charAt(0).toUpperCase() ?? "?"}
                {name?.split(" ")[1]?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
          )}
          {hasUnread && (
            <div className="absolute top-0 right-0 size-4 bg-crocus-yellow rounded-full border-2 border-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-left flex flex-col gap-2 justify-center min-h-[64px]">
          <h3 className="heading-3 text-black leading-none truncate tracking-wide">
            {name}
          </h3>
          <p
            className={`text-base truncate leading-none tracking-wide ${
              hasUnread
                ? "text-black font-bold italic"
                : "text-grey font-medium italic"
            }`}
          >
            {lastMessagePreview}
          </p>
        </div>

        {/* Time */}
        {timeDisplay && (
          <div className="shrink-0 text-base text-grey leading-none pt-1 font-normal">
            {timeDisplay}
          </div>
        )}
      </button>

      {/* Divider */}
      <div className="h-px w-full bg-gray-100" />
    </div>
  );
}
