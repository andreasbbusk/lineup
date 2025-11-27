import { Controller, Get, Route, Tags, Path } from "tsoa";
import { supabase } from "../config/supabase.config.js";

@Route("messages")
@Tags("Messages")
export class MessagesController extends Controller {
  /**
   * Retrieves a list of all messages.
   */
  @Get("/")
  public async getMessages(): Promise<any[] | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase.from("messages").select("*");

    if (error) {
      this.setStatus(500);
      return { error: error.message };
    }

    this.setStatus(200);
    return data;
  }

  /**
   * Retrieves all messages for a user by their ID.
   * @param userId The ID of the user to retrieve messages from
   */
  @Get("{userId}")
  public async getUserMessages(
    @Path() userId: string
  ): Promise<any | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("sender_id", userId);

    if (error) {
      this.setStatus(404);
      return { error: "messages not found" };
    }
    this.setStatus(200);
    return data;
  }
}
