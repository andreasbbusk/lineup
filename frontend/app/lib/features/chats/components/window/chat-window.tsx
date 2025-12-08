import { MessageBubbleSkeleton } from "@/app/components/skeleton";
import Link from "next/link";
import { useMessageScroll } from "../../hooks/useMessageScroll";
import { formatMessageSessionTime } from "../../utils/formatting/time";
import { getMessageGroupingInfo } from "../../utils/messageGrouping";
import { Avatar, getInitials } from "../shared/avatar";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { Message } from "../../types";
import {
  EllipsisVertical,
  MessageCircle,
  UserCircle,
  Ban,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/radix-popover";

type ChatWindowProps = {
  currentUserId: string;
  conversationName?: string;
  conversationAvatar?: string | null;
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
  conversationAvatar,
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

  const { messagesEndRef, messagesContainerRef, handleScroll } =
    useMessageScroll(
      messages.length,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage
    );

  if (error) {
    // TODO: Create a custom error component for failed fetch
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <div className="text-red-500">Failed to load messages</div>
          <Link className="text-black underline" href="/chats">Go to chats</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-8 bg-dark-cyan-blue">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="text-white" />
          </button>
        )}
        <Avatar
          src={conversationAvatar}
          alt={conversationName || "Chat"}
          fallback={getInitials(
            conversationName?.split(" ")[0],
            conversationName?.split(" ")[1]
          )}
          size="lg"
          className="border border-white rounded-full"
        />
        <h2 className="text-lg font-semibold flex-1 text-white">
          {conversationName || "Chat"}
        </h2>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors">
              <EllipsisVertical className="text-white" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" sideOffset={8}>
            <ul className="flex flex-col gap-2.5">
              <li className="flex gap-3 cursor-pointer hover:opacity-80 transition-opacity items-center">
                <UserCircle className="size-4" />
                <p>Go to profile</p>
              </li>
              <div className="w-full h-px bg-white opacity-50" />
              <li className="flex gap-3 cursor-pointer hover:opacity-80 transition-opacity items-center">
                <Ban className="size-4" />
                <p>Block user</p>
              </li>
              <div className="w-full h-px bg-white opacity-50" />
              <li className="flex gap-3 cursor-pointer hover:opacity-80 transition-opacity items-center">
                <AlertCircle className="size-4" />
                <p>Report user</p>
              </li>
            </ul>
          </PopoverContent>
        </Popover>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 bg-white rounded-t-3xl no-scrollbar"
      >
        {/* Load more indicator */}
        {isFetchingNextPage && (
          <div className="text-center py-2">
            <span className="text-sm text-grey">Loading messages...</span>
          </div>
        )}

        {/* Messages list - oldest at top, newest at bottom */}
        {isLoading ? (
          <div className="space-y-4 mt-4">
            {[...Array(12)].map((_, i) => (
              <MessageBubbleSkeleton key={i} isMe={i % 2 !== 0} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
            <div className="w-24 h-24 rounded-full bg-melting-glacier flex items-center justify-center">
              <MessageCircle className="text-grey size-10" />
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
              const nextMessage = messages[index + 1];

              // Get message grouping info using extracted utility
              const { showAvatar, showTimestamp, isFirstUnread } =
                getMessageGroupingInfo(
                  message,
                  prevMessage,
                  nextMessage,
                  currentUserId,
                  index
                );

              return (
                <div key={message.id}>
                  {/* Timestamp divider */}
                  {showTimestamp && message.createdAt && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-grey bg-white px-3 py-1 rounded-full">
                        {formatMessageSessionTime(message.createdAt)}
                      </span>
                    </div>
                  )}

                  {/* Unread messages divider */}
                  {isFirstUnread && (
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-light-grey" />
                      <span className="text-xs font-medium text-grey uppercase tracking-wide">
                        Unread Messages
                      </span>
                      <div className="flex-1 h-px bg-light-grey" />
                    </div>
                  )}

                  <MessageBubble
                    message={message}
                    isMe={isMe}
                    showAvatar={showAvatar}
                  />
                </div>
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
