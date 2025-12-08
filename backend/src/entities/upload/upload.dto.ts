import { IsEnum, IsOptional, IsString, Length } from "class-validator";

/**
 * DTO for requesting a signed upload URL
 *
 * Used to generate a temporary signed URL for direct client uploads to Supabase Storage.
 * The client will use this signed URL to upload files directly, bypassing the backend.
 *
 * @example
 * {
 *   "fileName": "my-image.jpg",
 *   "fileType": "image/jpeg",
 *   "uploadType": "post"
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

  /**
   * Upload type: "post" for post media, "avatar" for profile pictures
   * @example "post"
   */
  @IsOptional()
  @IsEnum(["post", "avatar"], {
    message: "Upload type must be 'post' or 'avatar'",
  })
  uploadType?: "post" | "avatar" = "post";
}
