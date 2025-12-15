"use client";

import { useQuery, UseQueryOptions, keepPreviousData } from "@tanstack/react-query";
import { listPosts, getPostById } from "@/app/modules/api/postsApi";
import type {
  PaginatedResponse,
  PostResponse,
  PostsQueryParams,
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
    refetchOnMount: false, // Don't refetch if data is fresh
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
    refetchOnMount: false,
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
