import { CommentRow } from "../../utils/supabase-helpers.js";
import { CommentResponse } from "../../types/api.types.js";

/**
 * Supabase comment response with nested author relation
 */
type SupabaseCommentWithRelations = CommentRow & {
  author?: {
    id: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
};

/**
 * Maps Supabase comment response with nested relations to API format
 * Converts snake_case to camelCase and includes author profile info
 */
export function mapCommentToResponse(
  comment: SupabaseCommentWithRelations
): CommentResponse {
  return {
    id: comment.id,
    postId: comment.post_id,
    authorId: comment.author_id,
    content: comment.content,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    author: comment.author
      ? {
          id: comment.author.id,
          username: comment.author.username,
          firstName: comment.author.first_name,
          lastName: comment.author.last_name,
          avatarUrl: comment.author.avatar_url,
        }
      : undefined,
  };
}

/**
 * Maps array of Supabase comment responses to API format
 */
export function mapCommentsToResponse(
  comments: SupabaseCommentWithRelations[]
): CommentResponse[] {
  return comments.map(mapCommentToResponse);
}
