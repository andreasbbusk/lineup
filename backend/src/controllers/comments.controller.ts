import { Controller, Get, Route, Tags, Path } from "tsoa";
import { supabase } from "../middleware/auth.middleware.js";

@Route("comments")
@Tags("Comments")
export class CommentsController extends Controller {
  /**
   * Retrieves a list of all comments.
   */
  @Get("/")
  public async getComments(): Promise<any[] | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase.from("comments").select("*");

    if (error) {
      this.setStatus(500);
      return { error: error.message };
    }

    this.setStatus(200);
    return data;
  }

  /**
   * Retrieves all comments for a user by their ID.
   * @param userId The ID of the user to retrieve comments from
   */
  @Get("{userId}")
  public async getUserComments(
    @Path() userId: string
  ): Promise<any | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("author_id", userId);

    if (error) {
      this.setStatus(404);
      return { error: "comments not found" };
    }
    this.setStatus(200);
    return data;
  }
}
