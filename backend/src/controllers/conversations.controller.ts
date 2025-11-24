import { Controller, Get, Route, Tags, Path } from "tsoa";
import { supabase } from "../middleware/auth.middleware.js";

@Route("conversations")
@Tags("Conversations")
export class ConversationsController extends Controller {
  /**
   * Retrieves a list of all conversations.
   */
  @Get("/")
  public async getConversations(): Promise<any[] | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase.from("conversations").select("*");

    if (error) {
      this.setStatus(500);
      return { error: error.message };
    }

    this.setStatus(200);
    return data;
  }

  /**
   * Retrieves all conversations for a user by their ID.
   * @param userId The ID of the user to retrieve conversations from
   */
  @Get("{userId}")
  public async getUserConversations(
    @Path() userId: string
  ): Promise<any | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      this.setStatus(404);
      return { error: "conversations not found" };
    }
    this.setStatus(200);
    return data;
  }
}
