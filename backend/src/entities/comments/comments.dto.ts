import { IsString, IsUUID, Length, IsOptional } from "class-validator";
import { CommentInsert } from "../../utils/supabase-helpers.js";

// Type helper to convert snake_case to camelCase for interface compatibility
type CamelCaseCommentInsert = Omit<
  CommentInsert,
  "author_id" | "created_at" | "updated_at" | "id" | "post_id" | "parent_id"
> & {
  postId: string;
  parentId?: string | null;
};

/**
 * DTO for creating a comment
 *
 * Used when creating a comment on a post. The author_id is automatically
 * extracted from the authentication token.
 *
 * @example
 * {
 *   "postId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
 *   "content": "Great post! Looking forward to collaborating."
 * }
 */
export class CreateCommentDto implements CamelCaseCommentInsert {
  /**
   * The ID of the post to comment on (UUID format)
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsUUID(4, { message: "Post ID must be a valid UUID" })
  @IsString({ message: "Post ID is required" })
  postId!: string;

  /**
   * The comment content (1-1000 characters)
   * @example "Great post! Looking forward to collaborating."
   */
  @IsString({ message: "Content is required" })
  @Length(1, 1000, {
    message: "Comment content must be between 1 and 1000 characters",
  })
  content!: string;

  /**
   * Optional parent comment ID for nested replies (UUID format)
   * If provided, this comment will be a reply to the parent comment
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsOptional()
  @IsUUID(4, { message: "Parent ID must be a valid UUID" })
  parentId?: string | null;
}

/**
 * DTO for updating a comment
 *
 * Used when updating an existing comment. Only the content can be updated.
 *
 * @example
 * {
 *   "content": "Updated comment text"
 * }
 */
export class UpdateCommentDto {
  /**
   * The updated comment content (1-1000 characters)
   * @example "Updated comment text"
   */
  @IsString({ message: "Content is required" })
  @Length(1, 1000, {
    message: "Comment content must be between 1 and 1000 characters",
  })
  content!: string;
}
