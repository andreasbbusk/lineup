import { apiClient, handleApiError } from "./apiClient";
import type { components } from "@/app/modules/types/api";

// ==================== Types ====================

// Re-export API types for convenience
export type PostResponse = components["schemas"]["PostResponse"];
export type CreatePostBody = components["schemas"]["CreatePostBody"];

/**
 * Posts query parameters
 */
export interface PostsQueryParams {
  type?: "note" | "request" | "story";
  status?: "active" | "resolved" | "archived";
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

// ==================== Create ====================

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

// ==================== Read ====================

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
  const { data, error, response } = await apiClient.GET("/posts", {
    params: {
      query: params,
    },
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
  const { data, error, response } = await apiClient.GET("/posts/{id}", {
    params: {
      path: {
        id: postId,
      },
      query: {
        includeComments: options?.includeComments,
        commentsLimit: options?.commentsLimit,
      },
    },
  });

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

// ==================== Resolve ====================

/**
 * Resolve a request post
 *
 * Marks a request post as resolved and archives it. Only the post author can resolve their own posts.
 * Resolved posts are excluded from the main feed but remain accessible via user's post history.
 *
 * @param postId - The UUID of the post to resolve
 * @returns The updated post with resolved status
 * @throws ApiError if request fails
 */
export async function resolvePost(postId: string): Promise<PostResponse> {
  const { data, error, response } = await apiClient.POST(
    "/posts/{id}/resolve",
    {
      params: {
        path: {
          id: postId,
        },
      },
    }
  );

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}
