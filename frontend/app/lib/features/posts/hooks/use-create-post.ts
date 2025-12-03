"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../api/posts";
import type { CreatePostBody, PostResponse } from "../types";

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
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postData: CreatePostBody): Promise<PostResponse> => {
      return createPost(postData);
    },
    onSuccess: (newPost) => {
      // Invalidate posts queries to refetch with new post
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });

      // Invalidate feed queries
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      // Invalidate author's posts if we have authorId
      if (newPost.authorId) {
        queryClient.invalidateQueries({
          queryKey: ["posts", "author", newPost.authorId],
        });
      }
    },
  });
}

