"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef } from "react";
import {
  ChatHeader,
  MessageList,
  MessageInput,
  TypingIndicator,
  EditModeBanner,
  DeleteConfirmDialog,
  useConversation,
  useChatMessages,
  useSendMessage,
  useMessageSubscription,
  useTypingSubscription,
  useMarkAsRead,
  useEditMessage,
  useMessageScroll,
  chatApi,
  getConversationDisplayInfo,
} from "@/app/lib/features/chats";
import { useAppStore } from "@/app/lib/stores/app-store";

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const user = useAppStore((state) => state.user);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const { data: conversation } = useConversation(id);
  const {
    messages,
    isLoading: messagesLoading,
    error: messagesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(id);

  // ============================================================================
  // Mutations & Real-time
  // ============================================================================

  const { mutate: sendMessage } = useSendMessage(id, user?.id ?? "");
  const { mutate: editMessage } = useEditMessage(id);
  const { mutate: markAsRead } = useMarkAsRead();
  useMessageSubscription(id);
  useTypingSubscription(id);

  // ============================================================================
  // Mark Messages as Read
  // ============================================================================

  // Track which messages we've marked to avoid duplicate API calls
  const markedAsReadRef = useRef(new Set<string>());

  useEffect(() => {
    if (!user?.id || messages.length === 0) return;

    // Find unread messages from other users
    const unreadMessageIds = messages
      .filter(
        (message) =>
          message.senderId !== user.id &&
          !markedAsReadRef.current.has(message.id)
      )
      .map((message) => message.id);

    if (unreadMessageIds.length > 0) {
      markAsRead(unreadMessageIds);
      unreadMessageIds.forEach((messageId) =>
        markedAsReadRef.current.add(messageId)
      );
    }
  }, [messages, user?.id, markAsRead]);

  // ============================================================================
  // Scroll & UI
  // ============================================================================

  const { messagesEndRef, messagesContainerRef, handleScroll } =
    useMessageScroll(
      messages.length,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage
    );

  // ============================================================================
  // Derived State & Handlers
  // ============================================================================

  const { name, avatarUrl } = conversation
    ? getConversationDisplayInfo(conversation, user?.id ?? "")
    : { name: "Chat", avatarUrl: null };

  const handleTyping = (isTyping: boolean) => {
    chatApi.setTyping(id, isTyping);
  };

  const handleMenuAction = (action: string) => {
    switch (action) {
      case "groupInfo":
        // TODO: Open GroupInfoModal
        console.log("Opening group info modal...");
        break;
      case "leaveGroup":
        // TODO: Call leave group API
        console.log("Leaving group...");
        break;
      case "profile":
        // TODO: Navigate to user profile
        console.log("Navigating to profile...");
        break;
      case "block":
        // TODO: Block user
        console.log("Blocking user...");
        break;
      case "report":
        // TODO: Report user
        console.log("Reporting user...");
        break;
    }
  };

  // ============================================================================
  // Error State
  // ============================================================================

  if (messagesError) {
    return (
      <main className="h-dvh bg-dark-cyan-blue">
        <div className="flex flex-col h-full bg-white">
          <div className="flex-1 flex items-center justify-center flex-col gap-4">
            <div className="text-red-500">Failed to load messages</div>
            <Link className="text-black underline" href="/chats">
              Go to chats
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-dvh bg-dark-cyan-blue">
      <div className="h-full flex flex-col relative">
        <ChatHeader
          conversationName={name}
          conversationAvatar={avatarUrl}
          conversation={conversation}
          currentUserId={user?.id}
          onBack={() => router.push("/chats")}
          onMenuAction={handleMenuAction}
        />

        <MessageList
          messages={messages}
          isLoading={messagesLoading}
          isFetchingNextPage={isFetchingNextPage}
          currentUserId={user?.id ?? ""}
          conversationName={name}
          messagesContainerRef={messagesContainerRef}
          messagesEndRef={messagesEndRef}
          onScroll={handleScroll}
        >
          {conversation && (
            <TypingIndicator
              conversationId={id}
              currentUserId={user?.id ?? ""}
              participants={conversation.participants ?? []}
            />
          )}
        </MessageList>

        <div className="bg-white">
          <EditModeBanner />
          <MessageInput
            onSendMessage={sendMessage}
            onEditMessage={(messageId, content) =>
              editMessage({ messageId, content })
            }
            onTyping={handleTyping}
          />
        </div>

        <DeleteConfirmDialog conversationId={id} />
      </div>
    </main>
  );
}
