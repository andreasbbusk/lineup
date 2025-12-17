"use client";

import {
  useQuery,
  useInfiniteQuery,
  UseQueryOptions,
  keepPreviousData
} from "@tanstack/react-query";
import { useMemo } from "react";
import { listPosts, getPostById, getPostRespondents, getAllPostRespondents } from "@/app/modules/api/postsApi";
import type {
  PaginatedResponse,
  PostResponse,
  PostsQueryParams,
  PostRespondent,
} from "@/app/modules/api/postsApi";

/**
 * Hook for fetching a list of posts with filters and pagination
 *
 * @param params - Query parameters for filtering and pagination
 * @param options - Additional query options
 * @returns Query result with posts data
 *
 * @example
 * ```
 * const { data, isLoading } = usePosts({ type: "note", limit: 20 });
 * ```
 */
export function usePosts(
  params?: PostsQueryParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedResponse<PostResponse>,
      Error,
      PaginatedResponse<PostResponse>,
      ["posts", PostsQueryParams?]
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => listPosts({ ...params, includeEngagement: true }),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    // Performance optimizations
    placeholderData: keepPreviousData, // Prevents UI flicker during refetches
    refetchOnMount: true, // Don't refetch if data is fresh
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
    // Spread user options, they can override defaults
    ...options,
  });
}

/**
 * Hook for fetching posts by a specific author
 *
 * @param authorId - The UUID of the author
 * @param params - Additional query parameters
 * @returns Query result with posts data
 */
export function usePostsByAuthor(
  authorId: string,
  params?: Omit<PostsQueryParams, "authorId">
) {
  return useQuery({
    queryKey: ["posts", "author", authorId, params],
    queryFn: () => listPosts({ ...params, authorId }),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!authorId,
    // Performance optimizations
    placeholderData: keepPreviousData,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching a single post by ID
 *
 * @param postId - The UUID of the post
 * @param options - Optional parameters for including comments and engagement
 * @returns Query result with post data
 *
 * @example
 * ```
 * const { data: post, isLoading } = usePost(postId, {
 *   includeComments: true,
 *   commentsLimit: 50,
 * });
 * ```
 */
export function usePost(
  postId: string,
  options?: {
    includeComments?: boolean;
    commentsLimit?: number;
  }
) {
  return useQuery({
    queryKey: ["posts", postId, options],
    queryFn: () => getPostById(postId, options),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus to reduce load
    enabled: !!postId,
    // Performance optimization
    refetchOnMount: false,
  });
}

/**
 * Hook for fetching posts with infinite scroll pagination
 *
 * @param params - Query parameters for filtering (without cursor, handled by infinite query)
 * @returns Infinite query result with flattened posts array
 *
 * @example
 * ```
 * const { posts, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePosts({
 *   type: "note",
 *   limit: 20
 * });
 * ```
 */
export function useInfinitePosts(params?: Omit<PostsQueryParams, "cursor">) {
  const query = useInfiniteQuery({
    queryKey: ["posts", "infinite", params],
    queryFn: async ({ pageParam }) => {
      const response = await listPosts({
        ...params,
        cursor: pageParam,
        includeEngagement: true,
      });
      return response;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Flatten all pages into a single deduplicated array
  const posts = useMemo(() => {
    if (!query.data?.pages) return [];

    const allPosts = query.data.pages.flatMap((page) => page.data);

    // Deduplicate by ID
    const seen = new Set<string>();
    return allPosts.filter((post) => {
      if (seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });
  }, [query.data]);

  return { ...query, posts };
}

/**
 * Hook for fetching respondents of a specific post
 *
 * Returns users who started a chat in response to this post.
 * Only the post author can view respondents.
 *
 * @param postId - The UUID of the post
 * @returns Query result with respondents data
 *
 * @example
 * ```
 * const { data: respondents, isLoading } = usePostRespondents(postId);
 * ```
 */
export function usePostRespondents(postId: string) {
  return useQuery<PostRespondent[], Error>({
    queryKey: ["posts", postId, "respondents"],
    queryFn: () => getPostRespondents(postId),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!postId,
  });
}

/**
 * Hook for fetching all respondents across the user's request posts
 *
 * Returns unique users who have started chats on any of the user's request posts.
 * This is useful for populating the "past collaborators" section on the profile.
 *
 * @returns Query result with all respondents data
 *
 * @example
 * ```
 * const { data: allRespondents, isLoading } = useAllPostRespondents();
 * ```
 */
export function useAllPostRespondents() {
  return useQuery<PostRespondent[], Error>({
    queryKey: ["posts", "respondents", "all"],
    queryFn: () => getAllPostRespondents(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}
