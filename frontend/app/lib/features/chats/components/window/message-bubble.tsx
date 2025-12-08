"use client";

import { useState } from "react";
import { MESSAGE_ACTION_CONFIG } from "../../constants";
import { Message } from "../../types";
import { Avatar, getInitials } from "../../../../../components/avatar";
import { MessageActionsMenu } from "./message-actions";

type MessageBubbleProps = {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
};

const DELETED_MESSAGE_TEXT = "This message was deleted.";

export function MessageBubble({
  message,
  isMe,
  showAvatar = true,
}: MessageBubbleProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDeleted = message.content === DELETED_MESSAGE_TEXT;

  const handlePress = () => {
    if (!isMe || isDeleted) return;
    navigator.vibrate?.(MESSAGE_ACTION_CONFIG.HAPTIC_FEEDBACK_MS);
    setIsMenuOpen(true);
  };

  const bubbleClass = `px-4 py-2.5 rounded-2xl ${
    isMe
      ? "bg-dark-cyan-blue text-white rounded-br-none"
      : "bg-melting-glacier text-black rounded-bl-none"
  }`;

  const content = (
    <div
      onClick={handlePress}
      className={`${bubbleClass} ${
        isMe && !isDeleted
          ? "cursor-pointer select-none active:scale-95 transition-transform"
          : ""
      } ${isDeleted ? "italic text-grey border border-light-grey" : ""}`}
    >
      <p className="text-sm wrap-break-word whitespace-pre-wrap">
        {message.content}
        {message.isEdited && (
          <span className="text-xs opacity-60 ml-2">
            {MESSAGE_ACTION_CONFIG.EDITED_LABEL_TEXT}
          </span>
        )}
      </p>
    </div>
  );

  return (
    <div className={`flex gap-2 mb-4 ${isMe ? "flex-row-reverse" : ""}`}>
      {!isMe && (
        <>
          {showAvatar ? (
            <Avatar
              src={message.sender?.avatarUrl}
              alt={message.sender?.username || "User"}
              fallback={getInitials(
                message.sender?.firstName,
                message.sender?.lastName
              )}
              size="sm"
              className="mt-2"
            />
          ) : (
            <div className="w-8 h-8" />
          )}
        </>
      )}

      <div
        className={`flex flex-col max-w-[70%] ${
          isMe ? "items-end" : "items-start"
        }`}
      >
        {isDeleted || !isMe ? (
          content
        ) : (
          <MessageActionsMenu
            messageId={message.id}
            content={message.content || ""}
            isOpen={isMenuOpen}
            onOpenChange={setIsMenuOpen}
          >
            {content}
          </MessageActionsMenu>
        )}
      </div>
    </div>
  );
}
