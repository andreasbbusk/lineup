"use client";

import { useState } from "react";
import { getSignedUploadUrl } from "../api/upload";
import { supabase } from "@/app/lib/supabase/client";
import type { UploadedMedia, SignedUrlRequest } from "../types";

/**
 * Hook for uploading files directly to Supabase Storage using signed URLs
 * 
 * This hook handles the complete upload flow:
 * 1. Requests a signed URL from the backend
 * 2. Uploads the file directly to Supabase Storage
 * 3. Constructs the public URL
 * 4. Returns a media object ready for post creation
 * 
 * @example
 * ```tsx
 * const { uploadFile, isUploading, error } = useUpload();
 * 
 * const handleFileSelect = async (file: File) => {
 *   const media = await uploadFile(file);
 *   // media.url is ready to use in post creation
 * };
 * ```
 */
export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Upload a file and return a media object
   * 
   * @param file - The file to upload
   * @param uploadType - Type of upload: "post" or "avatar" (default: "post")
   * @returns Media object with URL, type, and optional thumbnail
   * @throws Error if upload fails
   */
  const uploadFile = async (
    file: File,
    uploadType: "post" | "avatar" = "post"
  ): Promise<UploadedMedia> => {
    setIsUploading(true);
    setError(null);

    try {
      // Step 1: Get signed URL from backend
      const signedUrlRequest: SignedUrlRequest = {
        fileName: file.name,
        fileType: file.type,
        uploadType,
      };

      const { signedUrl, filePath } = await getSignedUploadUrl(signedUrlRequest);

      // Step 2: Upload file directly to Supabase Storage using signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(
          `Failed to upload file: ${uploadResponse.statusText}`
        );
      }

      // Step 3: Construct public URL from filePath
      // Extract bucket from filePath (format: "posts/user-id/file.jpg" or "avatars/user-id/file.jpg")
      const bucket = filePath.split("/")[0];
      const pathInBucket = filePath.split("/").slice(1).join("/");

      // Get public URL from Supabase
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(pathInBucket);

      // Step 4: Determine media type
      const isImage = file.type.startsWith("image/");
      const mediaType: "image" | "video" = isImage ? "image" : "video";

      // Step 5: Return media object ready for post creation
      return {
        url: publicUrl,
        type: mediaType,
        thumbnailUrl: null, // Thumbnails can be generated later if needed
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
   * Upload multiple files in parallel
   * 
   * @param files - Array of files to upload
   * @param uploadType - Type of upload: "post" or "avatar" (default: "post")
   * @returns Array of media objects
   */
  const uploadFiles = async (
    files: File[],
    uploadType: "post" | "avatar" = "post"
  ): Promise<UploadedMedia[]> => {
    setIsUploading(true);
    setError(null);

    try {
      const uploadPromises = files.map((file) => uploadFile(file, uploadType));
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

  return {
    uploadFile,
    uploadFiles,
    isUploading,
    error,
  };
}

