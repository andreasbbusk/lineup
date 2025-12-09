"use client";

import { useState } from "react";
import { getSignedUploadUrl } from "../api/upload";
import { supabase } from "@/app/modules/supabase/client";
import {
  compressMedia,
  shouldCompress,
} from "@/app/modules/utils/media-compression";
import type { UploadedMedia, SignedUrlRequest } from "../types";

/**
 * Hook for handling file selection and upload
 *
 * This hook provides two modes:
 * 1. createPreviewMedia: Creates blob URLs for preview (no upload to Supabase)
 * 2. uploadToSupabase: Uploads files to Supabase Storage when post is created
 *
 * @example
 * ```tsx
 * const { createPreviewMedia, uploadToSupabase, isUploading, isCompressing, error } = useUpload();
 *
 * // For preview (draft) - now async due to compression
 * const media = await createPreviewMedia(file, "post");
 *
 * // When submitting post
 * const uploadedMedia = await uploadToSupabase(media);
 * ```
 */
export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Create a preview media object with blob URL (no upload to Supabase)
   * Now includes automatic compression for images
   *
   * @param file - The file to create preview for
   * @param uploadType - "post" or "avatar" (default: "post")
   * @returns Media object with blob URL and File reference (compressed if applicable)
   */
  const createPreviewMedia = async (
    file: File,
    uploadType: "post" | "avatar" = "post"
  ): Promise<UploadedMedia> => {
    setIsCompressing(true);
    setCompressionProgress(0);
    setError(null);

    try {
      let processedFile = file;

      // Compress if needed
      if (shouldCompress(file, uploadType)) {
        console.log(
          `Compressing ${uploadType} file: ${file.name} (${(
            file.size /
            1024 /
            1024
          ).toFixed(2)}MB)`
        );

        processedFile = await compressMedia(file, uploadType, (progress) =>
          setCompressionProgress(progress)
        );

        console.log(
          `Compression complete: ${(processedFile.size / 1024 / 1024).toFixed(
            2
          )}MB`
        );
      } else {
        console.log(`Skipping compression for ${file.name}`);
      }

      // Create blob URL for preview
      const blobUrl = URL.createObjectURL(processedFile);

      // Determine media type
      const isImage = processedFile.type.startsWith("image/");
      const mediaType: "image" | "video" = isImage ? "image" : "video";

      return {
        url: blobUrl,
        type: mediaType,
        thumbnailUrl: null,
        file: processedFile, // Store compressed File object
      };
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to process file");
      console.error("Error in createPreviewMedia:", error);
      setError(error);

      // Fallback: return original file if compression fails
      const blobUrl = URL.createObjectURL(file);
      const isImage = file.type.startsWith("image/");

      return {
        url: blobUrl,
        type: isImage ? "image" : "video",
        thumbnailUrl: null,
        file,
      };
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  /**
   * Upload a file to Supabase Storage and return media object with public URL
   *
   * @param media - Media object with File reference (from createPreviewMedia)
   * @param uploadType - Type of upload: "post" or "avatar" (default: "post")
   * @returns Media object with Supabase URL and filePath for cleanup
   * @throws Error if upload fails
   */
  const uploadToSupabase = async (
    media: UploadedMedia,
    uploadType: "post" | "avatar" = "post"
  ): Promise<UploadedMedia> => {
    if (!media.file) {
      // If file is already uploaded (has filePath), return as-is
      if (media.filePath) {
        return media;
      }
      throw new Error("File object is required for upload");
    }

    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Get signed URL from backend
      const signedUrlRequest: SignedUrlRequest = {
        fileName: media.file.name,
        fileType: media.file.type,
        uploadType,
      };

      const { signedUrl, filePath } = await getSignedUploadUrl(
        signedUrlRequest
      );

      // Step 2: Upload file directly to Supabase Storage using signed URL
      console.log("Uploading to signed URL:", signedUrl);
      console.log("File path will be:", filePath);

      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: media.file,
        headers: {
          "Content-Type": media.file.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload failed:", {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorText,
        });
        throw new Error(
          `Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`
        );
      }

      console.log("Upload successful!");

      // Step 3: Construct public URL from filePath
      // Extract bucket from filePath (format: "posts/user-id/file.jpg" or "avatars/user-id/file.jpg")
      const bucket = filePath.split("/")[0];
      const pathInBucket = filePath.split("/").slice(1).join("/");

      // Get public URL from Supabase
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(pathInBucket);

      // Step 4: Clean up blob URL
      URL.revokeObjectURL(media.url);

      // Step 5: Return media object with Supabase URL
      return {
        url: publicUrl,
        type: media.type,
        thumbnailUrl: media.thumbnailUrl,
        filePath, // Store for cleanup
      };
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown upload error");
      setError(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Upload multiple media items to Supabase in parallel
   *
   * @param mediaItems - Array of media objects with File references
   * @param uploadType - Type of upload: "post" or "avatar" (default: "post")
   * @returns Array of uploaded media objects with Supabase URLs
   */
  const uploadMultipleToSupabase = async (
    mediaItems: UploadedMedia[],
    uploadType: "post" | "avatar" = "post"
  ): Promise<UploadedMedia[]> => {
    setIsUploading(true);
    setError(null);

    try {
      const uploadPromises = mediaItems.map((media) =>
        uploadToSupabase(media, uploadType)
      );
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown upload error");
      setError(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Clean up blob URLs and optionally delete files from Supabase
   *
   * @param mediaItems - Array of media items to clean up
   * @param deleteFromSupabase - Whether to delete files from Supabase storage
   */
  const cleanupMedia = async (
    mediaItems: UploadedMedia[],
    deleteFromSupabase = false
  ): Promise<void> => {
    for (const media of mediaItems) {
      // Revoke blob URLs
      if (media.file && media.url.startsWith("blob:")) {
        URL.revokeObjectURL(media.url);
      }

      // Delete from Supabase if requested and filePath exists
      if (deleteFromSupabase && media.filePath) {
        try {
          const [bucket, ...pathParts] = media.filePath.split("/");
          const pathInBucket = pathParts.join("/");
          await supabase.storage.from(bucket).remove([pathInBucket]);
        } catch (err) {
          console.error("Failed to delete file from Supabase:", err);
        }
      }
    }
  };

  return {
    createPreviewMedia,
    uploadToSupabase,
    uploadMultipleToSupabase,
    cleanupMedia,
    isUploading,
    isCompressing,
    compressionProgress,
    error,
  };
}
