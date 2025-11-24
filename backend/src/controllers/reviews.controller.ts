import { Controller, Get, Route, Tags, Path } from "tsoa";
import { supabase } from "../middleware/auth.middleware.js";

@Route("reviews")
@Tags("Reviews")
export class ReviewsController extends Controller {
  /**
   * Retrieves a list of all reviews.
   */
  @Get("/")
  public async getReviews(): Promise<any[] | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase.from("user_reviews").select("*");

    if (error) {
      this.setStatus(500);
      return { error: error.message };
    }

    this.setStatus(200);
    return data;
  }

  /**
   * Retrieves all reviews for a user by their ID.
   * @param userId The ID of the user to retrieve reviews from
   */
  @Get("{userId}")
  public async getUserReviews(
    @Path() userId: string
  ): Promise<any | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase
      .from("user_reviews")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      this.setStatus(404);
      return { error: "reviews not found" };
    }
    this.setStatus(200);
    return data;
  }
}
