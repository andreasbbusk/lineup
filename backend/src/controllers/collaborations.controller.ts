import { Controller, Get, Route, Tags, Path } from "tsoa";
import { supabase } from "../services/auth.service.js";

@Route("collaborations")
@Tags("Collaborations")
export class CollaborationsController extends Controller {
  /**
   * Retrieves a list of all collaborations.
   */
  @Get("/")
  public async getCollaborations(): Promise<any[] | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase
      .from("user_collaborations")
      .select("*");

    if (error) {
      this.setStatus(500);
      return { error: error.message };
    }

    this.setStatus(200);
    return data;
  }

  /**
   * Retrieves all collaborations for a user by their ID.
   * @param userId The ID of the user to retrieve collaborations from
   */
  @Get("{userId}")
  public async getUserCollaborations(
    @Path() userId: string
  ): Promise<any | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase
      .from("user_collaborations")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      this.setStatus(404);
      return { error: "collaborations not found" };
    }
    this.setStatus(200);
    return data;
  }
}
