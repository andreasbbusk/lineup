"use client";

import { useRouter } from "next/navigation";
import { ChatWindow, useConversation } from "@/app/lib/features/chats";
import { useAppStore } from "@/app/lib/stores/app-store";

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const { data: conversation } = useConversation(params.id);

  // Handle unauthenticated state
  if (!user?.id) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Not Authenticated</h2>
          <p className="text-grey">Please log in to view this conversation.</p>
        </div>
      </main>
    );
  }

  // Get conversation display name
  const getConversationName = () => {
    if (!conversation) return "Chat";

    if (conversation.type === "group") {
      return conversation.name || "Group Chat";
    }

    // For direct messages, find the other participant
    const otherParticipant = conversation.participants?.find(
      (p) => p.userId !== user.id
    );

    if (otherParticipant?.user) {
      return `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`;
    }

    return "Chat";
  };

  return (
    <main className="h-[calc(100vh-8rem)]">
      <div className="h-full max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <ChatWindow
          conversationId={params.id}
          currentUserId={user.id}
          conversationName={getConversationName()}
          onBack={() => router.push("/chats")}
        />
      </div>
    </main>
  );
}
