import { createAuthenticatedClient } from "../../config/supabase.config.js";
import { createHttpError } from "../../utils/error-handler.js";
import { FeedPostResponse } from "../../types/api.types.js";
import { mapPostToResponse } from "../posts/posts.mapper.js";
import { PostRow } from "../../utils/supabase-helpers.js";
import { mapPostsToFeedResponse, PostEngagementData } from "./feed.mapper.js";

export class FeedService {
  /**
   * Get posts feed for authenticated user
   * Returns posts from users the authenticated user has accepted connections with
   * Includes engagement counts and user interaction state
   */
  async getPostsFeed(
    userId: string,
    token: string,
    cursor?: string,
    limit: number = 20
  ): Promise<{ posts: FeedPostResponse[]; nextCursor?: string }> {
    const authedSupabase = createAuthenticatedClient(token);

    // Get all users the authenticated user has accepted connections with
    // Get connections where user is requester
    const { data: requesterConnections } = await authedSupabase
      .from("connection_requests")
      .select("recipient_id")
      .eq("requester_id", userId)
      .eq("status", "accepted");

    // Get connections where user is recipient
    const { data: recipientConnections } = await authedSupabase
      .from("connection_requests")
      .select("requester_id")
      .eq("recipient_id", userId)
      .eq("status", "accepted");

    // Extract followed user IDs
    const followedUserIds = new Set<string>();
    requesterConnections?.forEach((conn) => {
      followedUserIds.add(conn.recipient_id);
    });
    recipientConnections?.forEach((conn) => {
      followedUserIds.add(conn.requester_id);
    });

    // If user has no connections, return empty feed
    if (followedUserIds.size === 0) {
      return { posts: [] };
    }

    // Build query for posts from followed users
    let query = authedSupabase
      .from("posts")
      .select(
        `
        *,
        author:profiles!posts_author_id_fkey(id, username, first_name, last_name, avatar_url),
        metadata:post_metadata(
          metadata:metadata(id, name, type)
        ),
        media:post_media(
          display_order,
          media:media(id, url, thumbnail_url, type)
        ),
        tagged_users:post_tagged_users(
          user:profiles!post_tagged_users_user_id_fkey(id, username, first_name, last_name, avatar_url)
        )
      `
      )
      .in("author_id", Array.from(followedUserIds))
      .order("created_at", { ascending: false })
      .limit(limit + 1); // Fetch one extra to determine if there's a next page

    // Apply cursor if provided
    if (cursor) {
      query = query.lt("created_at", cursor);
    }

    const { data: posts, error: postsError } = await query;

    if (postsError) {
      throw createHttpError({
        message: `Failed to fetch feed posts: ${postsError.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    if (!posts || posts.length === 0) {
      return { posts: [] };
    }

    // Check if there's a next page
    const hasNextPage = posts.length > limit;
    const postsToReturn = hasNextPage ? posts.slice(0, limit) : posts;
    const nextCursor = hasNextPage
      ? postsToReturn[postsToReturn.length - 1].created_at ?? undefined
      : undefined;

    // Get engagement data for all posts
    const postIds = postsToReturn.map((p) => p.id);

    // Get likes count and user's likes
    const { data: likesData } = await authedSupabase
      .from("likes")
      .select("post_id, user_id")
      .in("post_id", postIds);

    // Get bookmarks count and user's bookmarks
    const { data: bookmarksData } = await authedSupabase
      .from("bookmarks")
      .select("post_id, user_id")
      .in("post_id", postIds);

    // Get comments count
    const { data: commentsData } = await authedSupabase
      .from("comments")
      .select("post_id")
      .in("post_id", postIds);

    // Build engagement maps
    const likesCountMap = new Map<string, number>();
    const hasLikedMap = new Map<string, boolean>();
    const bookmarksCountMap = new Map<string, number>();
    const hasBookmarkedMap = new Map<string, boolean>();
    const commentsCountMap = new Map<string, number>();

    likesData?.forEach((like) => {
      if (!like.post_id) return;
      const count = likesCountMap.get(like.post_id) || 0;
      likesCountMap.set(like.post_id, count + 1);
      if (like.user_id === userId) {
        hasLikedMap.set(like.post_id, true);
      }
    });

    bookmarksData?.forEach((bookmark) => {
      const count = bookmarksCountMap.get(bookmark.post_id) || 0;
      bookmarksCountMap.set(bookmark.post_id, count + 1);
      if (bookmark.user_id === userId) {
        hasBookmarkedMap.set(bookmark.post_id, true);
      }
    });

    commentsData?.forEach((comment) => {
      const count = commentsCountMap.get(comment.post_id) || 0;
      commentsCountMap.set(comment.post_id, count + 1);
    });

    // Map posts to feed response format
    const basePosts = postsToReturn.map((post) =>
      mapPostToResponse(post as PostRow & any)
    );

    // Build engagement data map
    const engagementMap = new Map<string, PostEngagementData>();
    postsToReturn.forEach((post) => {
      engagementMap.set(post.id, {
        likesCount: likesCountMap.get(post.id) || 0,
        commentsCount: commentsCountMap.get(post.id) || 0,
        bookmarksCount: bookmarksCountMap.get(post.id) || 0,
        hasLiked: hasLikedMap.get(post.id) || false,
        hasBookmarked: hasBookmarkedMap.get(post.id) || false,
      });
    });

    const feedPosts = mapPostsToFeedResponse(basePosts, engagementMap);

    return {
      posts: feedPosts,
      nextCursor,
    };
  }

  /**
   * Get collaboration request recommendations
   * Returns collaboration requests matching user's interests/genres
   * Prioritizes new requests (< 7 days old)
   */
  async getRecommendations(
    userId: string,
    token: string,
    limit: number = 5
  ): Promise<FeedPostResponse[]> {
    const authedSupabase = createAuthenticatedClient(token);

    // Get user's profile to check genres/interests
    const { data: profile } = await authedSupabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (!profile) {
      throw createHttpError({
        message: "User profile not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Get user's genre preferences from profile metadata
    // For now, we'll get recent collaboration requests
    // TODO: Match with user's genre preferences when profile metadata is available
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recommendations, error } = await authedSupabase
      .from("posts")
      .select(
        `
        *,
        author:profiles!posts_author_id_fkey(id, username, first_name, last_name, avatar_url),
        metadata:post_metadata(
          metadata:metadata(id, name, type)
        ),
        media:post_media(
          display_order,
          media:media(id, url, thumbnail_url, type)
        ),
        tagged_users:post_tagged_users(
          user:profiles!post_tagged_users_user_id_fkey(id, username, first_name, last_name, avatar_url)
        )
      `
      )
      .eq("type", "request")
      .gte("created_at", sevenDaysAgo.toISOString())
      .neq("author_id", userId) // Exclude own posts
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw createHttpError({
        message: `Failed to fetch recommendations: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    if (!recommendations || recommendations.length === 0) {
      return [];
    }

    // Map to feed response format (engagement data not critical for recommendations)
    const basePosts = recommendations.map((post) =>
      mapPostToResponse(post as PostRow & any)
    );

    const engagementMap = new Map<string, PostEngagementData>();
    recommendations.forEach((post) => {
      engagementMap.set(post.id, {
        likesCount: 0,
        commentsCount: 0,
        bookmarksCount: 0,
        hasLiked: false,
        hasBookmarked: false,
      });
    });

    return mapPostsToFeedResponse(basePosts, engagementMap);
  }
}
