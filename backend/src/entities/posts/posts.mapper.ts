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
 * Maps Supabase post response (snake_case) to API response format (camelCase)
 * Transforms database format to API contract format
 */
export function mapPostToResponse(post: SupabasePostWithRelations): PostResponse {
  return {
    id: post.id,
    type: post.type,
    title: post.title,
    description: post.description,
    authorId: post.author_id,
    createdAt: post.created_at ?? null,
    updatedAt: post.updated_at ?? null,
    location: post.location ?? null,
    paidOpportunity: post.paid_opportunity ?? null,
    expiresAt: post.expires_at ?? null,
    status: (post as any).status ?? "active",
    resolvedAt: (post as any).resolved_at ?? null,
    metadata:
      post.metadata?.map((pm) => pm.metadata).filter(Boolean) || [],
    media:
      post.media
        ?.map((pm) => ({
          id: pm.media.id,
          url: pm.media.url,
          thumbnailUrl: pm.media.thumbnail_url ?? null,
          type: pm.media.type,
          displayOrder: pm.display_order,
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder) || [],
    taggedUsers:
      post.tagged_users?.map((tu) => ({
        id: tu.user.id,
        username: tu.user.username,
        firstName: tu.user.first_name ?? null,
        lastName: tu.user.last_name ?? null,
        avatarUrl: tu.user.avatar_url ?? null,
      })) || [],
    author: post.author
      ? {
          id: post.author.id,
          username: post.author.username,
          firstName: post.author.first_name ?? null,
          lastName: post.author.last_name ?? null,
          avatarUrl: post.author.avatar_url ?? null,
        }
      : undefined,
  };
}

