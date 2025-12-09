import { apiClient, handleApiError } from "@/app/modules/api/apiClient";
import { supabase } from "@/app/modules/supabase/client";
import type { components } from "@/app/modules/types/api";
import type {
  PostResponse,
  CreatePostBody,
  PostsQueryParams,
  PaginatedResponse,
} from "../types";

// Re-export types for convenience
export type { PostResponse, CreatePostBody };

/**
 * Create a new post
 *
 * Creates a new post (note, request, or story) with optional metadata, media,
 * and tagged users. The post is automatically associated with the authenticated user.
 *
 * @param postData - Post data including type, title, description, and optional fields
 * @returns The created post with all related data
 * @throws ApiError if request fails
 */
export async function createPost(
  postData: CreatePostBody
): Promise<PostResponse> {
  const { data, error, response } = await apiClient.POST("/posts", {
    body: postData,
  });

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

/**
 * List posts with filters and pagination
 *
 * Returns a paginated list of posts with optional filters.
 * Supports filtering by type, author, location, genres, tags, and paid opportunities.
 * Can optionally include engagement data (requires authentication).
 *
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of posts
 * @throws ApiError if request fails
 */
export async function listPosts(
  params?: PostsQueryParams
): Promise<PaginatedResponse<PostResponse>> {
  // Note: GET /posts may not be in generated types yet
  // We'll use a manual fetch call until types are regenerated
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append("type", params.type);
  if (params?.authorId) queryParams.append("authorId", params.authorId);
  if (params?.cursor) queryParams.append("cursor", params.cursor);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.includeEngagement)
    queryParams.append("includeEngagement", "true");
  if (params?.includeMedia !== undefined)
    queryParams.append("includeMedia", params.includeMedia.toString());
  if (params?.genreIds) {
    params.genreIds.forEach((id) => queryParams.append("genreIds", id));
  }
  if (params?.tags) {
    params.tags.forEach((tag) => queryParams.append("tags", tag));
  }
  if (params?.location) queryParams.append("location", params.location);
  if (params?.paidOnly !== undefined)
    queryParams.append("paidOnly", params.paidOnly.toString());

  // Ensure baseUrl doesn't already end with /api
  // If baseUrl is "http://localhost:3001/api", use it as-is
  // If baseUrl is "http://localhost:3001", add /api
  const apiBase = baseUrl.endsWith("/api") ? baseUrl.slice(0, -4) : baseUrl;
  const response = await fetch(
    `${apiBase}/api/posts${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Failed to fetch posts",
      code: "FETCH_ERROR",
    }));
    handleApiError(error, response);
  }

  const data = await response.json();
  return data;
}

/**
 * Get a single post by ID
 *
 * Returns a single post with full details including author, metadata, media, and tagged users.
 * Can optionally include comments and engagement data (requires authentication).
 *
 * @param postId - The UUID of the post to retrieve
 * @param options - Optional parameters for including comments and engagement
 * @returns The post with all related data, optional comments, and optional engagement
 * @throws ApiError if request fails
 */
export async function getPostById(
  postId: string,
  options?: {
    includeComments?: boolean;
    commentsLimit?: number;
  }
): Promise<
  PostResponse & {
    comments?: components["schemas"]["CommentResponse"][];
    likesCount?: number;
    commentsCount?: number;
    bookmarksCount?: number;
    hasLiked?: boolean;
    hasBookmarked?: boolean;
  }
> {
  // Note: GET /posts/:id may not be in generated types yet
  // We'll use a manual fetch call until types are regenerated
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const queryParams = new URLSearchParams();
  if (options?.includeComments) queryParams.append("includeComments", "true");
  if (options?.commentsLimit)
    queryParams.append("commentsLimit", options.commentsLimit.toString());

  // Ensure baseUrl doesn't already end with /api
  // If baseUrl is "http://localhost:3001/api", remove /api
  // If baseUrl is "http://localhost:3001", use as-is
  const apiBase = baseUrl.endsWith("/api") ? baseUrl.slice(0, -4) : baseUrl;
  const response = await fetch(
    `${apiBase}/api/posts/${postId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Failed to fetch post",
      code: "FETCH_ERROR",
    }));
    handleApiError(error, response);
  }

  const data = await response.json();
  return data;
}
