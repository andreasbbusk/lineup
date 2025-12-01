import { ReviewRow } from "../../utils/supabase-helpers.js";
import { ReviewResponse } from "../../types/api.types.js";

/**
 * Partial profile structure returned by Supabase select queries
 */
type PartialProfile = {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
};

/**
 * Supabase review response with nested reviewer relation
 */
type SupabaseReviewWithRelations = ReviewRow & {
  reviewer?: PartialProfile;
};

/**
 * Maps a partial profile to a simple user object
 */
function mapPartialProfileToUser(profile: PartialProfile) {
  return {
    id: profile.id,
    username: profile.username,
    firstName: profile.first_name ?? undefined,
    lastName: profile.last_name ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
  };
}

/**
 * Maps Supabase review response with nested relations to API format
 * Converts snake_case to camelCase and includes reviewer information
 */
export function mapReviewToResponse(
  review: SupabaseReviewWithRelations
): ReviewResponse {
  return {
    id: review.id,
    userId: review.user_id,
    reviewerId: review.reviewer_id,
    rating: review.rating,
    description: review.description ?? undefined,
    createdAt: review.created_at,
    reviewer: review.reviewer
      ? mapPartialProfileToUser(review.reviewer)
      : undefined,
  };
}

/**
 * Maps array of Supabase review responses to API format
 */
export function mapReviewsToResponse(
  reviews: SupabaseReviewWithRelations[]
): ReviewResponse[] {
  return reviews.map(mapReviewToResponse);
}
