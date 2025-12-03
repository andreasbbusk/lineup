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
 * Media object returned after successful upload
 * Ready to be included in post creation
 */
export interface UploadedMedia {
  url: string;
  type: "image" | "video";
  thumbnailUrl?: string | null;
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

