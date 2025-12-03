import { handleApiError } from "@/app/lib/api/api-client";
import { useAppStore } from "@/app/lib/stores/app-store";
import type { SignedUrlResponse, SignedUrlRequest } from "../types";

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
  // Note: The signed-url endpoint may not be in generated types yet
  // We'll use a manual fetch call until types are regenerated
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  const token = useAppStore.getState().accessToken;

  const response = await fetch(`${baseUrl}/api/upload/signed-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      fileName: request.fileName,
      fileType: request.fileType,
      uploadType: request.uploadType || "post",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Failed to get signed URL",
      code: "UPLOAD_ERROR",
    }));
    handleApiError(error, response);
  }

  const data = await response.json();
  return data;
}

