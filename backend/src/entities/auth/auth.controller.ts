import { Body, Controller, Post, Route, Tags } from "tsoa";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { signUp, signIn } from "./auth.service.js";
import { SignupDto, LoginDto } from "./auth.dto.js";
import { AuthResponse } from "../../types/api.types.js";

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
  /**
   * Sign up a new user
   *
   * Creates a new user account with email, password, and basic profile information.
   * The username, email, and phone number must be unique. After successful signup,
   * returns authentication tokens and user profile.
   *
   * @summary Create a new user account
   * @param body User registration data including email, password, username, and profile info
   * @returns Authentication response with user, session tokens, and profile
   * @throws 400 if validation fails
   * @throws 409 if email, username, or phone number already exists
   */
  @Post("/signup")
  public async signup(@Body() body: SignupDto): Promise<AuthResponse> {
    return handleControllerRequest(this, () => signUp(body), 201);
  }

  /**
   * Sign in an existing user
   *
   * Authenticates a user with their email and password. Returns authentication
   * tokens (access and refresh) along with user profile information.
   *
   * @summary Authenticate user
   * @param body Login credentials (email and password)
   * @returns Authentication response with user, session tokens, and profile
   * @throws 400 if validation fails
   * @throws 401 if email or password is incorrect
   */
  @Post("/login")
  public async login(@Body() body: LoginDto): Promise<AuthResponse> {
    return handleControllerRequest(this, () =>
      signIn(body.email, body.password)
    );
  }
}
