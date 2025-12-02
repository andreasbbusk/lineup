import { IsEnum, IsOptional, IsBoolean, IsString, Length } from "class-validator";

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

/**
 * DTO for requesting a signed upload URL
 *
 * Used to generate a temporary signed URL for direct client uploads to Supabase Storage.
 * The client will use this signed URL to upload files directly, bypassing the backend.
 *
 * @example
 * {
 *   "fileName": "my-image.jpg",
 *   "fileType": "image/jpeg"
 * }
 */
export class SignedUrlRequestDto {
  /**
   * Original file name (used to determine file extension)
   * @example "my-image.jpg"
   */
  @IsString()
  @Length(1, 255)
  fileName!: string;

  /**
   * MIME type of the file (used for validation)
   * @example "image/jpeg"
   */
  @IsString()
  fileType!: string;
}
