"use client";

import { Message } from "../../types";
import { formatFullTime, truncateMessage } from "../../utils/helpers";
import { Avatar, getInitials } from "../shared/avatar";
import { MESSAGE_PREVIEW_LENGTH } from "../../constants";

type MessageBubbleProps = {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
};

/**
 * Individual message bubble with sender info, content, and timestamp
 * Renders differently for sent vs received messages
 */
export function MessageBubble({ message, isMe, showAvatar = true }: MessageBubbleProps) {
  const sender = message.sender;
  const senderName = sender ? `${sender.firstName} ${sender.lastName}` : "User";
  const bubbleStyle = isMe
    ? "bg-crocus-yellow rounded-tr-sm"
    : "bg-melting-glacier rounded-tl-sm";

  return (
    <div className={`flex gap-2 mb-3 ${isMe ? "flex-row-reverse" : ""}`}>
      {/* Avatar or spacer for alignment */}
      {showAvatar && (
        !isMe ? (
          <Avatar
            src={sender?.avatarUrl}
            alt={sender?.username || "User"}
            fallback={getInitials(sender?.firstName, sender?.lastName)}
            size="sm"
          />
        ) : (
          <div className="w-8 h-8" />
        )
      )}

      <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
        {/* Sender name (only for received messages) */}
        {!isMe && sender && (
          <span className="text-xs text-grey mb-1 px-1">{senderName}</span>
        )}

        <div className={`px-4 py-2 rounded-2xl text-black ${bubbleStyle}`}>
          {/* Reply preview if this message is a reply */}
          {message.replyTo?.content && (
            <div className="mb-2 pb-2 border-b border-grey/20 opacity-70">
              <p className="text-xs italic">
                Replying to: {truncateMessage(message.replyTo.content, MESSAGE_PREVIEW_LENGTH)}
              </p>
            </div>
          )}

          {/* Message content */}
          <p className="text-sm wrap-break-word whitespace-pre-wrap">
            {message.content}
            {message.isEdited && <span className="text-xs opacity-60 ml-2">(edited)</span>}
          </p>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-grey mt-1 px-1">{formatFullTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
