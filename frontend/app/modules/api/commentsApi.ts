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
      post_id: commentData.postId,
      postId: commentData.postId,
      content: commentData.content,
      parentId: commentData.parentId || null,
    },
  });

  if (error) handleApiError(error, response);
  if (!data) throw new Error("No data returned from API");
  return data;
}


