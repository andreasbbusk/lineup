// src/entities/posts/posts.dto.ts
import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  ValidateNested,
  IsEnum,
  Length,
} from "class-validator";
import { Type } from "class-transformer";
import { PostInsert, PostType } from "../../utils/supabase-helpers.js";

/**
 * DTO for media items attached to posts
 *
 * @example
 * {
 *   "url": "https://example.com/image.jpg",
 *   "thumbnail_url": "https://example.com/thumb.jpg",
 *   "type": "image"
 * }
 */
export class MediaItemDto {
  /**
   * URL to the media file
   * @example "https://example.com/image.jpg"
   */
  @IsString()
  url!: string;

  /**
   * Optional thumbnail URL for the media
   * @example "https://example.com/thumb.jpg"
   */
  @IsOptional()
  @IsString()
  thumbnail_url?: string;

  /**
   * Media type: "image" or "video"
   * @example "image"
   */
  @IsString()
  type!: string;
}

/**
 * DTO for creating a new post
 *
 * Used when creating a post (note, request, or story). The author_id is
 * automatically extracted from the authentication token.
 *
 * For "note" posts, you can include tags.
 * For "request" posts, you can include genres and paid_opportunity flag.
 * All post types can include media attachments and tagged users.
 *
 * @example
 * {
 *   "type": "note",
 *   "title": "My First Post",
 *   "description": "This is a detailed description of my post",
 *   "location": "New York, NY",
 *   "tags": ["music", "jazz"],
 *   "media": [{"url": "https://example.com/image.jpg", "type": "image"}]
 * }
 */
export class CreatePostBody
  implements
    Omit<
      PostInsert,
      "id" | "author_id" | "created_at" | "updated_at" | "search_vector"
    >
{
  /**
   * Post type: "note", "request", or "story"
   * @example "note"
   */
  @IsEnum(["note", "request", "story"] as const)
  type!: PostType;

  /**
   * Post title (1-100 characters)
   * @example "Looking for a drummer"
   */
  @IsString()
  @Length(1, 100)
  title!: string;

  /**
   * Post description (10-5000 characters)
   * @example "I'm looking for an experienced drummer to join our band..."
   */
  @IsString()
  @Length(10, 5000)
  description!: string;

  /**
   * Optional location where the post is relevant
   * @example "New York, NY"
   */
  @IsOptional()
  @IsString()
  location?: string | null;

  /**
   * Whether this is a paid opportunity (only for "request" type posts)
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  paid_opportunity?: boolean | null;

  /**
   * Optional expiration date/time (ISO 8601 format)
   * @example "2024-12-31T23:59:59Z"
   */
  @IsOptional()
  @IsString()
  expires_at?: string | null;

  /**
   * Tags for "note" type posts
   * @example ["music", "jazz", "performance"]
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  /**
   * Genres for "request" type posts
   * @example ["rock", "pop", "indie"]
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  /**
   * Array of user IDs to tag in the post
   * @example ["123e4567-e89b-12d3-a456-426614174000"]
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  taggedUsers?: string[];

  /**
   * Media attachments (images or videos)
   * @example [{"url": "https://example.com/image.jpg", "type": "image"}]
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaItemDto)
  media?: MediaItemDto[];
}
