"use client";

import type { components } from "@/app/lib/types/api";
import { Avatar, getInitials } from "../shared/avatar";

type UserSearchResult = components["schemas"]["UserSearchResult"];

type UserSuggestionRowProps = {
  user: UserSearchResult;
  onClick: (userId: string) => void;
};

export function UserSuggestionRow({ user, onClick }: UserSuggestionRowProps) {
  const initials = getInitials(user.firstName, user.lastName);

  return (
    <button
      onClick={() => onClick(user.id)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-melting-glacier transition-colors"
    >
      <Avatar
        src={user.avatarUrl}
        alt={user.username}
        fallback={initials}
        size="md"
      />
      <div className="flex-1 text-left">
        <p className="font-semibold text-black">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-sm text-grey">@{user.username}</p>
        {user.bio && <p className="text-sm text-grey truncate">{user.bio}</p>}
      </div>
    </button>
  );
}
