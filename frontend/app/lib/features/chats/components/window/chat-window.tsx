import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { Message } from "../../types";
import { MessageBubbleSkeleton } from "@/app/components/skeleton";

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
  conversationId,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyScrolled = useRef(false);
  const previousMessageCount = useRef(0);

  // Scroll to bottom on initial load
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

  // Scroll to bottom when new messages arrive (not when loading older messages)
  useEffect(() => {
    if (
      messages.length > previousMessageCount.current &&
      hasInitiallyScrolled.current &&
      messagesEndRef.current
    ) {
      // Only auto-scroll if we're near the bottom (user hasn't scrolled up much)
      const container = messagesContainerRef.current;
      if (container) {
        const isNearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          150;
        if (isNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
    previousMessageCount.current = messages.length;
  }, [messages.length]);

  // Handle infinite scroll - load older messages when scrolling to top
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const threshold = 100;

    // Load more when near the TOP (scrolling up for older messages)
    if (scrollTop < threshold && hasNextPage && !isFetchingNextPage) {
      const previousScrollHeight = container.scrollHeight;

      fetchNextPage().then(() => {
        // Maintain scroll position after loading older messages at the top
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
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
          <div className="flex items-center justify-center h-full">
            <p className="text-grey text-center">
              No messages yet. Start the conversation!
            </p>
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
      <MessageInput
        conversationId={conversationId}
        onSendMessage={onSendMessage}
        onTyping={onTyping}
      />
    </div>
  );
}
