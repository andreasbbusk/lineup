import { apiClient, handleApiError } from "./apiClient";
import type { components } from "@/app/modules/types/api";

// Re-export API types for convenience
export type BookmarkResponse = components["schemas"]["BookmarkResponse"];

/**
 * Get all bookmarks for the authenticated user
 *
 * Returns a list of all bookmarks created by the authenticated user.
 * Each bookmark includes the post details and author information.
 *
 * @returns Array of bookmarks with post details
 * @throws ApiError if request fails
 */
export async function getBookmarks(): Promise<BookmarkResponse[]> {
  const { data, error, response } = await apiClient.GET("/bookmarks");

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

/**
 * Create a bookmark for a post
 *
 * Allows the authenticated user to bookmark a post for later reference.
 * The post must exist and must not already be bookmarked by the user.
 *
 * @param postId - The UUID of the post to bookmark
 * @returns The created bookmark
 * @throws ApiError if request fails
 */
export async function createBookmark(postId: string): Promise<BookmarkResponse> {
  const { data, error, response } = await apiClient.POST("/bookmarks", {
    body: {
      postId,
      post_id: postId, // TSOA validation requires both fields
    } as { postId: string; post_id: string },
  });

  // Log full response for debugging
  console.log("Bookmark API response:", {
    hasData: !!data,
    hasError: !!error,
    status: response?.status,
    errorType: typeof error,
    errorKeys: error && typeof error === "object" ? Object.keys(error) : null,
    errorString: error ? String(error) : null,
  });

  // Handle 201 Created response (backend returns 201 but types expect 200)
  // openapi-fetch may treat 201 as error if not in types, but data might still be available
  if (response?.status === 201) {
    // If we have data, return it
    if (data) {
      return data;
    }
    // If no data but status is 201, try to extract from error object
    // openapi-fetch sometimes puts successful response data in error for non-200 status codes
    if (error && typeof error === "object") {
      const errorAny = error as any;
      // Check various possible locations
      if (errorAny.data && (errorAny.data.postId || errorAny.data.userId)) {
        return errorAny.data as BookmarkResponse;
      }
      if (errorAny.postId || errorAny.userId) {
        return error as BookmarkResponse;
      }
      if (errorAny.response?.data) {
        return errorAny.response.data as BookmarkResponse;
      }
    }
    // If status is 201 but we can't find data, it's still a success
    // Return a minimal response or throw a more helpful error
    console.warn("Received 201 Created but could not extract response data", { error, response });
    throw new Error("Bookmark created successfully but response data could not be parsed");
  }

  // For non-201 responses, handle errors normally
  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

/**
 * Remove a bookmark
 *
 * Deletes a bookmark for a specific post. Only the user who created
 * the bookmark can remove it.
 *
 * @param postId - The UUID of the post to unbookmark
 * @throws ApiError if request fails
 */
export async function deleteBookmark(postId: string): Promise<void> {
  const { error, response } = await apiClient.DELETE("/bookmarks/{postId}", {
    params: {
      path: {
        postId,
      },
    },
  });

  if (error) {
    handleApiError(error, response);
  }
}

