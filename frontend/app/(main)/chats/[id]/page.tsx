"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import {
  ChatWindow,
  useConversation,
  useChatMessages,
  useSendMessage,
  useMessageSubscription,
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

  // Queries
  const { data: conversation } = useConversation(id);
  const {
    messages,
    isLoading: messagesLoading,
    error: messagesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatMessages(id);

  // Mutations
  const { mutate: sendMessage } = useSendMessage(id);

  // Subscriptions
  useMessageSubscription(id);

  const { name } = conversation
    ? getConversationDisplayInfo(conversation, user?.id ?? "")
    : { name: "Chat" };

  const handleTyping = (isTyping: boolean) => {
    chatApi.setTyping(id, isTyping);
  };

  return (
    <main className="h-[calc(100vh-8rem)]">
      <div className="h-full max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-light-grey overflow-hidden flex flex-col">
        <ChatWindow
          conversationId={id}
          currentUserId={user?.id ?? ""}
          conversationName={name}
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
