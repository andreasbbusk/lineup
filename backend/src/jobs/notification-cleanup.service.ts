import { createServiceRoleClient } from "../config/supabase.config.js";
import { createHttpError } from "../utils/error-handler.js";

export class NotificationCleanupService {
  /**
   * Delete read notifications older than specified days
   * @param daysOld - Number of days old (default: 30)
   * @returns Number of deleted notifications
   */
  async cleanupReadNotifications(daysOld: number = 30): Promise<number> {
    const supabase = createServiceRoleClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffISO = cutoffDate.toISOString();

    // First, count how many notifications will be deleted
    const { count: countBefore } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", true)
      .lt("read_at", cutoffISO);

    // Delete the notifications
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("is_read", true)
      .lt("read_at", cutoffISO);

    if (error) {
      throw createHttpError({
        message: `Failed to cleanup notifications: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return countBefore || 0;
  }

  /**
   * Delete all read notifications (use with caution)
   * @returns Number of deleted notifications
   */
  async cleanupAllReadNotifications(): Promise<number> {
    const supabase = createServiceRoleClient();

    // First, count how many notifications will be deleted
    const { count: countBefore } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", true);

    // Delete the notifications
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("is_read", true);

    if (error) {
      throw createHttpError({
        message: `Failed to cleanup notifications: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return countBefore || 0;
  }
}
