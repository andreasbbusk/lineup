"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { MESSAGE_ACTION_CONFIG, STYLES } from "../../constants";
import { Message } from "../../types";
import { Avatar, getInitials } from "../../../../components/avatar";
import { MessageActionsMenu } from "./message-actions";
import { useReducedMotion } from "@/app/modules/hooks/useReducedMotion";
import { Reply } from "lucide-react";
import { useMessageActionsStore } from "../../stores/messageStore";

type MessageBubbleProps = {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
  allMessages?: Message[];
};

// Track messages that existed when the component first mounted
const initialMessageIds = new Set<string>();
let hasInitialized = false;

const SWIPE_THRESHOLD = 60; // pixels to trigger reply
const SWIPE_MAX = 80; // max swipe distance

export function MessageBubble({
  message,
  isMe,
  showAvatar = true,
  allMessages = [],
}: MessageBubbleProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isDeleted = message.isDeleted;
  const { startReply, activeMessageAction } = useMessageActionsStore();
  const dragX = useMotionValue(0);
  const hasTriggeredReply = useRef(false);

  // Only allow replying to received messages (not your own)
  const canReply = !isMe && !isDeleted;

  // Transform dragX to opacity values
  const replyIconOpacity = useTransform(dragX, [0, SWIPE_MAX], [0, 1], {
    clamp: true,
  });
  const avatarOpacity = useTransform(dragX, [0, SWIPE_MAX], [1, 0], {
    clamp: true,
  });

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

  // Snap back function - memoized to avoid dependency issues
  const snapBack = useCallback(() => {
    return animate(dragX, 0, {
      type: "spring",
      stiffness: 500,
      damping: 30,
    });
  }, [dragX]);

  // Reset drag position when message changes or component unmounts
  useEffect(() => {
    return () => {
      dragX.set(0);
      hasTriggeredReply.current = false;
    };
  }, [message.id, dragX]);

  // Reset drag position if reply is cancelled externally or message changes
  useEffect(() => {
    if (!activeMessageAction || activeMessageAction.messageId !== message.id) {
      const currentX = dragX.get();
      if (currentX !== 0) {
        snapBack();
      }
    }
  }, [activeMessageAction, message.id, dragX, snapBack]);

  const handlePress = () => {
    if (!isMe || isDeleted) return;
    navigator.vibrate?.(MESSAGE_ACTION_CONFIG.HAPTIC_FEEDBACK_MS);
    setIsMenuOpen(true);
  };

  const handleReply = () => {
    if (hasTriggeredReply.current) return;
    hasTriggeredReply.current = true;
    navigator.vibrate?.(MESSAGE_ACTION_CONFIG.HAPTIC_FEEDBACK_MS);
    startReply(message);
    // Smoothly animate back to original position
    snapBack();
    // Reset flag after animation completes (spring animation typically ~300ms)
    setTimeout(() => {
      hasTriggeredReply.current = false;
    }, 300);
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } }
  ) => {
    if (info.offset.x >= SWIPE_THRESHOLD && canReply) {
      handleReply();
    } else {
      snapBack();
    }
  };

  const bubbleClass = `px-4 py-2.5 rounded-2xl ${
    isDeleted
      ? STYLES.MESSAGE_BUBBLE.deleted
      : isMe
      ? STYLES.MESSAGE_BUBBLE.sent
      : STYLES.MESSAGE_BUBBLE.received
  }`;

  // Helper to truncate reply preview text
  const truncateReplyContent = (content: string | null | undefined) => {
    if (!content) return "";
    return content.length > 50 ? `${content.slice(0, 50)}...` : content;
  };

  // Get replyTo message - either from message.replyTo or find it in allMessages
  const getReplyToMessage = (): Message | null => {
    // First try to use the replyTo relation if available
    if (message.replyTo && !message.replyTo.isDeleted) {
      return message.replyTo;
    }

    // Fallback: find the message in allMessages by replyToMessageId
    if (message.replyToMessageId && allMessages.length > 0) {
      const repliedMessage = allMessages.find(
        (msg) => msg.id === message.replyToMessageId
      );
      if (repliedMessage && !repliedMessage.isDeleted) {
        return repliedMessage;
      }
    }

    return null;
  };

  const replyTo = getReplyToMessage();
  const hasReply = !!replyTo;
  const replyToIsMe = replyTo?.senderId === message.senderId;

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

  const messageContent = (
    <motion.div
      initial={shouldAnimate ? { opacity: 0, y: 10, scale: 0.95 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring" as const,
        stiffness: 500,
        damping: 30,
      }}
      drag={canReply ? "x" : false}
      dragConstraints={{ left: 0, right: SWIPE_MAX }}
      dragElastic={0.2}
      dragDirectionLock={canReply}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onDrag={(_, info) => {
        // If user drags past max, ensure we stay within bounds
        if (info.offset.x > SWIPE_MAX) {
          dragX.set(SWIPE_MAX);
        }
      }}
      style={{ x: canReply ? dragX : 0 }}
      className={`flex gap-2 ${showAvatar ? "mb-4" : "mb-1"} ${
        isMe ? "flex-row-reverse" : ""
      } ${canReply ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {!isMe && (
        <div className="relative w-8 h-8 mt-2 shrink-0">
          <AnimatePresence mode="wait">
            {canReply ? (
              <>
                <motion.div
                  key="reply-icon"
                  style={{ opacity: replyIconOpacity }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Reply size={20} className="text-dark-cyan-blue" />
                </motion.div>
                {showAvatar && (
                  <motion.div
                    key="avatar"
                    style={{ opacity: avatarOpacity }}
                    className="absolute inset-0"
                  >
                    <Avatar
                      src={message.sender?.avatarUrl}
                      alt={message.sender?.username || "User"}
                      fallback={getInitials(
                        message.sender?.firstName,
                        message.sender?.lastName
                      )}
                      size="sm"
                    />
                  </motion.div>
                )}
              </>
            ) : showAvatar ? (
              <Avatar
                key="avatar"
                src={message.sender?.avatarUrl}
                alt={message.sender?.username || "User"}
                fallback={getInitials(
                  message.sender?.firstName,
                  message.sender?.lastName
                )}
                size="sm"
              />
            ) : (
              <div key="spacer" className="w-8 h-8" />
            )}
          </AnimatePresence>
        </div>
      )}

      <div
        className={`flex flex-col max-w-[70%] ${
          isMe ? "items-end" : "items-start"
        }`}
      >
        {hasReply && replyTo && (
          <div className="relative pb-1.5 w-full">
            {/* Original message bubble (the one being replied to) */}
            <div
              className={`px-3 py-1.5 rounded-xl text-xs ${
                replyToIsMe
                  ? `${STYLES.MESSAGE_BUBBLE.sent} ml-auto max-w-[85%]`
                  : `${STYLES.MESSAGE_BUBBLE.received} max-w-full`
              } opacity-75`}
            >
              <div
                className={`text-xs font-medium mb-0.5 ${
                  replyToIsMe ? "text-white/90" : "text-dark-cyan-blue"
                }`}
              >
                {replyTo.sender?.firstName ||
                  replyTo.sender?.username ||
                  "User"}
              </div>
              <div
                className={`text-xs truncate leading-tight ${
                  replyToIsMe ? "text-white/80" : "text-black/80"
                }`}
              >
                {truncateReplyContent(replyTo.content) || "Message"}
              </div>
            </div>
          </div>
        )}
        <div className={`relative ${hasReply ? "-mt-2" : ""}`}>
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
    </motion.div>
  );

  return messageContent;
}
