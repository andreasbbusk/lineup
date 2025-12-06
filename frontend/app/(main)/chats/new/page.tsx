"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useConnections,
  useUserSearch,
  useCreateConversation,
  UserSearchList,
} from "@/app/lib/features/chats";
import type { components } from "@/app/lib/types/api";

type UserSearchResult = components["schemas"]["UserSearchResult"];

export default function NewChatPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch connections for suggestions (only when search is empty)
  const { data: connections, isLoading: connectionsLoading } =
    useConnections();

  // Search users (only when there's a query)
  const { data: searchResults, isLoading: searchLoading } = useUserSearch(
    searchQuery,
    searchQuery.length > 0
  );

  // Create conversation mutation
  const { mutate: createConversation, isPending: isCreating } =
    useCreateConversation();

  const handleUserClick = async (userId: string) => {
    createConversation([userId], {
      onSuccess: (conversation) => {
        // Navigate to the conversation
        router.push(`/chats/${conversation.id}`);
      },
      onError: (error) => {
        console.error("Failed to create conversation:", error);
      },
    });
  };

  const isSearching = searchQuery.length > 0;
  const displayUsers: UserSearchResult[] = isSearching
    ? (searchResults?.results?.filter(
        (r): r is UserSearchResult => r.type === "user"
      ) || [])
    : (connections || []);

  const isLoading = isSearching ? searchLoading : connectionsLoading;

  return (
    <main className="flex flex-col h-[calc(100vh-4rem)] bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-light-grey">
        <button
          onClick={() => router.push("/chats")}
          className="p-2 -ml-2 hover:bg-melting-glacier rounded-full transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="heading-2 flex-1">New Message</h1>
      </div>

      {/* Search Input */}
      <div className="px-4 py-3 border-b border-light-grey">
        <input
          type="text"
          placeholder="Search username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-melting-glacier text-black placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-crocus-yellow"
          autoFocus
        />
      </div>

      {/* Create Group Button (Stub) */}
      {!isSearching && (
        <div className="px-4 py-3 border-b border-light-grey">
          <button
            onClick={() => alert("Group chat coming soon")}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-melting-glacier rounded-xl transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-crocus-yellow flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M3 21C3 17.134 7.02944 14 12 14C16.9706 14 21 17.134 21 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-semibold text-black">Create group</span>
          </button>
        </div>
      )}

      {/* Suggestions Header */}
      {!isSearching && (
        <div className="px-4 py-2 bg-melting-glacier">
          <p className="text-sm font-semibold text-grey uppercase tracking-wide">
            Suggestions
          </p>
        </div>
      )}

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {isCreating ? (
          <div className="py-8 text-center">
            <p className="text-grey">Creating conversation...</p>
          </div>
        ) : (
          <UserSearchList
            users={displayUsers}
            isLoading={isLoading}
            onUserClick={handleUserClick}
            emptyMessage={isSearching ? "No users found" : "No connections yet"}
          />
        )}
      </div>
    </main>
  );
}
