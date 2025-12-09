"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/app/modules/api/postsApi";
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

      // Invalidate posts queries to refetch with new post
      // Using void to ignore the promise returned by invalidateQueries
      void queryClient.invalidateQueries({
        queryKey: ["posts"],
      });

      // Invalidate feed queries if they exist
      void queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      // Invalidate author's posts if we have authorId
      if (newPost.authorId) {
        void queryClient.invalidateQueries({
          queryKey: ["posts", "author", newPost.authorId],
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
