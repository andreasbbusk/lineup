"use client";

import Image from "next/image";
import Link from "next/link";
import type { PostResponse } from "../types";

interface TaggedUsersProps {
  taggedUsers?: PostResponse["taggedUsers"];
  className?: string;
}

export function TaggedUsers({ taggedUsers, className = "" }: TaggedUsersProps) {
  if (!taggedUsers || taggedUsers.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-500">Tagged:</span>
      <div className="flex items-center gap-2">
        {taggedUsers.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.username}`}
            className="flex items-center gap-1.5 rounded-full hover:bg-gray-100 px-2 py-1 transition-colors"
          >
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.username}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium">
                {(user.firstName || user.username)[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium">
              {user.firstName || user.username}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

