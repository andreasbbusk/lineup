import { Controller, Get, Route, Tags, Path } from "tsoa";
import { supabase } from "../services/auth.service.js";

@Route("uploads")
@Tags("Uploads")
export class UploadsController extends Controller {
  /**
   * Retrieves a list of all uploads.
   */
  @Get("/")
  public async getUploads(): Promise<any[] | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase.from("media").select("*");

    if (error) {
      this.setStatus(500);
      return { error: error.message };
    }

    this.setStatus(200);
    return data;
  }

  //DENNE METODE SKAL NOK TAGE FRA USER_METADATA OG IKKE UPLOADS TABLE IMPLEMENTERING IKKE FÆRDIG
  /**
   * Retrieves all uploads for a user by their ID.
   * @param userId The ID of the user to retrieve uploads from
   */
  @Get("{userId}")
  public async getUserUploads(
    @Path() userId: string
  ): Promise<any | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      this.setStatus(404);
      return { error: "uploads not found" };
    }
    this.setStatus(200);
    return data;
  }
}
