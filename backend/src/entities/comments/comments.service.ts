import {
  createAuthenticatedClient,
  supabase,
} from "../../config/supabase.config.js";
import { CommentInsert, CommentUpdate } from "../../utils/supabase-helpers.js";
import { createHttpError } from "../../utils/error-handler.js";
import {
  mapCommentsToResponse,
  mapCommentToResponse,
} from "./comments.mapper.js";
import { CommentResponse } from "../../types/api.types.js";
import { CreateCommentDto, UpdateCommentDto } from "./comments.dto.js";

export class CommentsService {
  /**
   * Get all comments for a post
   * Returns comments with author profile information
   */
  async getPostComments(postId: string): Promise<CommentResponse[]> {
    const { data: comments, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        author:profiles!comments_author_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      throw createHttpError({
        message: `Failed to fetch comments: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapCommentsToResponse(comments || []);
  }

  /**
   * Get all comments by a user
   * Returns comments with author profile information
   */
  async getUserComments(userId: string): Promise<CommentResponse[]> {
    const { data: comments, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        author:profiles!comments_author_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("author_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw createHttpError({
        message: `Failed to fetch comments: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapCommentsToResponse(comments || []);
  }

  /**
   * Create a comment on a post
   * Only authenticated users can create comments
   */
  async createComment(
    userId: string,
    data: CreateCommentDto,
    token: string
  ): Promise<CommentResponse> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    // Verify the post exists
    const { data: post, error: postError } = await authedSupabase
      .from("posts")
      .select("id")
      .eq("id", data.post_id)
      .single();

    if (postError || !post) {
      throw createHttpError({
        message: "Post not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Create the comment
    const commentInsert: CommentInsert = {
      post_id: data.post_id,
      author_id: userId,
      content: data.content.trim(),
    };

    const { data: comment, error } = await authedSupabase
      .from("comments")
      .insert(commentInsert)
      .select(
        `
        *,
        author:profiles!comments_author_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .single();

    if (error || !comment) {
      throw createHttpError({
        message: `Failed to create comment: ${error?.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapCommentToResponse(comment);
  }

  /**
   * Update a comment
   * Only the comment author can update their own comment
   */
  async updateComment(
    commentId: string,
    userId: string,
    data: UpdateCommentDto,
    token: string
  ): Promise<CommentResponse> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    // Verify the comment exists and belongs to the user
    const { data: comment, error: fetchError } = await authedSupabase
      .from("comments")
      .select("author_id")
      .eq("id", commentId)
      .single();

    if (fetchError || !comment) {
      throw createHttpError({
        message: "Comment not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    if (comment.author_id !== userId) {
      throw createHttpError({
        message: "You can only update your own comments",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Update the comment
    const updateData: CommentUpdate = {
      content: data.content.trim(),
    };

    const { data: updatedComment, error: updateError } = await authedSupabase
      .from("comments")
      .update(updateData)
      .eq("id", commentId)
      .select(
        `
        *,
        author:profiles!comments_author_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .single();

    if (updateError || !updatedComment) {
      throw createHttpError({
        message: `Failed to update comment: ${updateError?.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapCommentToResponse(updatedComment);
  }

  /**
   * Delete a comment
   * Only the comment author can delete their own comment
   */
  async deleteComment(
    commentId: string,
    userId: string,
    token: string
  ): Promise<void> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    // Verify the comment exists and belongs to the user
    const { data: comment, error: fetchError } = await authedSupabase
      .from("comments")
      .select("author_id")
      .eq("id", commentId)
      .single();

    if (fetchError || !comment) {
      throw createHttpError({
        message: "Comment not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    if (comment.author_id !== userId) {
      throw createHttpError({
        message: "You can only delete your own comments",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Delete the comment
    const { error } = await authedSupabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      throw createHttpError({
        message: `Failed to delete comment: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }
  }
}
