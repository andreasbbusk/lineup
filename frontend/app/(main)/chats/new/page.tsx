"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateConversation,
  UserSearchList,
} from "@/app/modules/features/chats";
import { useConnectedUsers } from "@/app/modules/hooks/queries";
import { useUserSearch } from "@/app/modules/hooks/queries";
import type { components } from "@/app/modules/types/api";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";
import { ChevronLeft, ArrowRight } from "lucide-react";

type UserSearchResult = components["schemas"]["UserSearchResult"];

export default function NewChatPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [groupName, setGroupName] = useState("");

  // Fetch connections for suggestions (only when search is empty)
  const { data: connections, isLoading: connectionsLoading } =
    useConnectedUsers();

  // Search users (only when there's a query)
  const { data: searchResults, isLoading: searchLoading } = useUserSearch(
    searchQuery,
    searchQuery.length > 0
  );

  // Create conversation mutation
  const { mutate: createConversation, isPending: isCreating } =
    useCreateConversation();

  const handleUserClick = (userId: string, user?: UserSearchResult) => {
    const isSelected = selectedUserIds.includes(userId);

    if (isSelected) {
      // Remove from selection
      setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
      setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
    } else {
      // Add to selection
      if (user) {
        setSelectedUserIds((prev) => [...prev, userId]);
        setSelectedUsers((prev) => [...prev, user]);
      }
    }
  };

  const handleContinue = () => {
    if (selectedUserIds.length === 0) return;

    if (selectedUserIds.length === 1) {
      // Create DM immediately
      createConversation(
        {
          type: "direct",
          participantIds: selectedUserIds,
          name: null,
          avatarUrl: null,
        },
        {
          onSuccess: (conversation) => {
            setSelectedUserIds([]);
            setSelectedUsers([]);
            router.push(`/chats/${conversation.id}`);
          },
          onError: (error) => {
            console.error("Failed to create conversation:", error);
          },
        }
      );
    } else {
      // Create group - requires name to be filled
      if (!groupName.trim()) return;

      createConversation(
        {
          type: "group",
          participantIds: selectedUserIds,
          name: groupName.trim(),
          avatarUrl: null,
        },
        {
          onSuccess: (conversation) => {
            setGroupName("");
            setSelectedUserIds([]);
            setSelectedUsers([]);
            router.push(`/chats/${conversation.id}`);
          },
          onError: (error) => {
            console.error("Failed to create group:", error);
          },
        }
      );
    }
  };

  const isSearching = searchQuery.length > 0;
  const allUsers: UserSearchResult[] = isSearching
    ? searchResults?.results?.filter(
        (result): result is UserSearchResult => result.type === "user"
      ) || []
    : connections || [];

  // Filter out already selected users from the display list
  const displayUsers = allUsers.filter(
    (user) => !selectedUserIds.includes(user.id)
  );

  const isLoading = isSearching ? searchLoading : connectionsLoading;

  return (
    <main className="flex flex-col h-[calc(100dvh-4rem)] bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-light-grey">
        <button
          onClick={() => router.push("/chats")}
          className="p-2 -ml-2 hover:bg-melting-glacier rounded-full transition-colors"
        >
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="heading-2 flex-1">New Message</h1>
      </div>

      {/* Search Input */}
      <div className="px-4 py-2.5 border-b border-light-grey">
        <input
          type="text"
          placeholder="Search username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-xl bg-melting-glacier text-black placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-crocus-yellow"
          autoFocus
        />
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {isCreating ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Selected Users Section */}
            {selectedUsers.length > 0 && (
              <>
                <h4 className="text-sm font-medium text-grey tracking-wide px-4 pt-4">
                  Selected
                </h4>
                <UserSearchList
                  users={selectedUsers}
                  isLoading={false}
                  onUserClick={handleUserClick}
                  emptyMessage=""
                  selectedUserIds={selectedUserIds}
                />
              </>
            )}

            {/* Suggestions/Search Results Section */}
            {displayUsers.length > 0 && (
              <h4 className="text-sm font-medium text-grey tracking-wide px-4 pt-4">
                {isSearching ? "Search Results" : "Connections"}
              </h4>
            )}
            {(displayUsers.length > 0 || isLoading) && (
              <UserSearchList
                users={displayUsers}
                isLoading={isLoading}
                onUserClick={handleUserClick}
                emptyMessage={
                  isSearching ? "No users found" : "No connections yet"
                }
                selectedUserIds={selectedUserIds}
              />
            )}
          </>
        )}
      </div>

      {/* Floating Action Section */}
      {selectedUserIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-4 py-3 border-t border-light-grey bg-white space-y-3">
          {/* Group Name Input - Only show for groups (2+ people) */}
          {selectedUserIds.length > 1 && (
            <div>
              <label className="text-xs font-medium text-grey mb-1.5 block">
                Group Name
              </label>
              <input
                type="text"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-2 text-sm rounded-xl bg-melting-glacier text-black placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-crocus-yellow"
              />
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleContinue}
            disabled={
              isCreating || (selectedUserIds.length > 1 && !groupName.trim())
            }
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-full bg-crocus-yellow text-black font-semibold hover:bg-crocus-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>
              {selectedUserIds.length === 1
                ? "Continue"
                : `Create Group with ${selectedUserIds.length} people`}
            </span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}
