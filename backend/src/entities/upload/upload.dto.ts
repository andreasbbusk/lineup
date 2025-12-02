import { IsEnum, IsOptional, IsBoolean } from "class-validator";

/**
 * DTO for file upload request
 *
 * Used when uploading images or videos for posts or avatars.
 * Supports batch upload (max 4 files).
 *
 * @example
 * {
 *   "type": "post",
 *   "generateThumbnails": true
 * }
 */
export class UploadDto {
  /**
   * Upload type: "post" for post media, "avatar" for profile pictures
   * @example "post"
   */
  @IsEnum(["post", "avatar"], {
    message: "Type must be 'post' or 'avatar'",
  })
  type!: "post" | "avatar";

  /**
   * Whether to generate thumbnails for videos
   * @example true
   */
  @IsOptional()
  @IsBoolean()
  generateThumbnails?: boolean = false;
}
