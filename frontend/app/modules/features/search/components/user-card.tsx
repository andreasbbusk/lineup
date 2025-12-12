"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/app/modules/components/avatar";
import { Button } from "@/app/modules/components/buttons";
// Todo: Lift logic to global infrastructure
import { useConnectionButton } from "@/app/modules/features/profiles/hooks/useConnectionButton";
import type { UserSearchResult } from "../types";
import { Plus } from "lucide-react";

interface UserSearchResultCardProps {
  user: UserSearchResult;
}

function UserSearchResultCardComponent({ user }: UserSearchResultCardProps) {
  // Use the same hook as profile ConnectionButton
  const {
    state,
    handleConnect,
    handleCancel,
    isLoading,
    isPending,
    shouldRender,
  } = useConnectionButton(user.id);

  // Don't render button while loading to prevent FOUC
  if (isLoading || !shouldRender) {
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
      </article>
    );
  }
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

      {state !== "connected" && (
        <div className="shrink-0">
          {state === "pending_sent" ? (
            // Pending request - show cancel option
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={isPending}
              className="py-1! text-sm! font-medium! gap-1! min-w-24"
            >
              Pending
              <Image
                src="/icons/loading.svg"
                alt="Pending icon"
                width={16}
                height={16}
                className="-mr-0.5"
              />
            </Button>
          ) : state === "not_connected" ? (
            // Not connected - show connect option
            <Button
              variant="primary"
              onClick={handleConnect}
              disabled={isPending}
              className="py-1! text-sm! font-medium! min-w-16"
            >
              Connect{" "}
              <Plus
                className="inline-block ml-1 border border-black rounded-full"
                size={14}
              />
            </Button>
          ) : null}
        </div>
      )}
    </article>
  );
}

export const UserSearchResultCard = memo(UserSearchResultCardComponent);
