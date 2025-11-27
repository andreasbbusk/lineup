// src/entities/bookmarks/bookmarks.service.ts
import { createAuthenticatedClient } from "../../config/supabase.config.js";
import { BookmarkInsert } from "../../utils/supabase-helpers.js";
import { createHttpError } from "../../utils/error-handler.js";
import { mapBookmarksToResponse } from "./bookmarks.mapper.js";
import { BookmarkResponse } from "../../types/api.types.js";

export class BookmarksService {
  /**
   * Get all bookmarks for the authenticated user
   * Returns bookmarks with post details
   */
  async getUserBookmarks(
    userId: string,
    token: string
  ): Promise<BookmarkResponse[]> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    const { data: bookmarks, error } = await authedSupabase
      .from("bookmarks")
      .select(
        `
        *,
        post:posts!bookmarks_post_id_fkey(
          id,
          title,
          description,
          type,
          location,
          created_at,
          author:profiles!posts_author_id_fkey(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw createHttpError({
        message: `Failed to fetch bookmarks: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    // Transform to API format (snake_case to camelCase, flatten relations)
    return mapBookmarksToResponse(bookmarks || []);
  }

  /**
   * Create a bookmark for a post
   * Only the authenticated user can bookmark posts
   */
  async createBookmark(
    userId: string,
    postId: string,
    token: string
  ): Promise<BookmarkResponse> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    // Verify the post exists
    const { data: post, error: postError } = await authedSupabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      throw createHttpError({
        message: "Post not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Check if bookmark already exists
    const { data: existingBookmark } = await authedSupabase
      .from("bookmarks")
      .select("post_id, user_id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (existingBookmark) {
      throw createHttpError({
        message: "Post is already bookmarked",
        statusCode: 409,
        code: "CONFLICT",
      });
    }

    // Create the bookmark
    const bookmarkInsert: BookmarkInsert = {
      user_id: userId,
      post_id: postId,
    };

    const { data: bookmark, error } = await authedSupabase
      .from("bookmarks")
      .insert(bookmarkInsert)
      .select(
        `
        *,
        post:posts!bookmarks_post_id_fkey(
          id,
          title,
          description,
          type,
          location,
          created_at,
          author:profiles!posts_author_id_fkey(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        )
      `
      )
      .single();

    if (error || !bookmark) {
      throw createHttpError({
        message: `Failed to create bookmark: ${error?.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    // Transform to API format
    return mapBookmarksToResponse([bookmark])[0];
  }

  /**
   * Remove a bookmark
   * Only the bookmark owner can remove their bookmark
   */
  async deleteBookmark(
    userId: string,
    postId: string,
    token: string
  ): Promise<void> {
    // Create authenticated Supabase client for RLS
    const authedSupabase = createAuthenticatedClient(token);

    // Verify the bookmark exists and belongs to the user
    const { data: bookmark, error: fetchError } = await authedSupabase
      .from("bookmarks")
      .select("post_id, user_id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !bookmark) {
      throw createHttpError({
        message: "Bookmark not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Delete the bookmark
    const { error } = await authedSupabase
      .from("bookmarks")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) {
      throw createHttpError({
        message: `Failed to delete bookmark: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }
  }
}
