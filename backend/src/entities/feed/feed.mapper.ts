// src/entities/feed/feed.mapper.ts
import { PostResponse, FeedPostResponse } from "../../types/api.types.js";

/**
 * Engagement data for a post
 */
export type PostEngagementData = {
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  hasLiked: boolean;
  hasBookmarked: boolean;
};

/**
 * Maps a post with engagement data to feed response format
 * Takes a base PostResponse and adds engagement metrics
 */
export function mapPostToFeedResponse(
  post: PostResponse,
  engagement: PostEngagementData
): FeedPostResponse {
  return {
    ...post,
    likesCount: engagement.likesCount,
    commentsCount: engagement.commentsCount,
    bookmarksCount: engagement.bookmarksCount,
    hasLiked: engagement.hasLiked,
    hasBookmarked: engagement.hasBookmarked,
  };
}

/**
 * Maps array of posts with engagement data to feed response format
 */
export function mapPostsToFeedResponse(
  posts: PostResponse[],
  engagementMap: Map<string, PostEngagementData>
): FeedPostResponse[] {
  return posts.map((post) => {
    const engagement = engagementMap.get(post.id) || {
      likesCount: 0,
      commentsCount: 0,
      bookmarksCount: 0,
      hasLiked: false,
      hasBookmarked: false,
    };
    return mapPostToFeedResponse(post, engagement);
  });
}

