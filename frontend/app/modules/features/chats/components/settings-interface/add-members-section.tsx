"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import {
  useConnections,
  useUserSearch,
  UserSearchList,
} from "@/app/modules/features/chats";
import { useAddParticipants } from "../../hooks/query/conversationMutations";
import type { components } from "@/app/modules/types/api";

type UserSearchResult = components["schemas"]["UserSearchResult"];

interface AddMembersSectionProps {
  conversationId: string;
  currentParticipantIds: string[];
}

export function AddMembersSection({
  conversationId,
  currentParticipantIds,
}: AddMembersSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch connections for suggestions (only when search is empty)
  const { data: connections, isLoading: connectionsLoading } = useConnections();

  // Search users (only when there's a query)
  const { data: searchResults, isLoading: searchLoading } = useUserSearch(
    searchQuery,
    searchQuery.length > 0
  );

  const { mutate: addParticipants, isPending } = useAddParticipants();

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

  const handleAddMembers = () => {
    if (selectedUserIds.length === 0 || isPending) return;

    addParticipants(
      {
        conversationId,
        participantIds: selectedUserIds,
      },
      {
        onSuccess: () => {
          // Reset state on success
          setSelectedUserIds([]);
          setSelectedUsers([]);
          setSearchQuery("");
          setIsExpanded(false);
        },
        onError: (error) => {
          console.error("Failed to add members:", error);
        },
      }
    );
  };

  const isSearching = searchQuery.length > 0;
  const allUsers: UserSearchResult[] = isSearching
    ? searchResults?.results?.filter(
        (result): result is UserSearchResult => result.type === "user"
      ) || []
    : connections || [];

  // Filter out already participating users and already selected users
  const displayUsers = allUsers.filter(
    (user) =>
      !currentParticipantIds.includes(user.id) &&
      !selectedUserIds.includes(user.id)
  );

  const isLoading = isSearching ? searchLoading : connectionsLoading;

  if (!isExpanded) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-dark-cyan-blue text-white rounded-lg active:scale-95 transition-transform"
        >
          <UserPlus className="size-4" />
          <span>Add Members</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-grey-light pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-grey uppercase tracking-wide">
          Add Members
        </h3>
        <button
          onClick={() => {
            setIsExpanded(false);
            setSelectedUserIds([]);
            setSelectedUsers([]);
            setSearchQuery("");
          }}
          className="text-sm text-grey hover:text-black"
        >
          Cancel
        </button>
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search username..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg bg-grey-light/20 text-black placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-dark-cyan-blue"
        autoFocus
      />

      {/* Selected Users Preview */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => {
            const fullName = [user.firstName, user.lastName]
              .filter(Boolean)
              .join(" ");
            const displayName = fullName || user.username;
            return (
              <div
                key={user.id}
                className="flex items-center gap-1 px-2 py-1 bg-dark-cyan-blue/10 text-dark-cyan-blue rounded-full text-xs"
              >
                <span>{displayName}</span>
                <button
                  onClick={() => handleUserClick(user.id)}
                  className="size-4 flex items-center justify-center hover:bg-dark-cyan-blue/20 rounded-full"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* User List */}
      <div className="max-h-64 overflow-y-auto">
        {displayUsers.length > 0 && (
          <UserSearchList
            users={displayUsers}
            isLoading={isLoading}
            onUserClick={handleUserClick}
            emptyMessage={
              isSearching ? "No users found" : "No connections available"
            }
            selectedUserIds={selectedUserIds}
          />
        )}
        {!isLoading && displayUsers.length === 0 && (
          <p className="text-sm text-grey text-center py-4">
            {isSearching
              ? "No users found"
              : "All connections are already in this group"}
          </p>
        )}
      </div>

      {/* Add Button */}
      {selectedUserIds.length > 0 && (
        <button
          onClick={handleAddMembers}
          disabled={isPending}
          className="py-2 px-4 bg-dark-cyan-blue text-white rounded-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending
            ? "Adding..."
            : `Add ${selectedUserIds.length} ${
                selectedUserIds.length === 1 ? "member" : "members"
              }`}
        </button>
      )}
    </div>
  );
}
