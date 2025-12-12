"use client";

import { memo } from "react";
import Link from "next/link";
import { Avatar } from "@/app/modules/components/avatar";
import { Button } from "@/app/modules/components/buttons";
import type { UserSearchResult } from "../types";
import { Plus } from "lucide-react";

interface UserSearchResultCardProps {
  user: UserSearchResult;
  onConnect?: (userId: string) => void;
  isConnecting?: boolean;
}

function UserSearchResultCardComponent({
  user,
  onConnect,
  isConnecting = false,
}: UserSearchResultCardProps) {
  return (
    <article className="flex items-center gap-3 py-1">
      <Link href={`/profile/${user.username}`} className="shrink-0">
        <Avatar
          size="md"
          src={user.avatarUrl}
          alt={`${user.username}'s avatar`}
          fallback={
            user.firstName
              ? `${user.firstName[0]}${user.lastName?.[0] || ""}`
              : user.username[0].toUpperCase()
          }
          className="border border-crocus-yellow rounded-full"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/profile/${user.username}`}>
          <h6 className="font-medium text-sm hover:underline">
            {user.firstName} {user.lastName}
          </h6>

          <p className="mt-1 text-xs text-grey line-clamp-2">
            {user.bio || `@${user.username}`}
          </p>
        </Link>
      </div>

      {!user.isConnected && (
        <div className="shrink-0">
          <Button
            variant="primary"
            onClick={() => onConnect?.(user.id)}
            disabled={isConnecting}
            className="py-1! text-sm! font-medium!"
          >
            {isConnecting ? (
              "Connecting..."
            ) : (
              <>
                Connect{" "}
                <Plus
                  className="inline-block ml-1 border border-black rounded-full"
                  size={12}
                />
              </>
            )}
          </Button>
        </div>
      )}
    </article>
  );
}

export const UserSearchResultCard = memo(UserSearchResultCardComponent);
