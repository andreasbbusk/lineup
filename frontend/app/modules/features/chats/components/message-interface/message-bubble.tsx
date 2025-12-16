"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MESSAGE_ACTION_CONFIG, STYLES } from "../../constants";
import { Message } from "../../types";
import { Avatar, getInitials } from "../../../../components/avatar";
import { MessageActionsMenu } from "./message-actions";
import { useReducedMotion } from "@/app/modules/hooks/useReducedMotion";

type MessageBubbleProps = {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
};

// Track messages that existed when the component first mounted
const initialMessageIds = new Set<string>();
let hasInitialized = false;

export function MessageBubble({
  message,
  isMe,
  showAvatar = true,
}: MessageBubbleProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isDeleted = message.isDeleted;

  // On first render of MessageBubble component, mark existing messages
  useEffect(() => {
    if (!hasInitialized) {
      hasInitialized = true;
    }
  }, []);

  // Determine if this message should animate
  const isNewMessage =
    message.id.startsWith("temp-") || // Optimistic message
    !initialMessageIds.has(message.id); // New message not in initial set

  const shouldAnimate = isNewMessage && !prefersReducedMotion;

  // After animation, add to the set so it won't animate again
  useEffect(() => {
    if (message.id && !message.id.startsWith("temp-")) {
      initialMessageIds.add(message.id);
    }
  }, [message.id]);

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
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 10, scale: 0.95 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring" as const,
        stiffness: 500,
        damping: 30,
      }}
      className={`flex gap-2 mb-4 ${isMe ? "flex-row-reverse" : ""}`}
    >
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
    </motion.div>
  );
}
