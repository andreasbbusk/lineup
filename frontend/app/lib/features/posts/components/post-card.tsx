"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PostResponse } from "../types";
import { MediaGrid } from "./media-grid";
import { TaggedUsers } from "./tagged-users";

interface PostCardProps {
  post: PostResponse;
  className?: string;
}

function formatDate(dateString: string | null, now: Date): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// Client-only date formatter to prevent hydration mismatches
function RelativeDate({ dateString }: { dateString: string | null }) {
  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const updateDate = () => {
      setFormattedDate(formatDate(dateString, new Date()));
    };
    updateDate();
    // Update every minute for relative times
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, [dateString]);

  // During SSR and initial render, show a stable format
  if (!mounted || !dateString) {
    const date = dateString ? new Date(dateString) : null;
    if (date) {
      return (
        <span suppressHydrationWarning>
          {date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    }
    return <span suppressHydrationWarning></span>;
  }

  return <span suppressHydrationWarning>{formattedDate}</span>;
}

export function PostCard({ post, className = "" }: PostCardProps) {
  const author = post.author;
  const postUrl = `/posts/${post.id}`;

  return (
    <article
      className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      {/* Author Header */}
      <div className="mb-3 flex items-center gap-3">
        <Link href={`/profile/${author?.username || post.authorId}`}>
          {author?.avatarUrl ? (
            <Image
              src={author.avatarUrl}
              alt={author.username}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium">
              {(author?.firstName || author?.username || "U")[0].toUpperCase()}
            </div>
          )}
        </Link>
        <div className="flex-1">
          <Link
            href={`/profile/${author?.username || post.authorId}`}
            className="block font-semibold hover:underline"
          >
            {author?.firstName && author?.lastName
              ? `${author.firstName} ${author.lastName}`
              : author?.username || "Unknown User"}
          </Link>
          <span className="text-sm text-gray-500">
            <RelativeDate dateString={post.createdAt} />
            {post.location && ` · ${post.location}`}
          </span>
        </div>
        {post.type === "request" && post.paidOpportunity && (
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            Paid
          </span>
        )}
      </div>

      {/* Post Content */}
      <Link href={postUrl}>
        <h2 className="mb-2 text-lg font-semibold hover:underline">
          {post.title}
        </h2>
        <p className="mb-3 line-clamp-3 text-gray-700">{post.description}</p>
      </Link>

      {/* Media Preview */}
      {post.media && post.media.length > 0 && (
        <div className="mb-3">
          <MediaGrid media={post.media} showLightbox={false} />
        </div>
      )}

      {/* Tags/Genres */}
      {post.metadata && post.metadata.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {post.metadata.map((meta) => (
            <span
              key={meta.id}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
            >
              {meta.type === "tag" ? "#" : ""}
              {meta.name}
            </span>
          ))}
        </div>
      )}

      {/* Tagged Users */}
      <TaggedUsers taggedUsers={post.taggedUsers} className="mb-3" />

      {/* Post Type Badge */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-xs font-medium uppercase text-gray-500">
          {post.type}
        </span>
        <Link
          href={postUrl}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View post →
        </Link>
      </div>
    </article>
  );
}

