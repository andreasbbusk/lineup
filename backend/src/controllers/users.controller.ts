import { Controller, Get, Route, Tags, Path } from "tsoa";
import { supabase } from "../middleware/auth.middleware.js";

@Route("users")
@Tags("Users")
export class UsersController extends Controller {
  /**
   * Retrieves a list of all users.
   */
  @Get("/")
  public async getAllUsers(): Promise<any[] | { error: string }> {
    //change type of Promise<any> when profile interface is created
    const { data, error } = await supabase.from("profiles").select("*");

    if (error) {
      this.setStatus(500);
      return { error: error.message };
    }

    this.setStatus(200);
    return data;
  }

  /**
   * Retrieves a specific user by their ID.
   * @param userId The ID of the user to retrieve
   */
  @Get("{userId}")
  public async getUser(
    @Path() userId: string
  ): Promise<any | { error: string }> {
    //change type of Promise<any> when profile interface is created
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      this.setStatus(404);
      return { error: "User not found" };
    }
    this.setStatus(200);
    return data;
  }
}
