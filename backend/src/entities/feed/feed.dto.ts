import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from "class-validator";

/**
 * DTO for feed query parameters
 *
 * Used when fetching the home feed with different components.
 * Supports cursor-based pagination for infinite scroll.
 *
 * @example
 * {
 *   "component": "posts",
 *   "cursor": "2024-01-01T00:00:00Z",
 *   "limit": 20
 * }
 */
export class FeedQueryDto {
  /**
   * The feed component to fetch
   * - "posts": Posts from followed users (infinite scroll)
   * - "recommendations": Collaboration request recommendations
   * - "stories": Stories from followed users (coming soon)
   * @example "posts"
   */
  @IsOptional()
  @IsEnum(["posts", "recommendations", "stories"], {
    message: "Component must be 'posts', 'recommendations', or 'stories'",
  })
  component?: "posts" | "recommendations" | "stories" = "posts";

  /**
   * Cursor for pagination (ISO timestamp string)
   * Used for cursor-based pagination in infinite scroll
   * @example "2024-01-01T00:00:00Z"
   */
  @IsOptional()
  @IsString()
  cursor?: string;

  /**
   * Maximum number of items to return (1-50)
   * @example 20
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}

