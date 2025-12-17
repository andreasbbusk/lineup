import { apiClient, handleApiError } from "./apiClient";
import type { components } from "@/app/modules/types/api";

export type CommentResponse = components["schemas"]["CommentResponse"];
export type CreateCommentBody = components["schemas"]["CreateCommentDto"];

export async function getPostComments(postId: string): Promise<CommentResponse[]> {
  const { data, error, response } = await apiClient.GET("/comments/post/{postId}", {
    params: { path: { postId } },
  });

  if (error) handleApiError(error, response);
  if (!data) throw new Error("No data returned from API");
  return data;
}

export async function createComment(
  commentData: { postId: string; content: string; parentId?: string | null }
): Promise<CommentResponse> {
  const { data, error, response } = await apiClient.POST("/comments", {
    body: {
      postId: commentData.postId,
      content: commentData.content,
      parentId: commentData.parentId || null,
    } as unknown as CreateCommentBody,
  });

  if (error) handleApiError(error, response);
  if (!data) throw new Error("No data returned from API");
  return data;
}

/**
 * Like a comment
 *
 * Adds a like from the authenticated user to the specified comment.
 *
 * @param commentId - The UUID of the comment to like
 * @throws ApiError if request fails
 */
export async function likeComment(commentId: string): Promise<void> {
  const { error, response } = await apiClient.POST("/comments/{commentId}/like", {
    params: {
      path: {
        commentId,
      },
    },
  });

  if (error) {
    handleApiError(error, response);
  }
}

/**
 * Unlike a comment
 *
 * Removes the like from the authenticated user for the specified comment.
 *
 * @param commentId - The UUID of the comment to unlike
 * @throws ApiError if request fails
 */
export async function unlikeComment(commentId: string): Promise<void> {
  const { error, response } = await apiClient.DELETE("/comments/{commentId}/like", {
    params: {
      path: {
        commentId,
      },
    },
  });

  if (error) {
    handleApiError(error, response);
  }
}

