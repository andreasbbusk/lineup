"use client";

import { useState } from "react";
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

  // ============================================================================
  // Data & State
  // ============================================================================

  const { data, isLoading, error } = useConversations();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Real-time subscription for conversation updates
  useConversationSubscription(user?.id ?? "");

  if (!user) return null;

  return (
    <main className="-mx-6 -my-8 flex flex-col h-[calc(100vh-4rem)] min-w-[360px] overflow-hidden">
      {/* Header with dark-cyan background */}
      <div className="flex flex-col bg-dark-cyan-blue px-6 py-4 pt-8 pb-6 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="heading-1 text-white tracking-wide">Messages</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1 hover:opacity-80 transition-opacity"
              aria-label="Search conversations"
            >
              <Image
                src="/icons/search.svg"
                alt="Search"
                width={24}
                height={24}
                className="brightness-0 invert"
              />
            </button>
            <button
              onClick={() => router.push("/chats/new")}
              className="p-1 hover:opacity-80 transition-opacity"
              aria-label="New conversation"
            >
              <Image
                src="/icons/edit-pencil.svg"
                alt="New conversation"
                width={24}
                height={24}
                className="brightness-0 invert"
              />
            </button>
          </div>
        </div>

        {/* Search input */}
        {showSearch && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex-1 min-h-0">
        <ConversationList
          conversations={data}
          isLoading={isLoading}
          error={error}
          currentUserId={user.id}
          searchQuery={searchQuery}
          onConversationClick={(conversationId) => {
            router.push(`/chats/${conversationId}`);
          }}
        />
      </div>
    </main>
  );
}
