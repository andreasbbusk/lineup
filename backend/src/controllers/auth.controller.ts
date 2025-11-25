import { Controller, Post, Route, Tags, Body } from "tsoa";
import { signUp, signIn } from "../services/auth.service.js";
import {
  SignupRequest,
  LoginRequest,
  AuthResponse,
} from "../types/api.types.js";
import { handleControllerRequest } from "../utils/controller-helpers.js";

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
  /**
   * Sign up a new user
   * Creates a new user account with email, password, and basic profile information
   */
  @Post("/signup")
  public async signup(@Body() body: SignupRequest): Promise<AuthResponse> {
    return handleControllerRequest(this, () => signUp(body), 201);
  }

  /**
   * Sign in an existing user
   * Authenticates a user with email and password
   */
  @Post("/login")
  public async login(@Body() body: LoginRequest): Promise<AuthResponse> {
    return handleControllerRequest(this, () => signIn(body.email, body.password));
  }
}
