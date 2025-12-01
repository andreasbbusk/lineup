import { Controller, Get, Query, Route, Tags } from "tsoa";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { checkUsernameAvailability } from "./auth.service.js";

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
  /**
   * Check if a username is available
   *
   * Returns availability status for real-time validation during registration.
   * Username must be between 3-30 characters to be considered valid.
   *
   * @summary Check username availability
   * @param username Username to check for availability
   * @returns Object containing available boolean
   */
  @Get("check-username")
  public async checkUsername(
    @Query() username: string
  ): Promise<{ available: boolean }> {
    return handleControllerRequest(this, () =>
      checkUsernameAvailability(username)
    );
  }
}
