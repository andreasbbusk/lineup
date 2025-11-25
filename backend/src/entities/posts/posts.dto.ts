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

export class MediaItemDto {
  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  thumbnail_url?: string;

  @IsString()
  type!: string;
}

// CreatePostBody aligns with PostInsert, excluding auto-generated fields
// and including extra fields for related tables (tags, genres, media, taggedUsers)
export class CreatePostBody
  implements
    Omit<
      PostInsert,
      "id" | "author_id" | "created_at" | "updated_at" | "search_vector"
    >
{
  @IsEnum(["note", "request", "story"] as const)
  type!: PostType;

  @IsString()
  @Length(1, 100)
  title!: string;

  @IsString()
  @Length(10, 5000)
  description!: string;

  @IsOptional()
  @IsString()
  location?: string | null;

  @IsOptional()
  @IsBoolean()
  paid_opportunity?: boolean | null;

  @IsOptional()
  @IsString()
  expires_at?: string | null;

  // Extra fields not in PostInsert but used for related tables
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]; // Used for post_metadata table

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[]; // Used for post_metadata table

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  taggedUsers?: string[]; // Used for post_tagged_users table

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaItemDto)
  media?: MediaItemDto[]; // Used for post_media table
}
