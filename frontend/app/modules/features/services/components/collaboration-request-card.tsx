"use client";

import { memo, useState } from "react";
import { Avatar } from "@/app/modules/components/avatar";
import { Separator } from "@/app/modules/components/separator";
import { Tags } from "@/app/modules/components/tags";
import { Button } from "@/app/modules/components/buttons";
import { BookmarkButton } from "@/app/modules/components/bookmark-button";
import { formatTimeAgo, extractCity } from "@/app/modules/utils/date";
import Link from "next/link";
import Image from "next/image";
import type { PostResponse } from "@/app/modules/api/postsApi";

interface CollaborationRequestCardProps {
  post: PostResponse;
  onChatClick: (authorId: string) => void;
}

function CollaborationRequestCardComponent({
  post,
  onChatClick,
}: CollaborationRequestCardProps) {
  const [imageError, setImageError] = useState(false);
  const authorName = post.author?.firstName || post.author?.username || "User";
  const authorInitial = authorName[0]?.toUpperCase() || "U";
  const genres = post.metadata?.filter((m) => m.type === "genre") || [];
  const firstMedia = post.media?.[0];

  return (
    <article className="flex p-3.75 flex-col w-full min-h-112 gap-2.5 bg-white rounded-xl border border-grey/10 hover:shadow-md transition-shadow cursor-pointer">
      <Link
        href={`/posts/${post.id}`}
        className="flex flex-col flex-1 min-h-0 gap-2.5"
      >
        {/* Header */}
        <div className="flex justify-between self-stretch items-center">
          <div className="flex gap-1.25 flex-[1_0_0] items-center">
            <Avatar
              size="xs"
              fallback={authorInitial}
              src={post.author?.avatarUrl}
              alt={`${authorName}'s avatar`}
            />
            <p className="text-black text-base truncate">{authorName}</p>
            <p className="text-base text-gray-500">looking for</p>
            <p className="text-base text-gray-500 truncate">#guitarist</p>
          </div>
          <BookmarkButton ariaLabel={`Bookmark ${post.title}`} />
        </div>

        <Separator />

        {/* Title */}
        <h3 className="px-2.5 text-lg font-bold text-foreground">
          {post.title}
        </h3>

        {/* Tags and Metadata Row */}
        <div className="px-2.5 flex self-stretch gap-2.5 items-center justify-between">
          <div className="flex gap-2 flex-wrap items-center flex-1 min-w-0">
            {genres.slice(0, 3).map((genre) => (
              <Tags key={genre.id} text={genre.name} hashTag />
            ))}
            {post.paidOpportunity && <Tags text="paid-gig" hashTag />}
          </div>
          <div className="flex gap-1.25 text-gray-400 text-base items-center">
            {extractCity(post.location) && (
              <p className="text-base">{extractCity(post.location)}</p>
            )}
            {extractCity(post.location) && (
              <span className="text-base"> - </span>
            )}
            <p className="text-base">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>

        {/* Content area - grows to fill space */}
        <div className="flex flex-col flex-1 min-h-0 gap-2.5">
          {/* Media */}
          {firstMedia && !imageError && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden">
              <Image
                src={firstMedia.url}
                alt={post.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}

          {/* Description */}
          <p className="px-2.5 line-clamp-3 text-gray-600 text-base">
            {post.description}
          </p>
        </div>

        {/* Footer */}
        <div className="px-2.5 flex self-stretch gap-2.5 items-center justify-between">
          <span className="text-[#555] font-semibold text-base">Read more</span>
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (post.authorId) {
                onChatClick(post.authorId);
              }
            }}
          >
            <Button variant="primary" icon="chat-bubble" onClick={() => {}}>
              Start a chat
            </Button>
          </div>
        </div>
      </Link>
    </article>
  );
}

export const CollaborationRequestCard = memo(CollaborationRequestCardComponent);
