"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useRef } from "react";
import {
  ChatWindow,
  useConversation,
  useChatMessages,
  useSendMessage,
  useMessageSubscription,
  useMarkAsRead,
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
  const { messages, isLoading: messagesLoading, error: messagesError, fetchNextPage, hasNextPage, isFetchingNextPage } = useChatMessages(id);

  // ============================================================================
  // Mutations & Real-time
  // ============================================================================

  const { mutate: sendMessage } = useSendMessage(id, user?.id ?? "");
  const { mutate: markAsRead } = useMarkAsRead();
  useMessageSubscription(id);

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
  // Derived State & Handlers
  // ============================================================================

  const { name, avatarUrl } = conversation
    ? getConversationDisplayInfo(conversation, user?.id ?? "")
    : { name: "Chat", avatarUrl: null };

  const handleTyping = (isTyping: boolean) => {
    chatApi.setTyping(id, isTyping);
  };

  return (
    <main className="h-dvh bg-dark-cyan-blue">
      <div className="h-full flex flex-col">
        <ChatWindow
          currentUserId={user?.id ?? ""}
          conversationName={name}
          conversationAvatar={avatarUrl}
          messages={messages}
          isLoading={messagesLoading}
          error={messagesError}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onSendMessage={sendMessage}
          onTyping={handleTyping}
          onBack={() => router.push("/chats")}
        />
      </div>
    </main>
  );
}
