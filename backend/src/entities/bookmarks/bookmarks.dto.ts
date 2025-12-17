import { IsString, IsUUID } from "class-validator";

/**
 * DTO for creating a bookmark
 *
 * Used when a user wants to bookmark a post for later reference.
 * The user_id is automatically extracted from the authentication token.
 *
 * @example
 * {
 *   "postId": "123e4567-e89b-12d3-a456-426614174000"
 * }
 */
export class CreateBookmarkDto {
  /**
   * The UUID of the post to bookmark
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsUUID(4, { message: "Post ID must be a valid UUID" })
  @IsString({ message: "Post ID is required" })
  postId!: string;
}
