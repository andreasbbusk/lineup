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
  private readonly MAX_COMMENT_DEPTH = 3;

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

    // Map comments and organize them hierarchically
    const allComments = mapCommentsToResponse(comments || []);
    
    // Build comment tree: separate top-level comments and replies
    const commentMap = new Map<string, CommentResponse>();
    const topLevelComments: CommentResponse[] = [];

    // First pass: create map and identify top-level comments
    for (const comment of allComments) {
      commentMap.set(comment.id, { ...comment, replies: [] });
      // Check if parent_id exists (it will be in the raw data)
      const rawComment = comments?.find((c: any) => c.id === comment.id);
      if (!rawComment?.parent_id) {
        topLevelComments.push(commentMap.get(comment.id)!);
      }
    }

    // Second pass: attach replies to their parents (sort by created_at)
    for (const comment of allComments) {
      const rawComment = comments?.find((c: any) => c.id === comment.id);
      if (rawComment?.parent_id) {
        const parent = commentMap.get(rawComment.parent_id);
        if (parent) {
          if (!parent.replies) {
            parent.replies = [];
          }
          parent.replies.push(commentMap.get(comment.id)!);
        }
      }
    }

    // Sort replies by created_at within each parent
    const sortReplies = (comment: CommentResponse) => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return aTime - bTime;
        });
        comment.replies.forEach(sortReplies);
      }
    };

    topLevelComments.forEach(sortReplies);

    return topLevelComments;
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
      .eq("id", data.postId)
      .single();

    if (postError || !post) {
      throw createHttpError({
        message: "Post not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // If parentId is provided, verify the parent comment exists and belongs to the same post
    if (data.parentId) {
      const { data: parentComment, error: parentError } = await authedSupabase
        .from("comments")
        .select("id, post_id")
        .eq("id", data.parentId)
        .single();

      if (parentError || !parentComment) {
        throw createHttpError({
          message: "Parent comment not found",
          statusCode: 404,
          code: "NOT_FOUND",
        });
      }

      if (parentComment.post_id !== data.postId) {
        throw createHttpError({
          message: "Parent comment does not belong to the same post",
          statusCode: 400,
          code: "VALIDATION_ERROR",
        });
      }

      // Validate comment depth - traverse up the parent chain to calculate depth
      let currentParentId = data.parentId;
      let depth = 1; // Start at depth 1 (the parent we're replying to)
      
      while (currentParentId && depth < this.MAX_COMMENT_DEPTH) {
        const { data: parent, error: parentDepthError } = await authedSupabase
          .from("comments")
          .select("parent_id")
          .eq("id", currentParentId)
          .single();

        if (parentDepthError || !parent) {
          break; // Stop if we can't find parent (shouldn't happen, but safe)
        }

        if (!parent.parent_id) {
          break; // Reached top-level comment
        }

        currentParentId = parent.parent_id;
        depth++;
      }

      if (depth >= this.MAX_COMMENT_DEPTH) {
        throw createHttpError({
          message: `Maximum comment depth of ${this.MAX_COMMENT_DEPTH} exceeded`,
          statusCode: 400,
          code: "VALIDATION_ERROR",
        });
      }
    }

    // Create the comment
    const commentInsert: CommentInsert & { parent_id?: string | null } = {
      post_id: data.postId,
      author_id: userId,
      content: data.content.trim(),
      parent_id: data.parentId || null,
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
