"use client";

import { UserSearchResult } from "../../types";
import { Avatar, getInitials } from "../../../../components/avatar";
import { Check } from "lucide-react";

type UserSuggestionRowProps = {
  user: UserSearchResult;
  onClick: (userId: string, user: UserSearchResult) => void;
  isSelected?: boolean;
};

export function UserSuggestionRow({
  user,
  onClick,
  isSelected = false,
}: UserSuggestionRowProps) {
  const initials = getInitials(user.firstName, user.lastName);

  return (
    <button
      onClick={() => onClick(user.id, user)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-melting-glacier transition-colors"
    >
      <Avatar
        src={user.avatarUrl}
        alt={user.username}
        fallback={initials}
        size="md"
      />
      <div className="flex-1 text-left min-w-0">
        <p className="font-semibold text-black text-sm leading-tight">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-grey leading-tight mt-0.5">
          {user.bio || `@${user.username}`}
        </p>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          isSelected
            ? "bg-crocus-yellow border-crocus-yellow"
            : "border-grey bg-white"
        }`}
      >
        {isSelected && <Check className="size-3 text-black stroke-3" />}
      </div>
    </button>
  );
}
