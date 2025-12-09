import { MessageBubbleSkeleton } from "@/app/components/skeleton";
import { formatMessageSessionTime } from "../../utils/formatting/time";
import { getMessageGroupingInfo } from "../../utils/messageGrouping";
import { Message } from "../../types";
import { MessageBubble } from "./message-bubble";
import { MessageCircle } from "lucide-react";
import { ReactNode } from "react";

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
  return (
    <div className="flex justify-center my-4">
      <span className="text-xs text-grey bg-white px-3 py-1 rounded-full">
        {timestamp}
      </span>
    </div>
  );
}

export function UnreadDivider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-light-grey" />
      <span className="text-xs font-medium text-grey uppercase tracking-wide">
        Unread Messages
      </span>
      <div className="flex-1 h-px bg-light-grey" />
    </div>
  );
}

export function EmptyChatState({
  conversationName,
}: {
  conversationName?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
      <div className="w-24 h-24 rounded-full bg-melting-glacier flex items-center justify-center">
        <MessageCircle className="text-grey size-10" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-black mb-1">{conversationName}</h3>
        <p className="text-sm text-grey">
          No messages yet. Start the conversation!
        </p>
      </div>
    </div>
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
            const { showAvatar, showTimestamp, isFirstUnread } =
              getMessageGroupingInfo(
                message,
                messages[index - 1],
                messages[index + 1],
                currentUserId,
                index
              );

            return (
              <div key={message.id}>
                {showTimestamp && message.createdAt && (
                  <TimestampDivider
                    timestamp={formatMessageSessionTime(message.createdAt)}
                  />
                )}

                {isFirstUnread && <UnreadDivider />}

                <MessageBubble
                  message={message}
                  isMe={isMe}
                  showAvatar={showAvatar}
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
