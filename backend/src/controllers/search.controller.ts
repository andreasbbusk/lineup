import { Controller, Get, Route, Tags, Path } from "tsoa";
import { supabase } from "../services/auth.service.js";

@Route("search")
@Tags("Search")
export class SearchController extends Controller {
  /**
   * Retrieves a list of all recent search results.
   */
  @Get("/")
  public async getRecentSearchResults(): Promise<any[] | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase.from("recent_searches").select("*");

    if (error) {
      this.setStatus(500);
      return { error: error.message };
    }

    this.setStatus(200);
    return data;
  }

  /**
   * Retrieves all recent searches for a user by their ID.
   * @param userId The ID of the user to retrieve recent searches from
   */
  @Get("{userId}")
  public async getUserRecentSearches(
    @Path() userId: string
  ): Promise<any | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase
      .from("recent_searches")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      this.setStatus(404);
      return { error: "recent searches not found" };
    }
    this.setStatus(200);
    return data;
  }
}
