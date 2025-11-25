import { Controller, Get, Route, Tags, Path } from "tsoa";
import { supabase } from "../services/auth.service.js";

@Route("bookmarks")
@Tags("Bookmarks")
export class BookmarksController extends Controller {
  /**
   * Retrieves a list of all bookmarks.
   */
  @Get("/")
  public async getBookmarks(): Promise<any[] | { error: string }> {
    //change type of Promise<any> when profile interface is created
    const { data, error } = await supabase.from("bookmarks").select("*");

    if (error) {
      this.setStatus(500);
      return { error: error.message };
    }

    this.setStatus(200);
    return data;
  }

  /**
   * Retrieves all bookmarks for a user by their ID.
   * @param userId The ID of the user to retrieve bookmarks from
   */
  @Get("{userId}")
  public async getUserBookmarks(
    @Path() userId: string
  ): Promise<any | { error: string }> {
    //change type of Promise<any> when profile interface is created
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      this.setStatus(404);
      return { error: "bookmarks not found" };
    }
    this.setStatus(200);
    return data;
  }
}
