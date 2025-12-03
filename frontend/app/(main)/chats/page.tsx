"use client";

import { useRouter } from "next/navigation";
import { ConversationList } from "@/app/lib/features/chats";
import { useAppStore } from "@/app/lib/stores/app-store";

export default function ChatsPage() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);

  return (
    <main className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <ConversationList
          currentUserId={user?.id || ""}
          onConversationClick={(conversationId) => {
            router.push(`/chats/${conversationId}`);
          }}
        />
      </div>
    </main>
  );
}
