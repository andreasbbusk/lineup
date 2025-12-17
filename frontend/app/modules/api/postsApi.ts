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

// ==================== Likes ====================

/**
 * Like a post
 *
 * Adds a like from the authenticated user to the specified post.
 *
 * @param postId - The UUID of the post to like
 * @throws ApiError if request fails
 */
export async function likePost(postId: string): Promise<void> {
  const { error, response } = await apiClient.POST("/posts/{id}/like", {
    params: {
      path: {
        id: postId,
      },
    },
  });

  if (error) {
    handleApiError(error, response);
  }
}

/**
 * Unlike a post
 *
 * Removes the like from the authenticated user for the specified post.
 *
 * @param postId - The UUID of the post to unlike
 * @throws ApiError if request fails
 */
export async function unlikePost(postId: string): Promise<void> {
  const { error, response } = await apiClient.DELETE("/posts/{id}/like", {
    params: {
      path: {
        id: postId,
      },
    },
  });

  if (error) {
    handleApiError(error, response);
  }
}

// ==================== Update ====================

/**
 * Update post body
 */
export interface UpdatePostBody {
  title?: string;
  description?: string;
  location?: string | null;
  paidOpportunity?: boolean | null;
}

/**
 * Update a post
 *
 * Updates a post's content. Only the post author can update their own posts.
 *
 * @param postId - The UUID of the post to update
 * @param data - The fields to update
 * @returns The updated post
 * @throws ApiError if request fails
 */
export async function updatePost(
  postId: string,
  data: UpdatePostBody
): Promise<PostResponse> {
  const { data: responseData, error, response } = await apiClient.PUT(
    "/posts/{id}",
    {
      params: {
        path: {
          id: postId,
        },
      },
      body: data,
    }
  );

  if (error) {
    handleApiError(error, response);
  }

  if (!responseData) {
    throw new Error("No data returned from API");
  }

  return responseData;
}

// ==================== Delete ====================

/**
 * Delete a post
 *
 * Permanently deletes a post and all its related data.
 * Only the post author can delete their own posts.
 *
 * @param postId - The UUID of the post to delete
 * @throws ApiError if request fails
 */
export async function deletePost(postId: string): Promise<void> {
  const { error, response } = await apiClient.DELETE("/posts/{id}", {
    params: {
      path: {
        id: postId,
      },
    },
  });

  if (error) {
    handleApiError(error, response);
  }
}

// ==================== Respondents ====================

/**
 * Post respondent user data
 */
export interface PostRespondent {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

/**
 * Get users who responded to a post by starting a chat
 *
 * Returns a list of users who initiated a conversation in response to this request post.
 * Only the post author can view respondents.
 *
 * @param postId - The UUID of the post
 * @returns List of users who started a chat on this post
 * @throws ApiError if request fails
 */
export async function getPostRespondents(
  postId: string
): Promise<PostRespondent[]> {
  const { data, error, response } = await apiClient.GET(
    "/posts/{id}/respondents",
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

  return data as PostRespondent[];
}

/**
 * Get all respondents across all of the user's request posts
 *
 * Returns unique users who have started chats on any of the user's request posts.
 * This is useful for populating the "past collaborators" section on the profile.
 *
 * @returns List of unique users who started chats on the user's posts
 * @throws ApiError if request fails
 */
export async function getAllPostRespondents(): Promise<PostRespondent[]> {
  const { data, error, response } = await apiClient.GET(
    "/posts/respondents/all"
  );

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data as PostRespondent[];
}
