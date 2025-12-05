"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ConversationList,
  useConversations,
  useConversationSubscription,
} from "@/app/lib/features/chats";
import { useAppStore } from "@/app/lib/stores/app-store";

export default function ChatsPage() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const { data, isLoading, error } = useConversations();

  // Subscribe to real-time conversation updates
  useConversationSubscription(user?.id ?? "");

  if (!user) return null;

  return (
    <main className="-mx-6 -my-8 flex flex-col min-h-[calc(100vh-4rem)] bg-blackberry-harvest">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 pt-8 pb-6">
        <h1 className="heading-1 text-white tracking-wide">
          Messages
        </h1>
        <div className="flex items-center gap-4">
          <button className="p-1">
            <Image
              src="/icons/search.svg"
              alt="Search"
              width={24}
              height={24}
              className="brightness-0 invert"
            />
          </button>
          <button className="p-1">
            <Image
              src="/icons/edit-pencil.svg"
              alt="Edit"
              width={24}
              height={24}
              className="brightness-0 invert"
            />
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 bg-blackberry-harvest overflow-hidden flex flex-col">
        <ConversationList
          conversations={data}
          isLoading={isLoading}
          error={error}
          currentUserId={user.id}
          onConversationClick={(conversationId) => {
            router.push(`/chats/${conversationId}`);
          }}
        />
      </div>
    </main>
  );
}
