"use client";

import { Message } from "../../types";
import { truncateMessage } from "../../utils/formatting/text";
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
export function MessageBubble({
  message,
  isMe,
  showAvatar = true
}: MessageBubbleProps) {
  const sender = message.sender;
  const bubbleStyle = isMe
    ? "bg-dark-cyan-blue text-white rounded-br-none"
    : "bg-melting-glacier text-black rounded-bl-none";

  return (
    <div className={`flex gap-2 mb-1 ${isMe ? "flex-row-reverse" : ""}`}>
      {/* Avatar only for other users */}
      {showAvatar && !isMe ? (
        <Avatar
          src={sender?.avatarUrl}
          alt={sender?.username || "User"}
          fallback={getInitials(sender?.firstName, sender?.lastName)}
          size="sm"
        />
      ) : (
        !isMe && <div className="w-8 h-8" />
      )}

      <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-2.5 rounded-2xl ${bubbleStyle}`}>
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
      </div>
    </div>
  );
}
