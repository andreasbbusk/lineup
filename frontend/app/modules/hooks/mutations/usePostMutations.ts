"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost, resolvePost } from "@/app/modules/api/postsApi";
import type { CreatePostBody, PostResponse } from "@/app/modules/api/postsApi";

/**
 * Hook for creating a new post
 *
 * Handles post creation with automatic cache invalidation and optimistic updates.
 *
 * @example
 * ```tsx
 * const { mutate: createPost, isPending } = useCreatePost();
 *
 * createPost({
 *   type: "note",
 *   title: "My Post",
 *   description: "Post content...",
 *   tags: ["music"],
 * });
 * ```
 */
export function useCreatePost(options?: {
  onSuccess?: (data: PostResponse) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: CreatePostBody): Promise<PostResponse> => {
      return createPost(postData);
    },
    onSuccess: (newPost) => {
      // Optimistic update: manually set the data for this post
      // This makes it available immediately without a refetch
      queryClient.setQueryData(["posts", newPost.id], newPost);

      // Refetch all posts queries to include the new post
      // Using refetchQueries (not invalidateQueries) to force immediate refetch
      // even when refetchOnMount is false
      void queryClient.refetchQueries({
        queryKey: ["posts"],
        exact: false, // Match all queries starting with ["posts"]
      });

      // Refetch author's posts if we have authorId
      if (newPost.authorId) {
        void queryClient.refetchQueries({
          queryKey: ["posts", "author", newPost.authorId],
          exact: false,
        });
      }

      // Call custom onSuccess if provided
      options?.onSuccess?.(newPost);
    },
    onError: (error) => {
      options?.onError?.(error as Error);
    },
  });
}

/**
 * Hook for resolving a request post
 *
 * Marks a request post as resolved and archives it. Only the post author can resolve their own posts.
 *
 * @example
 * ```tsx
 * const { mutate: resolvePost, isPending } = useResolvePost();
 *
 * resolvePost(postId, {
 *   onSuccess: () => {
 *     console.log("Post resolved!");
 *   },
 * });
 * ```
 */
export function useResolvePost(options?: {
  onSuccess?: (data: PostResponse) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string): Promise<PostResponse> => {
      return resolvePost(postId);
    },
    onSuccess: (updatedPost) => {
      // Update the post in cache
      queryClient.setQueryData(["posts", updatedPost.id], updatedPost);

      // Refetch all posts queries to reflect the resolved status
      void queryClient.refetchQueries({
        queryKey: ["posts"],
        exact: false,
      });

      // Refetch author's posts if we have authorId
      if (updatedPost.authorId) {
        void queryClient.refetchQueries({
          queryKey: ["posts", "author", updatedPost.authorId],
          exact: false,
        });
      }

      // Call custom onSuccess if provided
      options?.onSuccess?.(updatedPost);
    },
    onError: (error) => {
      options?.onError?.(error as Error);
    },
  });
}
