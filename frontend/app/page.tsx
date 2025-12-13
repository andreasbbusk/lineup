"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { usePosts } from "@/app/modules/hooks/queries";
import { PostCard } from "@/app/modules/features/posts/components/post-card";
import { RequestCarousel } from "@/app/modules/features/posts/components/request-carousel";
import { StoriesCarousel } from "@/app/modules/features/posts/components/stories-carousel";

export default function FeedPage() {
  const { data, error, isPending } = usePosts({ 
    limit: 20, 
    type: "note"
  }, {
    placeholderData: keepPreviousData, // Keep previous data while refetching
  });

  if (error) {
    return (
      <main className="space-y-4">
        <h1 className="text-h1 font-bold">Feed</h1>
        <p className="text-body text-red-500">
          Error loading posts: {error.message}
        </p>
      </main>
    );
  }

  const posts = (data?.data || []).filter((post) => post.type === "note");

  return (
    <main className="max-w-dvw h-[calc(100dvh-4rem)]">
      <StoriesCarousel />
      <RequestCarousel />

      {posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {data?.pagination.hasMore && (
            <div className="text-center">
              <p className="text-sm text-gray-500">Loading posts...</p>
            </div>
          )}
        </div>
      ) : (
        !isPending && (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">No posts yet.</p>
            <p className="mt-2 text-sm text-gray-400">
              Be the first to create a post!
            </p>
          </div>
        )
      )}
    </main>
  );
}