import { Controller, Get, Route, Tags, Path } from "tsoa";
import { supabase } from "../middleware/auth.middleware.js";

@Route("metadata")
@Tags("Metadata")
export class MetadataController extends Controller {
  /**
   * Retrieves a list of all metadata.
   */
  @Get("/")
  public async getMetadata(): Promise<any[] | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase.from("metadata").select("*");

    if (error) {
      this.setStatus(500);
      return { error: error.message };
    }

    this.setStatus(200);
    return data;
  }

  /**
   * Retrieves all metadata for a user by their ID.
   * @param userId The ID of the user to retrieve metadata from
   */
  @Get("{userId}")
  public async getUserMetadata(
    @Path() userId: string
  ): Promise<any | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase
      .from("user_metadata")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      this.setStatus(404);
      return { error: "metadata not found" };
    }
    this.setStatus(200);
    return data;
  }
}
