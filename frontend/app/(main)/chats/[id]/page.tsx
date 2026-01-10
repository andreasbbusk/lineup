"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ChatHeader,
  MessageList,
  MessageInput,
  TypingIndicator,
  EditModeBanner,
  ConfirmationDialog,
  useConversation,
  useChatMessages,
  useSendMessage,
  useMessageSubscription,
  useTypingSubscription,
  useMarkAsRead,
  useEditMessage,
  useMessageScroll,
  useLeaveConversation,
  useDeleteMessage,
  useMessageActionsStore,
  chatApi,
  getConversationDisplayInfo,
} from "@/app/modules/features/chats";
import { useBlockUser } from "@/app/modules/hooks/mutations";
import { useAppStore } from "@/app/modules/stores/Store";
import { PageTransition } from "@/app/modules/components/page-transition";

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
  const { mutate: deleteMessage, isPending: isDeletingMessage } =
    useDeleteMessage(id);
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: leaveConversation, isPending: isLeavingConversation } =
    useLeaveConversation();
  const { mutate: blockUser, isPending: isBlockingUser } = useBlockUser();

  useMessageSubscription(id);
  useTypingSubscription(id);

  const { activeMessageAction, clearAction } = useMessageActionsStore();

  // ============================================================================
  // Block User State
  // ============================================================================

  const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);

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

  const { name, avatarUrl, otherUser } = conversation
    ? getConversationDisplayInfo(conversation, user?.id ?? "")
    : { name: "Chat", avatarUrl: null, otherUser: null };

  const handleTyping = (isTyping: boolean) => {
    chatApi.setTyping(id, isTyping);
  };

  const handleLeaveGroup = () => {
    if (isLeavingConversation) return;

    leaveConversation(id, {
      onSuccess: () => {
        router.push("/chats?tab=groups");
      },
    });
  };

  const handleDeleteMessage = () => {
    if (activeMessageAction?.messageId) {
      deleteMessage(activeMessageAction.messageId);
    }
  };

  const handleConfirmBlock = () => {
    if (!otherUser?.id) {
      setShowBlockConfirmation(false);
      return;
    }

    blockUser(otherUser.id, {
      onSuccess: () => {
        setShowBlockConfirmation(false);
        router.push("/chats");
      },
    });
  };

  const handleMenuAction = (action: string) => {
    switch (action) {
      case "groupInfo":
        router.push(`/chats/${id}/settings`);
        break;
      case "leaveGroup":
        handleLeaveGroup();
        break;
      case "profile":
        if (otherUser?.username) {
          router.push(`/profile/${otherUser.username}`);
        }
        break;
      case "block":
        if (!otherUser?.id) return;
        setShowBlockConfirmation(true);
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
    <PageTransition>
      <main className="h-dvh bg-dark-cyan-blue">
        <div className="h-full flex flex-col relative">
          <ChatHeader
            conversationName={name}
            conversationAvatar={avatarUrl}
            conversation={conversation}
            currentUserId={user?.id}
            onBack={() => router.back()}
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
            <AnimatePresence>
              {conversation && (
                <TypingIndicator
                  conversationId={id}
                  currentUserId={user?.id ?? ""}
                  participants={conversation.participants ?? []}
                />
              )}
            </AnimatePresence>
          </MessageList>

          <div className="bg-white">
            <EditModeBanner />
            <MessageInput
              onSendMessage={(content, replyToMessageId) =>
                sendMessage({ content, replyToMessageId })
              }
              onEditMessage={(messageId, content) =>
                editMessage({ messageId, content })
              }
              onTyping={handleTyping}
            />
          </div>

          <ConfirmationDialog
            open={activeMessageAction?.type === "delete"}
            title="Delete message?"
            description="Are you sure you want to delete this message?"
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleDeleteMessage}
            onCancel={clearAction}
            isDestructive={true}
            isLoading={isDeletingMessage}
          />

          <ConfirmationDialog
            open={showBlockConfirmation}
            title="Block user?"
            description={
              otherUser?.username
                ? `Are you sure you want to block ${otherUser.username}? You won't be able to send messages to each other.`
                : "Are you sure you want to block this user? You won't be able to send messages to each other."
            }
            confirmText="Block"
            cancelText="Cancel"
            onConfirm={handleConfirmBlock}
            onCancel={() => setShowBlockConfirmation(false)}
            isDestructive={true}
            isLoading={isBlockingUser}
          />
        </div>
      </main>
    </PageTransition>
  );
}
