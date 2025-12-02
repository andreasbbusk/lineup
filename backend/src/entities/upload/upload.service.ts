import { createAuthenticatedClient } from "../../config/supabase.config.js";
import { createHttpError } from "../../utils/error-handler.js";
import { MediaInsert, MediaType } from "../../utils/supabase-helpers.js";
import { UploadResponse, SignedUrlResponse } from "../../types/api.types.js";
import { mapMediaToResponse } from "./upload.mapper.js";

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
   * Upload files to Supabase Storage
   * Supports batch upload (max 4 files)
   * Returns media records with URLs
   */
  async uploadFiles(
    userId: string,
    files: Express.Multer.File[],
    uploadType: "post" | "avatar",
    generateThumbnails: boolean = false,
    token: string
  ): Promise<UploadResponse> {
    const authedSupabase = createAuthenticatedClient(token);

    if (!files || files.length === 0) {
      throw createHttpError({
        message: "No files provided",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    if (files.length > MAX_FILES) {
      throw createHttpError({
        message: `Maximum ${MAX_FILES} files allowed`,
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Validate file sizes and types
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        throw createHttpError({
          message: `File ${file.originalname} exceeds maximum size of 50MB`,
          statusCode: 400,
          code: "VALIDATION_ERROR",
        });
      }

      const isValidType =
        ALLOWED_IMAGE_TYPES.includes(file.mimetype) ||
        ALLOWED_VIDEO_TYPES.includes(file.mimetype);

      if (!isValidType) {
        throw createHttpError({
          message: `File type ${file.mimetype} not allowed`,
          statusCode: 400,
          code: "VALIDATION_ERROR",
        });
      }
    }

    // Determine storage bucket based on upload type
    const bucket = uploadType === "avatar" ? "avatars" : "posts";

    // Upload files to Supabase Storage
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${userId}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `${bucket}/${fileName}`;

      // Determine media type
      const mediaType: MediaType = ALLOWED_IMAGE_TYPES.includes(file.mimetype)
        ? "image"
        : "video";

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } =
        await authedSupabase.storage
          .from(bucket)
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

      if (uploadError || !uploadData) {
        throw createHttpError({
          message: `Failed to upload file: ${uploadError?.message}`,
          statusCode: 500,
          code: "UPLOAD_ERROR",
        });
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = authedSupabase.storage.from(bucket).getPublicUrl(filePath);

      // Generate thumbnail for videos if requested
      let thumbnailUrl: string | null = null;
      if (mediaType === "video" && generateThumbnails) {
        // Note: Thumbnail generation would typically be done via a background job
        // For now, we'll set it to null and it can be generated asynchronously
        // In production, you might want to use a service like Cloudinary or FFmpeg
        thumbnailUrl = null;
      }

      // Create media record in database
      const mediaInsert: MediaInsert = {
        url: publicUrl,
        thumbnail_url: thumbnailUrl,
        type: mediaType,
      };

      const { data: mediaRecord, error: mediaError } = await authedSupabase
        .from("media")
        .insert(mediaInsert)
        .select()
        .single();

      if (mediaError || !mediaRecord) {
        // Clean up uploaded file if database insert fails
        await authedSupabase.storage.from(bucket).remove([filePath]);

        throw createHttpError({
          message: `Failed to create media record: ${mediaError?.message}`,
          statusCode: 500,
          code: "DATABASE_ERROR",
        });
      }

      return mapMediaToResponse(mediaRecord);
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return { files: uploadedFiles };
  }

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
    token: string
  ): Promise<SignedUrlResponse> {
    const authedSupabase = createAuthenticatedClient(token);

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

    // Generate unique file path
    const fileExt = fileName.split(".").pop() || "";
    const uniqueFileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `posts/${userId}/${uniqueFileName}`;

    // Generate signed upload URL
    const { data: signedUrlData, error: signedUrlError } =
      await authedSupabase.storage
        .from("posts")
        .createSignedUploadUrl(filePath);

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
