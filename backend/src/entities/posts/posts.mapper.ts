// src/entities/posts/posts.mapper.ts
import { PostRow } from "../../utils/supabase-helpers.js";
import { PostResponse } from "../../types/api.types.js";

type SupabasePostWithRelations = PostRow & {
  metadata?: Array<{ metadata: any }>;
  media?: Array<{ media: any; display_order: number }>;
  tagged_users?: Array<{ user: any }>;
  author?: any;
};

/**
 * Maps Supabase post response with nested relations to flattened API response format
 */
export function mapPostToResponse(post: SupabasePostWithRelations): PostResponse {
  return {
    ...post,
    metadata:
      post.metadata?.map((pm) => pm.metadata).filter(Boolean) || [],
    media:
      post.media
        ?.map((pm) => ({
          ...pm.media,
          display_order: pm.display_order,
        }))
        .sort((a, b) => a.display_order - b.display_order) || [],
    tagged_users:
      post.tagged_users?.map((tu) => tu.user).filter(Boolean) || [],
    author: post.author,
  };
}

