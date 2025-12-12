"use client";

import { useState } from "react";
import { MESSAGE_ACTION_CONFIG, MESSAGE_STATES, STYLES } from "../../constants";
import { Message } from "../../types";
import { Avatar, getInitials } from "../../../../components/avatar";
import { MessageActionsMenu } from "./message-actions";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDeleted = message.content === MESSAGE_STATES.DELETED_TEXT;

  const handlePress = () => {
    if (!isMe || isDeleted) return;
    navigator.vibrate?.(MESSAGE_ACTION_CONFIG.HAPTIC_FEEDBACK_MS);
    setIsMenuOpen(true);
  };

  const bubbleClass = `px-4 py-2.5 rounded-2xl ${
    isDeleted
      ? STYLES.MESSAGE_BUBBLE.deleted
      : isMe
      ? STYLES.MESSAGE_BUBBLE.sent
      : STYLES.MESSAGE_BUBBLE.received
  }`;

  const content = (
    <div
      onClick={handlePress}
      className={`${bubbleClass} ${
        isMe && !isDeleted
          ? "cursor-pointer select-none active:scale-95 transition-transform"
          : ""
      }`}
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
