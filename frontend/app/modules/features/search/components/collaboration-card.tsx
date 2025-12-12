"use client";

import { memo } from "react";
import { Avatar } from "@/app/modules/components/avatar";
import { Divider } from "@/app/modules/features/profiles/components/edit/divider";
import Link from "next/link";
import type { CollaborationSearchResult } from "../types";
import { formatDate } from "../utils/helpers";

interface CollaborationSearchResultCardProps {
  collaboration: CollaborationSearchResult;
  onStartChat?: (authorId: string, postId: string) => void;
}

function CollaborationSearchResultCardComponent({
  collaboration,
}: CollaborationSearchResultCardProps) {
  return (
    <article className="flex p-3.75 flex-col w-full justify-center gap-2.5 bg-white rounded-3xl border border-grey/10">
      <div className="flex justify-between self-stretch items-center">
        <div className="flex gap-1.25 flex-[1_0_0] text-gray-500 items-center">
          <Link
            href={`/services/${collaboration.authorId}`}
            className="flex flex-row items-center gap-1.25"
          >
            <Avatar
              size="xs"
              fallback={
                collaboration.authorFirstName?.[0]?.toUpperCase() || "U"
              }
              src={collaboration.authorAvatarUrl}
              alt={`${collaboration.authorUsername}'s avatar`}
            />
            <p className="text-gray-700 text-sm">
              {collaboration.authorFirstName}
            </p>
          </Link>
          <p className="text-sm">looking for a #guitarist</p>
        </div>
      </div>
      <Divider long />
      <h3 className="px-2.5 text-base font-semibold">{collaboration.title}</h3>

      <p className="px-2.5 line-clamp-4 text-gray-600">
        {collaboration.description}
      </p>
      <div className="px-2.5 flex self-stretch gap-2.5 items-center justify-between">
        <Link
          href={`/posts/${collaboration.id}`}
          className="text-[#555] font-semibold text-sm"
        >
          Read more
        </Link>
        <div className="flex justify-end gap-1.25 text-gray-400">
          {collaboration.location && (
            <p className="text-sm">{collaboration.location}</p>
          )}
          {collaboration.location && <span className="text-sm"> - </span>}
          <p className="text-sm">{formatDate(collaboration.createdAt)}</p>
        </div>
      </div>
    </article>
  );
}

export const CollaborationSearchResultCard = memo(
  CollaborationSearchResultCardComponent
);
