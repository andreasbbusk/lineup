"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { keepPreviousData } from "@tanstack/react-query";
import {
  useInfinitePosts,
  usePosts,
} from "@/app/modules/hooks/queries/usePosts";
import { useProfiles } from "@/app/modules/features/profiles";
import { PostCard } from "@/app/modules/features/posts/components/post-card";
import { RequestCarousel } from "@/app/modules/features/posts/components/request-carousel";
import { StoriesCarousel } from "@/app/modules/features/posts/components/stories-carousel";
import { PageTransition } from "@/app/modules/components/page-transition";
import {
  PostCardSkeleton,
  StoryAvatarSkeleton,
  CompactPostCardSkeleton,
} from "@/app/modules/components/skeleton";

const STORY_USERNAMES = [
  "ostehvl",
  "medina",
  "andreaskadhede",
  "Testmand",
  "androkles",
  "Testkvinde",
];

export default function FeedPage() {
  // Fetch all data together
  const {
    posts,
    error: postsError,
    isPending: postsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts({
    limit: 20,
    type: "note",
  });

  const {
    data: storiesData,
    error: storiesError,
    isPending: storiesLoading,
  } = useProfiles(STORY_USERNAMES);

  const {
    data: requestsData,
    error: requestsError,
    isPending: requestsLoading,
  } = usePosts(
    { limit: 20, type: "request" },
    { placeholderData: keepPreviousData }
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Wait for all initial data to load
  const isLoading = postsLoading || storiesLoading || requestsLoading;
  const error = postsError || storiesError || requestsError;

  // Intersection observer for infinite scroll
  useEffect(() => {
    // Don't set up observer until content is loaded and ref exists
    if (isLoading || !loadMoreRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

  if (error) {
    return (
      <main className="space-y-4">
        <h1 className="text-h1 font-bold">Feed</h1>
        <p className="text-body text-red-500">
          Error loading feed: {error.message}
        </p>
      </main>
    );
  }

  return (
    <PageTransition>
      <main className="max-w-dvw h-[calc(100dvh-4rem)] mx-auto pt-16">
        {isLoading ? (
          // Unified loading state for everything
          <>
            {/* Stories skeleton */}
            <div className="no-scrollbar flex items-start gap-3 bg-white overflow-x-auto pb-4 snap-mandatory border-b-2 border-gray-200 px-4 md:justify-center min-h-[141px]">
              {Array.from({ length: 6 }).map((_, index) => (
                <StoryAvatarSkeleton key={index} />
              ))}
            </div>

            {/* Requests skeleton */}
            <div className="flex flex-col items-start gap-2.5 px-3.75 pt-3.75 pb-6 max-w-200 w-full mx-auto md:px-0">
              <p className="text-gray font-normal text-base">
                Collaboration requests
              </p>
              <div className="no-scrollbar flex pr-3.75 items-start max-w-[calc(100vw-0.9375rem)] gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="snap-start">
                    <CompactPostCardSkeleton />
                  </div>
                ))}
              </div>
            </div>

            {/* Posts skeleton */}
            <div className="flex flex-col items-center">
              {Array.from({ length: 3 }).map((_, index) => (
                <PostCardSkeleton key={index} />
              ))}
            </div>
          </>
        ) : (
          // All data loaded - show everything together
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <StoriesCarousel users={storiesData || []} />
            <RequestCarousel data={requestsData} />

            {posts.length > 0 ? (
              <div className="flex flex-col items-center pb-20">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}

                {hasNextPage && (
                  <div ref={loadMoreRef} className="text-center py-4">
                    {isFetchingNextPage ? (
                      <p className="text-sm text-gray-500">
                        Loading more notes...
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">Scroll for more</p>
                    )}
                  </div>
                )}

                {!hasNextPage && posts.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">
                      You&apos;ve reached the end
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-500">No notes yet.</p>
                <p className="mt-2 text-sm text-gray-400">
                  Be the first to create a notes!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </PageTransition>
  );
}
