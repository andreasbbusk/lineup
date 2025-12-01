import {
  createAuthenticatedClient,
  supabase,
} from "../../config/supabase.config.js";
import { ReviewInsert, ReviewUpdate } from "../../utils/supabase-helpers.js";
import { createHttpError } from "../../utils/error-handler.js";
import { mapReviewsToResponse, mapReviewToResponse } from "./reviews.mapper.js";
import { ReviewResponse } from "../../types/api.types.js";
import { CreateReviewDto, UpdateReviewDto } from "./reviews.dto.js";

export class ReviewsService {
  /**
   * Get all reviews for a user
   * Returns reviews with reviewer information
   */
  async getUserReviews(userId: string): Promise<ReviewResponse[]> {
    const { data: reviews, error } = await supabase
      .from("user_reviews")
      .select(
        `
        *,
        reviewer:profiles!user_reviews_reviewer_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw createHttpError({
        message: `Failed to fetch reviews: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapReviewsToResponse(reviews || []);
  }

  /**
   * Get a review by ID
   */
  async getReviewById(reviewId: string): Promise<ReviewResponse> {
    const { data: review, error } = await supabase
      .from("user_reviews")
      .select(
        `
        *,
        reviewer:profiles!user_reviews_reviewer_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .eq("id", reviewId)
      .single();

    if (error || !review) {
      throw createHttpError({
        message: "Review not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    return mapReviewToResponse(review as any);
  }

  /**
   * Create a review for a user
   * Only authenticated users can create reviews
   * Prevents self-reviews and duplicate reviews
   */
  async createReview(
    userId: string,
    reviewerId: string,
    data: CreateReviewDto,
    token: string
  ): Promise<ReviewResponse> {
    const authedSupabase = createAuthenticatedClient(token);

    // Prevent self-reviews
    if (userId === reviewerId) {
      throw createHttpError({
        message: "You cannot review yourself",
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    // Check if review already exists
    const { data: existingReview } = await authedSupabase
      .from("user_reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("reviewer_id", reviewerId)
      .single();

    if (existingReview) {
      throw createHttpError({
        message: "You have already reviewed this user",
        statusCode: 409,
        code: "CONFLICT",
      });
    }

    // Verify the user being reviewed exists
    const { data: user } = await authedSupabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (!user) {
      throw createHttpError({
        message: "User not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Create the review
    const reviewInsert: ReviewInsert = {
      user_id: userId,
      reviewer_id: reviewerId,
      rating: data.rating,
      description: data.description ?? null,
    };

    const { data: newReview, error } = await authedSupabase
      .from("user_reviews")
      .insert(reviewInsert)
      .select(
        `
        *,
        reviewer:profiles!user_reviews_reviewer_id_fkey(
          id,
          username,
          first_name,
          last_name,
          avatar_url
        )
      `
      )
      .single();

    if (error || !newReview) {
      throw createHttpError({
        message: `Failed to create review: ${error?.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return mapReviewToResponse(newReview as any);
  }

  /**
   * Update a review
   * Only the reviewer can update their own review
   */
  async updateReview(
    reviewId: string,
    reviewerId: string,
    data: UpdateReviewDto,
    token: string
  ): Promise<ReviewResponse> {
    const authedSupabase = createAuthenticatedClient(token);

    // Verify review exists and user is the reviewer
    const { data: review, error: fetchError } = await authedSupabase
      .from("user_reviews")
      .select("reviewer_id")
      .eq("id", reviewId)
      .single();

    if (fetchError || !review) {
      throw createHttpError({
        message: "Review not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    if (review.reviewer_id !== reviewerId) {
      throw createHttpError({
        message: "You can only update your own reviews",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Update the review
    const updateData: ReviewUpdate = {};
    if (data.rating !== undefined) {
      updateData.rating = data.rating;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    const { error: updateError } = await authedSupabase
      .from("user_reviews")
      .update(updateData)
      .eq("id", reviewId);

    if (updateError) {
      throw createHttpError({
        message: `Failed to update review: ${updateError.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    // Fetch updated review
    return this.getReviewById(reviewId);
  }

  /**
   * Delete a review
   * Only the reviewer can delete their own review
   */
  async deleteReview(
    reviewId: string,
    reviewerId: string,
    token: string
  ): Promise<void> {
    const authedSupabase = createAuthenticatedClient(token);

    // Verify review exists and user is the reviewer
    const { data: review, error: fetchError } = await authedSupabase
      .from("user_reviews")
      .select("reviewer_id")
      .eq("id", reviewId)
      .single();

    if (fetchError || !review) {
      throw createHttpError({
        message: "Review not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    if (review.reviewer_id !== reviewerId) {
      throw createHttpError({
        message: "You can only delete your own reviews",
        statusCode: 403,
        code: "FORBIDDEN",
      });
    }

    // Delete the review
    const { error } = await authedSupabase
      .from("user_reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      throw createHttpError({
        message: `Failed to delete review: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }
  }
}
