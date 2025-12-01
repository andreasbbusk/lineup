import { BookmarkRow } from "../../utils/supabase-helpers.js";
import { BookmarkResponse } from "../../types/api.types.js";

/**
 * Supabase bookmark response with nested post and author relations
 */
type SupabaseBookmarkWithRelations = BookmarkRow & {
  post?: {
    id: string;
    title: string;
    description: string;
    type: string;
    location: string | null;
    created_at: string | null;
    author?: {
      id: string;
      username: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
  };
};

/**
 * Maps Supabase bookmark response with nested relations to API format
 * Converts snake_case to camelCase and flattens nested structures
 */
export function mapBookmarkToResponse(
  bookmark: SupabaseBookmarkWithRelations
): BookmarkResponse {
  const result: BookmarkResponse = {
    postId: bookmark.post_id,
    userId: bookmark.user_id,
    createdAt: bookmark.created_at,
  };

  // Map post if it exists
  if (bookmark.post) {
    result.post = {
      id: bookmark.post.id,
      title: bookmark.post.title,
      description: bookmark.post.description,
      type: bookmark.post.type,
      location: bookmark.post.location,
      createdAt: bookmark.post.created_at,
    };

    // Map author if it exists
    if (bookmark.post.author) {
      result.post.author = {
        id: bookmark.post.author.id,
        username: bookmark.post.author.username,
        firstName: bookmark.post.author.first_name,
        lastName: bookmark.post.author.last_name,
        avatarUrl: bookmark.post.author.avatar_url,
      };
    }
  }

  return result;
}

/**
 * Maps array of bookmarks to API format
 */
export function mapBookmarksToResponse(
  bookmarks: SupabaseBookmarkWithRelations[]
): BookmarkResponse[] {
  return bookmarks.map(mapBookmarkToResponse);
}
