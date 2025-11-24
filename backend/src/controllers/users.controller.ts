import { Controller, Get, Route, Tags } from "tsoa";

@Route("users")
@Tags("Users")
export class UsersController extends Controller {
  /**
   * Retrieves a list of users.
   */
  @Get("/")
  public async getUsers(): Promise<{ message: string }> {
    return { message: "Get users" };
  }
}
