import { Request as ExpressRequest } from "express";
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Path,
  Body,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { extractUserId } from "../../entities/auth/auth.service.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { ReviewsService } from "./reviews.service.js";
import { CreateReviewDto, UpdateReviewDto } from "./reviews.dto.js";
import { ReviewResponse } from "../../types/api.types.js";
import { supabase } from "../../config/supabase.config.js";
import { createHttpError } from "../../utils/error-handler.js";

@Route("users/{username}/reviews")
@Tags("Reviews")
export class ReviewsController extends Controller {
  private reviewsService = new ReviewsService();

  /**
   * Get all reviews for a user
   *
   * Returns all reviews for a specific user with reviewer information.
   * This endpoint is public and does not require authentication.
   *
   * @summary Get user reviews
   * @param username The username of the user to retrieve reviews for
   * @returns Array of reviews with reviewer details
   * @throws 404 if user not found
   */
  @Get("/")
  public async getUserReviews(
    @Path() username: string
  ): Promise<ReviewResponse[]> {
    return handleControllerRequest(this, async () => {
      // Get user ID from username
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();

      if (!profile) {
        throw createHttpError({
          message: "User not found",
          statusCode: 404,
          code: "NOT_FOUND",
        });
      }

      return this.reviewsService.getUserReviews(profile.id);
    });
  }

  /**
   * Create a review for a user
   *
   * Allows the authenticated user to write a review for another user.
   * Prevents self-reviews and duplicate reviews.
   *
   * @summary Create a review
   * @param username The username of the user being reviewed
   * @param body Review data including rating (1-5) and optional description
   * @returns The newly created review
   * @throws 400 if validation fails or self-review attempted
   * @throws 401 if not authenticated
   * @throws 404 if user not found
   * @throws 409 if review already exists
   */
  @Security("bearerAuth")
  @Post("/")
  public async createReview(
    @Path() username: string,
    @Body() body: CreateReviewDto,
    @Request() request?: ExpressRequest
  ): Promise<ReviewResponse> {
    return handleControllerRequest(
      this,
      async () => {
        const reviewerId = await extractUserId(request!);
        const token =
          request!.headers.authorization?.replace("Bearer ", "") || "";

        // Get user ID from username
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .single();

        if (!profile) {
          throw createHttpError({
            message: "User not found",
            statusCode: 404,
            code: "NOT_FOUND",
          });
        }

        return this.reviewsService.createReview(
          profile.id,
          reviewerId,
          body,
          token
        );
      },
      201
    );
  }
}

@Route("reviews")
@Tags("Reviews")
export class ReviewsByIdController extends Controller {
  private reviewsService = new ReviewsService();

  /**
   * Get a review by ID
   *
   * Returns a specific review with reviewer information.
   * This endpoint is public and does not require authentication.
   *
   * @summary Get review by ID
   * @param reviewId The UUID of the review to retrieve
   * @returns The review with reviewer details
   * @throws 404 if review not found
   */
  @Get("{reviewId}")
  public async getReview(@Path() reviewId: string): Promise<ReviewResponse> {
    return handleControllerRequest(this, () =>
      this.reviewsService.getReviewById(reviewId)
    );
  }

  /**
   * Update a review
   *
   * Updates the rating and/or description of a review.
   * Only the reviewer can update their own review.
   *
   * @summary Update a review
   * @param reviewId The UUID of the review to update
   * @param body Updated review data (rating and/or description)
   * @returns The updated review
   * @throws 400 if validation fails
   * @throws 401 if not authenticated
   * @throws 403 if user is not the reviewer
   * @throws 404 if review not found
   */
  @Security("bearerAuth")
  @Patch("{reviewId}")
  public async updateReview(
    @Path() reviewId: string,
    @Body() body: UpdateReviewDto,
    @Request() request?: ExpressRequest
  ): Promise<ReviewResponse> {
    return handleControllerRequest(this, async () => {
      const reviewerId = await extractUserId(request!);
      const token =
        request!.headers.authorization?.replace("Bearer ", "") || "";

      return this.reviewsService.updateReview(
        reviewId,
        reviewerId,
        body,
        token
      );
    });
  }

  /**
   * Delete a review
   *
   * Permanently deletes a review.
   * Only the reviewer can delete their own review.
   *
   * @summary Delete a review
   * @param reviewId The UUID of the review to delete
   * @returns No content on success
   * @throws 401 if not authenticated
   * @throws 403 if user is not the reviewer
   * @throws 404 if review not found
   */
  @Security("bearerAuth")
  @Delete("{reviewId}")
  public async deleteReview(
    @Path() reviewId: string,
    @Request() request?: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const reviewerId = await extractUserId(request!);
        const token =
          request!.headers.authorization?.replace("Bearer ", "") || "";

        return this.reviewsService.deleteReview(reviewId, reviewerId, token);
      },
      204
    );
  }
}
