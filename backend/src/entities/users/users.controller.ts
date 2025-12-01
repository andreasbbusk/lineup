// src/entities/users/users.controller.ts
import { Request as ExpressRequest } from "express";
import {
  Body,
  Controller,
  Get,
  Path,
  Put,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { UserProfile } from "../../types/api.types.js";
import { extractBearerToken, extractUserId } from "../../utils/auth-helpers.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { UpdateProfileDto } from "./users.dto.js";
import { UsersService } from "./users.service.js";

@Route("users")
@Tags("Users")
export class UsersController extends Controller {
  private usersService = new UsersService();

  /**
   * Get user profile by username
   *
   * Retrieves a user's profile information. Returns public profile data by default.
   * If authenticated and viewing your own profile, returns additional private fields
   * such as phone number, year of birth, etc.
   *
   * Authentication is optional - endpoint can be accessed without a token for public profiles.
   *
   * @summary Get user profile
   * @param username The username of the user to retrieve
   * @returns User profile (public or private based on authentication)
   * @throws 404 if user not found
   */
  @Security("bearerAuth")
  @Get("{username}")
  public async getUser(
    @Path() username: string,
    @Request() request: ExpressRequest
  ): Promise<UserProfile> {
    return handleControllerRequest(this, async () => {
      let authenticatedUserId: string | undefined;

      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          authenticatedUserId = await extractUserId(request);
        } catch (error) {
          authenticatedUserId = undefined;
        }
      }

      return this.usersService.getUserByUsername(username, authenticatedUserId);
    });
  }

  /**
   * Update own profile
   *
   * Updates the authenticated user's profile information. Only the profile owner
   * can update their own profile. All fields in the request body are optional -
   * only provided fields will be updated.
   *
   * @summary Update user profile
   * @param username The username of the profile to update (must match authenticated user)
   * @param body The profile fields to update (all optional)
   * @returns Updated user profile
   * @throws 401 if not authenticated
   * @throws 403 if trying to update another user's profile
   * @throws 404 if user not found
   */
  @Security("bearerAuth")
  @Put("{username}")
  public async updateProfile(
    @Path() username: string,
    @Body() body: UpdateProfileDto,
    @Request() request: ExpressRequest
  ): Promise<UserProfile> {
    return handleControllerRequest(this, async () => {
      // Authentication is required - extractUserId will throw if not authenticated
      const userId = await extractUserId(request);

      // Extract token from authorization header
      const token = extractBearerToken(request);

      return this.usersService.updateProfile(username, userId, body, token);
    });
  }
}
