import { Request as ExpressRequest } from "express";
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { UserProfile } from "../../types/api.types.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { extractBearerToken } from "../../utils/auth-helpers.js";
import { CompleteProfileDto } from "./auth.dto.js";
import { checkUsernameAvailability, completeProfile } from "./auth.service.js";

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
  /**
   * Complete user profile after Supabase Auth account creation
   * Used in onboarding flow where Auth account is created first, then profile is completed later
   */
  @Security("bearerAuth")
  @Post("/complete-profile")
  public async completeUserProfile(
    @Request() request: ExpressRequest,
    @Body() body: CompleteProfileDto
  ): Promise<UserProfile> {
    return handleControllerRequest(this, async () => {
      const token = extractBearerToken(request);
      return completeProfile(body, token);
    });
  }

  /**
   * Check if a username is available
   * Returns availability status for real-time validation
   */
  @Get("/check-username")
  public async checkUsername(
    @Query() username: string
  ): Promise<{ available: boolean }> {
    return handleControllerRequest(this, () =>
      checkUsernameAvailability(username)
    );
  }
}
