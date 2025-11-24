import { Controller, Get, Route, Tags, Path } from "tsoa";
import { supabase } from "../middleware/auth.middleware.js";

@Route("notifications")
@Tags("Notifications")
export class NotificationsController extends Controller {
  /**
   * Retrieves a list of all notifications.
   */
  @Get("/")
  public async getNotifications(): Promise<any[] | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase.from("notifications").select("*");

    if (error) {
      this.setStatus(500);
      return { error: error.message };
    }

    this.setStatus(200);
    return data;
  }

  /**
   * Retrieves all notifications for a user by their ID.
   * @param userId The ID of the user to retrieve notifications from
   */
  @Get("{userId}")
  public async getUserNotifications(
    @Path() userId: string
  ): Promise<any | { error: string }> {
    //change type of Promise<any> when interfaces are created
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      this.setStatus(404);
      return { error: "notifications not found" };
    }
    this.setStatus(200);
    return data;
  }
}
