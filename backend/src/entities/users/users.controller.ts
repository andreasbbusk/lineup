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
import { extractUserId } from "../../entities/auth/auth.service.js";
import { UserProfile } from "../../types/api.types.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { UsersService } from "./users.service.js";
import { UpdateProfileDto } from "./users.dto.js";

@Route("users")
@Tags("Users")
export class UsersController extends Controller {
  private usersService = new UsersService();

  /**
   * Get user profile by username
   * Returns public profile by default. If authenticated and viewing own profile, returns private fields.
   * Authentication is optional - endpoint can be accessed without a token.
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
   * Update own profile (requires authentication)
   * Only the profile owner can update their own profile
   * Authentication is required - will throw 401 if not authenticated
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

      // Get token from authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Authorization token is required");
      }
      const token = authHeader.replace("Bearer ", "");

      return this.usersService.updateProfile(username, userId, body, token);
    });
  }
}
