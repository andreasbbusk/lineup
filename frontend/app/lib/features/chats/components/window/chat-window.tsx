import { MessageBubbleSkeleton } from "@/app/components/skeleton";
import { useEffect, useRef } from "react";
import { Message } from "../../types";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";

type ChatWindowProps = {
  conversationId: string;
  currentUserId: string;
  conversationName?: string;
  messages: Message[];
  isLoading: boolean;
  error: unknown;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onSendMessage: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  onBack?: () => void;
};

export function ChatWindow({
  currentUserId,
  conversationName,
  messages,
  isLoading,
  error,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  onSendMessage,
  onTyping,
  onBack,
}: ChatWindowProps) {
  // ============================================================================
  // Scroll Management
  // ============================================================================

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyScrolled = useRef(false);
  const previousMessageCount = useRef(0);

  // Constants for scroll behavior
  const AUTO_SCROLL_THRESHOLD_PX = 150; // User must be within this distance from bottom for auto-scroll
  const LOAD_MORE_THRESHOLD_PX = 100; // Trigger pagination when within this distance from top

  // Initial scroll: Jump to bottom on first load
  useEffect(() => {
    if (
      messages.length > 0 &&
      messagesEndRef.current &&
      !hasInitiallyScrolled.current
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      hasInitiallyScrolled.current = true;
    }
  }, [messages.length]);

  // Auto-scroll on new messages: Only if user is near bottom (prevents disrupting scroll position)
  useEffect(() => {
    const hasNewMessages = messages.length > previousMessageCount.current;
    const shouldAutoScroll =
      hasInitiallyScrolled.current && messagesEndRef.current;

    if (hasNewMessages && shouldAutoScroll) {
      const container = messagesContainerRef.current;
      if (container) {
        const distanceFromBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight;

        const isNearBottom = distanceFromBottom < AUTO_SCROLL_THRESHOLD_PX;
        if (isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }

    previousMessageCount.current = messages.length;
  }, [messages.length]);

  // Infinite scroll: Load older messages when scrolling near top
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearTop = container.scrollTop < LOAD_MORE_THRESHOLD_PX;
    const canLoadMore = hasNextPage && !isFetchingNextPage;

    if (isNearTop && canLoadMore) {
      const previousScrollHeight = container.scrollHeight;

      fetchNextPage().then(() => {
        // Preserve scroll position after prepending older messages
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            const scrollDifference = newScrollHeight - previousScrollHeight;
            container.scrollTop = scrollDifference;
          }
        });
      });
    }
  };

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
      <div className="flex items-center gap-3 px-4 py-3 border-b border-light-grey">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-melting-glacier rounded-full transition-colors"
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
            <span className="text-sm text-grey">Loading more messages...</span>
          </div>
        )}

        {/* Messages list - oldest at top, newest at bottom */}
        {isLoading ? (
          <div className="space-y-4 mt-4">
            {[...Array(4)].map((_, i) => (
              <MessageBubbleSkeleton key={i} isMe={i % 2 !== 0} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
            <div className="w-24 h-24 rounded-full bg-melting-glacier flex items-center justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-grey"
              >
                <path
                  d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.3635 14.8911 4.00638 16.1272L3 21L7.87281 19.9936C9.10891 20.6365 10.5124 21 12 21Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-black mb-1">
                {conversationName}
              </h3>
              <p className="text-sm text-grey">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isMe = message.senderId === currentUserId;
              const prevMessage = messages[index - 1];
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
      <MessageInput onSendMessage={onSendMessage} onTyping={onTyping} />
    </div>
  );
}
