"use client";

import { Message } from "../../types";
import { formatFullTime } from "../../utils/helpers";
import Image from "next/image";

type MessageBubbleProps = {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
};

export function MessageBubble({
  message,
  isMe,
  showAvatar = true,
}: MessageBubbleProps) {
  const timeDisplay = formatFullTime(message.createdAt);

  return (
    <div
      className={`flex gap-2 mb-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="shrink-0">
          {!isMe && message.sender?.avatarUrl ? (
            <Image
              src={message.sender.avatarUrl}
              alt={message.sender.username}
              width={32}
              height={32}
              className="rounded-full aspect-square object-cover"
            />
          ) : !isMe ? (
            <div className="w-8 h-8 rounded-full bg-light-grey flex items-center justify-center">
              <span className="text-grey text-xs font-medium">
                {message.sender?.firstName?.charAt(0).toUpperCase() ?? "?"}
                {message.sender?.lastName?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={`flex flex-col max-w-[70%] ${
          isMe ? "items-end" : "items-start"
        }`}
      >
        {/* Sender name (only for group chats and not own messages) */}
        {!isMe && message.sender && (
          <span className="text-xs text-grey mb-1 px-1">
            {message.sender.firstName} {message.sender.lastName}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isMe
              ? "bg-crocus-yellow text-black rounded-tr-sm"
              : "bg-melting-glacier text-black rounded-tl-sm"
          }`}
        >
          {/* Reply indicator */}
          {message.replyTo && message.replyTo.content && (
            <div className="mb-2 pb-2 border-b border-grey/20 opacity-70">
              <p className="text-xs italic">
                Replying to: {message.replyTo.content.substring(0, 50)}
                {message.replyTo.content.length > 50 ? "..." : ""}
              </p>
            </div>
          )}

          {/* Message content */}
          <p className="text-sm wrap-break-word whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Edited indicator */}
          {message.isEdited && (
            <span className="text-xs opacity-60 ml-2">(edited)</span>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-grey mt-1 px-1">{timeDisplay}</span>
      </div>
    </div>
  );
}
