"use client";

import { useState } from "react";
import { getSignedUploadUrl } from "../api/upload";
import { supabase } from "@/app/lib/supabase/client";
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
 * const { createPreviewMedia, uploadToSupabase, isUploading, error } = useUpload();
 * 
 * // For preview (draft)
 * const media = createPreviewMedia(file);
 * 
 * // When submitting post
 * const uploadedMedia = await uploadToSupabase(media);
 * ```
 */
export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Create a preview media object with blob URL (no upload to Supabase)
   * 
   * @param file - The file to create preview for
   * @returns Media object with blob URL and File reference
   */
  const createPreviewMedia = (file: File): UploadedMedia => {
    // Create blob URL for preview
    const blobUrl = URL.createObjectURL(file);
    
    // Determine media type
    const isImage = file.type.startsWith("image/");
    const mediaType: "image" | "video" = isImage ? "image" : "video";

    return {
      url: blobUrl,
      type: mediaType,
      thumbnailUrl: null,
      file, // Store File object for later upload
    };
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

      const { signedUrl, filePath } = await getSignedUploadUrl(signedUrlRequest);

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
    error,
  };
}

