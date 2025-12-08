import type { components } from "@/app/lib/types/api";

// Re-export API types for convenience
export type PostResponse = components["schemas"]["PostResponse"];
export type CreatePostBody = components["schemas"]["CreatePostBody"];
export type MediaItemDto = components["schemas"]["MediaItemDto"];

/**
 * Signed URL response from backend
 * Used for direct uploads to Supabase Storage
 */
export interface SignedUrlResponse {
  signedUrl: string;
  filePath: string;
}

/**
 * Request body for getting a signed upload URL
 */
export interface SignedUrlRequest {
  fileName: string;
  fileType: string;
  uploadType?: "post" | "avatar";
}

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

/**
 * Posts query parameters
 */
export interface PostsQueryParams {
  type?: "note" | "request" | "story";
  authorId?: string;
  cursor?: string;
  limit?: number;
  includeEngagement?: boolean;
  includeMedia?: boolean;
  genreIds?: string[];
  tags?: string[];
  location?: string;
  paidOnly?: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor?: string;
    hasMore: boolean;
  };
}

