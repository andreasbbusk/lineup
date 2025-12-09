import { apiClient, handleApiError } from "./apiClient";
import type { components } from "@/app/modules/types/api";

// ==================== Types ====================

/**
 * Signed URL response from backend
 * Used for direct uploads to Supabase Storage
 */
export type SignedUrlResponse = components["schemas"]["SignedUrlResponse"];

/**
 * Request body for getting a signed upload URL
 */
export type SignedUrlRequest = components["schemas"]["SignedUrlRequestDto"];

/**
 * Media object for both draft and uploaded states
 * - Draft: contains File object and blobUrl for preview
 * - Uploaded: contains url (Supabase URL) and filePath for cleanup
 */
export interface UploadedMedia {
  url: string; // blobUrl for drafts, Supabase URL for uploaded
  type: "image" | "video";
  thumbnailUrl?: string | null;
  file?: File; // Only present for draft media (before upload)
  filePath?: string; // Path in Supabase storage, set after upload, used for cleanup
}

// ==================== Signed URLs ====================

/**
 * Get a signed upload URL for direct client uploads to Supabase Storage
 *
 * This endpoint returns a temporary signed URL that allows the client to upload
 * files directly to Supabase Storage, bypassing the backend. This improves
 * scalability by avoiding large file buffers in the Node.js server.
 *
 * @param request - File name, MIME type, and optional upload type
 * @returns Signed URL and file path for direct upload
 * @throws ApiError if request fails
 */
export async function getSignedUploadUrl(
  request: SignedUrlRequest
): Promise<SignedUrlResponse> {
  // Create a timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const { data, error, response } = await apiClient.POST(
      "/upload/signed-url",
      {
        body: {
          fileName: request.fileName,
          fileType: request.fileType,
          uploadType: request.uploadType || "post",
        },
        signal: controller.signal, // Pass the abort signal to fetch
      }
    );

    if (error) {
      handleApiError(error, response);
    }

    if (!data) {
      throw new Error("No data returned from API");
    }

    return data;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error("Request timeout while getting signed URL");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
