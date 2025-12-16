import { createAuthenticatedClient } from "../../config/supabase.config.js";
import { createHttpError } from "../../utils/error-handler.js";
import { SignedUrlResponse } from "../../types/api.types.js";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 4;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export class UploadService {
  /**
   * Delete a media file from storage and database
   * Only the owner can delete their media
   */
  async deleteMedia(
    mediaId: string,
    userId: string,
    token: string
  ): Promise<void> {
    const authedSupabase = createAuthenticatedClient(token);

    // Get media record to find the file path
    const { data: media, error: fetchError } = await authedSupabase
      .from("media")
      .select("url")
      .eq("id", mediaId)
      .single();

    if (fetchError || !media) {
      throw createHttpError({
        message: "Media not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Extract file path from URL
    // Supabase Storage URLs format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlParts = media.url.split("/");
    const bucketIndex = urlParts.indexOf("public") + 1;
    if (bucketIndex === 0 || bucketIndex >= urlParts.length) {
      throw createHttpError({
        message: "Invalid media URL format",
        statusCode: 500,
        code: "INTERNAL_ERROR",
      });
    }

    const bucket = urlParts[bucketIndex];
    const filePath = urlParts.slice(bucketIndex + 1).join("/");

    // Delete from storage
    const { error: storageError } = await authedSupabase.storage
      .from(bucket)
      .remove([filePath]);

    if (storageError) {
      // Log error but continue with database deletion
      console.error("Failed to delete file from storage:", storageError);
    }

    // Delete from database
    const { error: deleteError } = await authedSupabase
      .from("media")
      .delete()
      .eq("id", mediaId);

    if (deleteError) {
      throw createHttpError({
        message: `Failed to delete media: ${deleteError.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }
  }

  /**
   * Generate a signed upload URL for direct client uploads
   * Validates file type, generates unique file path, and returns signed URL
   */
  async generateSignedUploadUrl(
    userId: string,
    fileName: string,
    fileType: string,
    uploadType: "post" | "avatar",
    token: string
  ): Promise<SignedUrlResponse> {
    // Validate file type
    const isValidType =
      ALLOWED_IMAGE_TYPES.includes(fileType) ||
      ALLOWED_VIDEO_TYPES.includes(fileType);

    if (!isValidType) {
      throw createHttpError({
        message: `File type ${fileType} not allowed. Allowed types: ${[
          ...ALLOWED_IMAGE_TYPES,
          ...ALLOWED_VIDEO_TYPES,
        ].join(", ")}`,
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Determine storage bucket based on upload type
    const bucket = uploadType === "avatar" ? "avatars" : "posts";

    // Generate unique file path
    const fileExt = fileName.split(".").pop() || "";
    const uniqueFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    
    // Path relative to bucket (for upload - doesn't include bucket name)
    const pathInBucket = `${userId}/${uniqueFileName}`;
    
    // Full file path including bucket (for frontend URL construction)
    const filePath = `${bucket}/${pathInBucket}`;

    // Use authenticated client to respect Row Level Security
    const authedSupabase = createAuthenticatedClient(token);

    // Generate signed upload URL for new file uploads
    // createSignedUploadUrl expects path relative to bucket (not including bucket name)
    const { data: signedUrlData, error: signedUrlError } =
      await authedSupabase.storage
        .from(bucket)
        .createSignedUploadUrl(pathInBucket);

    if (signedUrlError || !signedUrlData) {
      throw createHttpError({
        message: `Failed to generate signed URL: ${signedUrlError?.message}`,
        statusCode: 500,
        code: "UPLOAD_ERROR",
      });
    }

    return {
      signedUrl: signedUrlData.signedUrl,
      filePath: filePath,
    };
  }
}
