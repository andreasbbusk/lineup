import { Controller, Get, Route, Tags, Path } from "tsoa";
import { supabase } from "../middleware/auth.middleware.js";

@Route("connections")
@Tags("Connections")
export class ConnectionsController extends Controller {
  /**
   * Retrieves a list of all connections.
   */
  @Get("/")
  public async getConnectionRequests(): Promise<any[] | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase
      .from("connections_requests")
      .select("*");

    if (error) {
      this.setStatus(500);
      return { error: error.message };
    }

    this.setStatus(200);
    return data;
  }

  /**
   * Retrieves all connections requests for a user by their ID.
   * @param userId The ID of the user to retrieve connections from
   */
  @Get("{userId}")
  public async getUserConnectionsRequest(
    @Path() userId: string
  ): Promise<any | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase
      .from("connections_requests")
      .select("*")
      .eq("recipient_id", userId);

    if (error) {
      this.setStatus(404);
      return { error: "connections not found" };
    }
    this.setStatus(200);
    return data;
  }
}
