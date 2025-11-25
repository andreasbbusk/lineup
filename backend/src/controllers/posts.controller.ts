import { Controller, Get, Route, Tags, Path } from "tsoa";
import { supabase } from "../services/auth.service.js";

@Route("posts")
@Tags("Posts")
export class PostsController extends Controller {
  /**
   * Retrieves a list of all posts.
   */
  @Get("/")
  public async getPosts(): Promise<any[] | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase.from("posts").select("*");

    if (error) {
      this.setStatus(500);
      return { error: error.message };
    }

    this.setStatus(200);
    return data;
  }

  /**
   * Retrieves all posts for a user by their ID.
   * @param userId The ID of the user to retrieve posts from
   */
  @Get("{userId}")
  public async getUserPosts(
    @Path() userId: string
  ): Promise<any | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      this.setStatus(404);
      return { error: "posts not found" };
    }
    this.setStatus(200);
    return data;
  }
}
