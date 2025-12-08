"use client";

import { UserSuggestionRow } from "./user-suggestion-row";
import { ChatRowSkeleton } from "@/app/components/skeleton";
import { UserSearchResult } from "../../types";

type UserSearchListProps = {
  users: UserSearchResult[];
  isLoading: boolean;
  onUserClick: (userId: string, user: UserSearchResult) => void;
  emptyMessage?: string;
  selectedUserIds?: string[];
};

export function UserSearchList({
  users,
  isLoading,
  onUserClick,
  emptyMessage = "No users found",
  selectedUserIds = [],
}: UserSearchListProps) {
  if (isLoading) {
    return (
      <div className="divide-y divide-light-grey">
        {Array.from({ length: 10 }).map((_, i) => (
          <ChatRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-grey">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-light-grey">
      {users.map((user) => (
        <UserSuggestionRow
          key={user.id}
          user={user}
          onClick={onUserClick}
          isSelected={selectedUserIds.includes(user.id)}
        />
      ))}
    </div>
  );
}
