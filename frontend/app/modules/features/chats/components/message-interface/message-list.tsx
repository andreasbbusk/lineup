import { motion } from "framer-motion";
import { MessageBubbleSkeleton } from "@/app/modules/components/skeleton";
import { formatMessageSessionTime } from "../../utils/formatting/time";
import { getMessageGroupingInfo } from "../../utils/messageGrouping";
import { Message } from "../../types";
import { MessageBubble } from "./message-bubble";
import { MessageCircle } from "lucide-react";
import React, { ReactNode } from "react";
import { useReducedMotion } from "@/app/modules/hooks/useReducedMotion";

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  currentUserId: string;
  conversationName?: string;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  children?: ReactNode;
};

export function TimestampDivider({ timestamp }: { timestamp: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center my-4"
    >
      <span className="text-xs text-grey bg-white px-3 py-1 rounded-full">
        {timestamp}
      </span>
    </motion.div>
  );
}

export function EmptyChatState({
  conversationName,
}: {
  conversationName?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center h-full gap-4 px-4"
    >
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="w-24 h-24 rounded-full bg-melting-glacier flex items-center justify-center"
      >
        <MessageCircle className="text-grey size-10" />
      </motion.div>
      <div className="text-center">
        <h3 className="font-semibold text-black mb-1">{conversationName}</h3>
        <p className="text-sm text-grey">
          No messages yet. Start the conversation!
        </p>
      </div>
    </motion.div>
  );
}

export function MessageList({
  messages,
  isLoading,
  isFetchingNextPage,
  currentUserId,
  conversationName,
  messagesContainerRef,
  messagesEndRef,
  onScroll,
  children,
}: MessageListProps) {
  return (
    <div
      ref={messagesContainerRef}
      onScroll={onScroll}
      className="flex-1 overflow-y-auto px-4 py-6 bg-white rounded-t-3xl no-scrollbar"
    >
      {isFetchingNextPage && (
        <div className="text-center py-2">
          <span className="text-sm text-grey">Loading messages...</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 mt-4">
          {[...Array(12)].map((_, i) => (
            <MessageBubbleSkeleton key={i} isMe={i % 2 !== 0} />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <EmptyChatState conversationName={conversationName} />
      ) : (
        <>
          {messages.map((message, index) => {
            const isMe = message.senderId === currentUserId;
            const { showAvatar, showTimestamp } = getMessageGroupingInfo(
              message,
              messages[index - 1],
              messages[index + 1],
              currentUserId,
              index
            );

            // Generate stable key that persists across temp -> server ID transition
            // Use createdAt as the stable identifier since it doesn't change
            const messageKey = message.createdAt || message.id;

            return (
              <div key={messageKey}>
                {showTimestamp && message.createdAt && (
                  <TimestampDivider
                    timestamp={formatMessageSessionTime(message.createdAt)}
                  />
                )}

                <MessageBubble
                  message={message}
                  isMe={isMe}
                  showAvatar={showAvatar}
                  allMessages={messages}
                />
              </div>
            );
          })}
          {children}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
