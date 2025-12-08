// Controller for user details (social media, FAQ, looking for)
import { Request as ExpressRequest } from "express";
import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { supabase } from "../../config/supabase.config.js";
import {
  UserSocialMediaResponse,
  UserFaqResponse,
  UserLookingForResponse,
  FaqQuestionResponse,
} from "../../types/api.types.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { createHttpError } from "../../utils/error-handler.js";
import { extractUserId } from "../../utils/auth-helpers.js";
import { UserDetailsService } from "./user-details.service.js";
import {
  UpdateSocialMediaDto,
  UpsertFaqDto,
  DeleteFaqDto,
} from "./user-details.dto.js";

@Route("users/{username}")
@Tags("User Details")
export class UserDetailsController extends Controller {
  private userDetailsService = new UserDetailsService();

  /**
   * Get user's social media links
   *
   * Returns all social media platform links for the specified user.
   * This endpoint is public and does not require authentication.
   *
   * @summary Get user social media
   * @param username The username of the user
   * @returns User's social media links
   * @throws 404 if user not found
   */
  @Get("social-media")
  public async getUserSocialMedia(
    @Path() username: string
  ): Promise<UserSocialMediaResponse> {
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

      return this.userDetailsService.getUserSocialMedia(profile.id);
    });
  }

  /**
   * Update user's social media links
   *
   * Updates the authenticated user's social media links.
   * Only the profile owner can update their own social media.
   *
   * @summary Update user social media
   * @param username The username (must match authenticated user)
   * @param body Social media links to update
   * @returns Updated social media links
   * @throws 401 if not authenticated
   * @throws 403 if trying to update another user's social media
   * @throws 404 if user not found
   */
  @Security("bearerAuth")
  @Put("social-media")
  public async updateUserSocialMedia(
    @Path() username: string,
    @Body() body: UpdateSocialMediaDto,
    @Request() request: ExpressRequest
  ): Promise<UserSocialMediaResponse> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request);
      const token = request.headers.authorization?.replace("Bearer ", "") || "";

      // Get user ID from username and verify ownership
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

      if (profile.id !== userId) {
        throw createHttpError({
          message: "You can only update your own social media",
          statusCode: 403,
          code: "FORBIDDEN",
        });
      }

      return this.userDetailsService.updateUserSocialMedia(
        userId,
        body,
        token
      );
    });
  }

  /**
   * Get user's FAQ answers
   *
   * Returns all FAQ answers for the specified user with their corresponding questions.
   * This endpoint is public and does not require authentication.
   *
   * @summary Get user FAQ
   * @param username The username of the user
   * @returns User's FAQ answers with questions
   * @throws 404 if user not found
   */
  @Get("faq")
  public async getUserFaq(@Path() username: string): Promise<UserFaqResponse[]> {
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

      return this.userDetailsService.getUserFaq(profile.id);
    });
  }

  /**
   * Create or update user's FAQ answer
   *
   * Adds or updates an answer to an FAQ question for the authenticated user.
   * Only the profile owner can manage their own FAQ.
   *
   * @summary Upsert user FAQ answer
   * @param username The username (must match authenticated user)
   * @param body Question ID and answer
   * @returns The created/updated FAQ answer
   * @throws 401 if not authenticated
   * @throws 403 if trying to update another user's FAQ
   * @throws 404 if user or question not found
   */
  @Security("bearerAuth")
  @Post("faq")
  public async upsertUserFaq(
    @Path() username: string,
    @Body() body: UpsertFaqDto,
    @Request() request: ExpressRequest
  ): Promise<UserFaqResponse> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        // Get user ID from username and verify ownership
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

        if (profile.id !== userId) {
          throw createHttpError({
            message: "You can only update your own FAQ",
            statusCode: 403,
            code: "FORBIDDEN",
          });
        }

        return this.userDetailsService.upsertUserFaq(userId, body, token);
      },
      201
    );
  }

  /**
   * Delete user's FAQ answer
   *
   * Removes an answer to an FAQ question for the authenticated user.
   * Only the profile owner can delete their own FAQ answers.
   *
   * @summary Delete user FAQ answer
   * @param username The username (must match authenticated user)
   * @param questionId The question ID to delete answer for
   * @returns No content on success
   * @throws 401 if not authenticated
   * @throws 403 if trying to delete another user's FAQ
   * @throws 404 if user not found
   */
  @Security("bearerAuth")
  @Delete("faq/{questionId}")
  public async deleteUserFaq(
    @Path() username: string,
    @Path() questionId: string,
    @Request() request: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        // Get user ID from username and verify ownership
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

        if (profile.id !== userId) {
          throw createHttpError({
            message: "You can only delete your own FAQ",
            statusCode: 403,
            code: "FORBIDDEN",
          });
        }

        return this.userDetailsService.deleteUserFaq(userId, questionId, token);
      },
      204
    );
  }

  /**
   * Get what user is looking for
   *
   * Returns the user's "looking for" preferences (connect, promote, find-band, find-services).
   * This endpoint is public and does not require authentication.
   *
   * @summary Get user looking for preferences
   * @param username The username of the user
   * @returns User's looking for preferences
   * @throws 404 if user not found
   */
  @Get("looking-for")
  public async getUserLookingFor(
    @Path() username: string
  ): Promise<UserLookingForResponse[]> {
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

      return this.userDetailsService.getUserLookingFor(profile.id);
    });
  }
}

@Route("faq-questions")
@Tags("FAQ Questions")
export class FaqQuestionsController extends Controller {
  private userDetailsService = new UserDetailsService();

  /**
   * Get all available FAQ questions
   *
   * Returns all active FAQ questions that users can answer on their profiles.
   * This endpoint is public and does not require authentication.
   *
   * @summary Get all FAQ questions
   * @returns List of all active FAQ questions
   */
  @Get()
  public async getAllFaqQuestions(): Promise<FaqQuestionResponse[]> {
    return handleControllerRequest(this, async () => {
      return this.userDetailsService.getAllFaqQuestions();
    });
  }
}
