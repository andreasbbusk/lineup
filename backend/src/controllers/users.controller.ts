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
import {
  extractBearerToken,
  extractUserId,
  getUserByUsername,
  updateUserProfile,
} from "../services/auth.service.js";
import { ProfileUpdateRequest, UserProfile } from "../types/api.types.js";
import { handleControllerRequest } from "../utils/controller-helpers.js";

@Route("users")
@Tags("Users")
export class UsersController extends Controller {
  /**
   * Get user profile by username
   * Returns public profile by default. If authenticated and viewing own profile, returns private fields.
   */
  @Security("bearerAuth")
  @Get("{username}")
  public async getUser(
    @Path() username: string,
    @Request() request: ExpressRequest
  ): Promise<UserProfile> {
    return handleControllerRequest(this, async () => {
      // Check for optional authentication
      let authenticatedUserId: string | undefined;
      try {
        authenticatedUserId = await extractUserId(request);
      } catch {
        // Not authenticated - will return public profile
      }

      return getUserByUsername(username, authenticatedUserId);
    });
  }

  /**
   * Update own profile (requires authentication)
   * Only the profile owner can update their own profile
   */
  @Security("bearerAuth")
  @Put("{username}")
  public async updateProfile(
    @Path() username: string,
    @Body() body: ProfileUpdateRequest,
    @Request() request: ExpressRequest
  ): Promise<UserProfile> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request);
      const token = extractBearerToken(request);
      return updateUserProfile(username, userId, body, token);
    });
  }
}
