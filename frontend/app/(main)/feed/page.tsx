"use client";

import { usePosts } from "@/app/lib/features/posts";
import { PostCard } from "@/app/lib/features/posts/components/post-card";

export default function FeedPage() {
  const { data, isLoading, error } = usePosts({ limit: 20 });

  if (isLoading) {
    return (
      <main className="space-y-4">
        <h1 className="text-h1 font-bold">Feed</h1>
        <p className="text-body text-grey">
          Din personlige oversigt over nye opslag og opdateringer fra LineUp.
        </p>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-4">
        <h1 className="text-h1 font-bold">Feed</h1>
        <p className="text-body text-red-500">
          Fejl ved indlæsning af opslag: {error.message}
        </p>
      </main>
    );
  }

  const posts = data?.data || [];

  return (
    <main className="space-y-4">
      <h1 className="text-h1 font-bold">Feed</h1>
      <p className="text-body text-grey">
        Din personlige oversigt over nye opslag og opdateringer fra LineUp.
      </p>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">Ingen opslag endnu.</p>
          <p className="mt-2 text-sm text-gray-400">
            Vær den første til at oprette et opslag!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {data?.pagination.hasMore && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Flere opslag indlæses...
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

