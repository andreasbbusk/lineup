"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ConversationList,
  useConversations,
  useConversationSubscription,
  useLeaveConversation,
} from "@/app/modules/features/chats";
import { useAppStore } from "@/app/modules/stores/Store";
import { PageTransition } from "@/app/modules/components/page-transition";

export default function ChatsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAppStore((state) => state.user);

  // ============================================================================
  // Data & State
  // ============================================================================

  const { data, isLoading, error } = useConversations();
  const { mutate: leaveConversation } = useLeaveConversation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Get active tab from URL search params, default to "chats"
  const activeTab = (searchParams.get("tab") as "chats" | "groups") || "chats";

  // Handle tab change by updating URL search params
  const handleTabChange = (tab: "chats" | "groups") => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.push(`/chats?${params.toString()}`);
  };

  // Handle conversation deletion/leaving
  const handleDeleteConversation = (conversationId: string) => {
    leaveConversation(conversationId);
  };

  // Handle navigation to group settings
  const handleNavigateToSettings = (conversationId: string) => {
    router.push(`/chats/${conversationId}/settings`);
  };

  // Real-time subscription for conversation updates
  useConversationSubscription(user?.id ?? "");

  if (!user) return null;

  return (
    <PageTransition>
      <div className="flex flex-col h-screen overflow-hidden bg-dark-cyan-blue">
        {/* Header with dark-cyan background */}
        <div className="flex w-full max-w-200 mx-auto flex-col bg-dark-cyan-blue px-6 md:px-0 py-4 shrink-0">
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
        <div className="flex-1 overflow-hidden min-h-0">
          <ConversationList
            conversations={data}
            isLoading={isLoading}
            error={error}
            currentUserId={user.id}
            searchQuery={searchQuery}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onConversationClick={(conversationId) => {
              router.push(`/chats/${conversationId}`);
            }}
            onDeleteConversation={handleDeleteConversation}
            onNavigateToSettings={handleNavigateToSettings}
          />
        </div>
      </div>
    </PageTransition>
  );
}
