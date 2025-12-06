"use client";

import { UserSuggestionRow } from "./user-suggestion-row";
import type { components } from "@/app/lib/types/api";

type UserSearchResult = components["schemas"]["UserSearchResult"];

type UserSearchListProps = {
  users: UserSearchResult[];
  isLoading: boolean;
  onUserClick: (userId: string) => void;
  emptyMessage?: string;
};

export function UserSearchList({
  users,
  isLoading,
  onUserClick,
  emptyMessage = "No users found",
}: UserSearchListProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <p className="text-grey">Loading...</p>
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
        <UserSuggestionRow key={user.id} user={user} onClick={onUserClick} />
      ))}
    </div>
  );
}
