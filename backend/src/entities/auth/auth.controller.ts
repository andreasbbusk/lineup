import { Controller, Post, Route, Tags, Body } from "tsoa";
import { signUp, signIn } from "./auth.service.js";
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
}
