import { Controller, Post, Route, Tags, Body, Get, Query } from "tsoa";
import { signUp, signIn, checkUsernameAvailability, checkEmailAvailability } from "./auth.service.js";
import { SignupDto, LoginDto } from "./auth.dto.js";
import { AuthResponse } from "../../types/api.types.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
  /**
   * Sign up a new user
   * Creates a new user account with email, password, and basic profile information
   */
  @Post("/signup")
  public async signup(@Body() body: SignupDto): Promise<AuthResponse> {
    return handleControllerRequest(this, () => signUp(body), 201);
  }

  /**
   * Sign in an existing user
   * Authenticates a user with email and password
   */
  @Post("/login")
  public async login(@Body() body: LoginDto): Promise<AuthResponse> {
    return handleControllerRequest(this, () =>
      signIn(body.email, body.password)
    );
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

  /**
   * Check if an email is available
   * Returns availability status for real-time validation
   */
  @Get("/check-email")
  public async checkEmail(
    @Query() email: string
  ): Promise<{ available: boolean }> {
    return handleControllerRequest(this, () =>
      checkEmailAvailability(email)
    );
  }
}
