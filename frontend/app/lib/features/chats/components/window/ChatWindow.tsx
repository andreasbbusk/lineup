"use client";

import { useEffect, useRef } from "react";
import { useMessageSubscription } from "../../hooks/realtime/useMessageSubscription";
import { useChatMessages } from "../../hooks/useChatMessages";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

type ChatWindowProps = {
  conversationId: string;
  currentUserId: string;
  conversationName?: string;
  onBack?: () => void;
};

export function ChatWindow({
  conversationId,
  currentUserId,
  conversationName,
  onBack,
}: ChatWindowProps) {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(conversationId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyScrolled = useRef(false);

  // Subscribe to real-time message updates
  useMessageSubscription(conversationId);

  // Scroll to bottom on initial load
  const firstPage = data?.pages[0];
  useEffect(() => {
    if (firstPage && messagesEndRef.current && !hasInitiallyScrolled.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      hasInitiallyScrolled.current = true;
    }
  }, [firstPage]);

  // Handle infinite scroll
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const threshold = 100;

    if (scrollTop < threshold && hasNextPage && !isFetchingNextPage) {
      const previousScrollHeight = container.scrollHeight;

      fetchNextPage().then(() => {
        // Maintain scroll position after loading more messages
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
          }
        });
      });
    }
  };

  // Flatten all messages from all pages
  const allMessages = data?.pages.flatMap((page) => page.messages) ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-grey">Loading messages...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">Failed to load messages</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <h2 className="text-lg font-semibold flex-1">
          {conversationName || "Chat"}
        </h2>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {/* Load more indicator */}
        {isFetchingNextPage && (
          <div className="text-center py-2">
            <span className="text-sm text-grey">
              Loading more messages...
            </span>
          </div>
        )}

        {/* Messages list (reverse chronological) */}
        {allMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-grey text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {allMessages
              .slice()
              .reverse()
              .map((message, index, array) => {
                const isMe = message.senderId === currentUserId;
                const prevMessage = array[index - 1];
                const showAvatar =
                  !prevMessage || prevMessage.senderId !== message.senderId;

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isMe={isMe}
                    showAvatar={showAvatar}
                  />
                );
              })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
