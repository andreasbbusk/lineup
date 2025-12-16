"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../api";
import type { GroupedNotificationsResponse } from "../types";
import type { NotificationResponse } from "../types";
import { groupNotificationsByType } from "../utils/groupNotifications";
import { deduplicateConnectionRequests } from "../utils/connectionRequests";

/**
 * Hook to fetch notifications grouped by type
 * Returns notifications organized by type for easy filtering in the UI
 */
export function useNotifications(options?: { unreadOnly?: boolean }) {
  return useQuery({
    queryKey: ["notifications", "grouped", options?.unreadOnly],
    queryFn: async () => {
      const result = await getNotifications({
        grouped: true,
        unreadOnly: options?.unreadOnly,
        limit: 100, // Get a reasonable number for the notifications page
      });

      // Type guard to ensure we got grouped response
      if (
        result.notifications &&
        typeof result.notifications === "object" &&
        !Array.isArray(result.notifications)
      ) {
        return result as {
          notifications: GroupedNotificationsResponse;
          nextCursor?: string;
        };
      }

      // Fallback: if we got array, convert to grouped format
      const notifications = result.notifications as NotificationResponse[];
      const grouped = groupNotificationsByType(notifications);

      return { notifications: grouped, nextCursor: result.nextCursor };
    },
    staleTime: 10 * 1000, // 10 seconds - shorter to match unread count
    refetchOnMount: true, // Always refetch when component mounts (so you see latest when navigating to page)
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

/**
 * Hook to get unread notification count
 * Used for showing badge in header
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const result = await getNotifications({
        unreadOnly: true,
        limit: 100, // Get enough to count all unread
      });

      // Count unread notifications
      if (Array.isArray(result.notifications)) {
        return result.notifications.length;
      }

      // If grouped, count all unread notifications across all types
      const grouped = result.notifications as GroupedNotificationsResponse;
      
      // Deduplicate connection requests (connection_request + connection_accepted)
      // to match how they're displayed on the notifications page
      const connectionRequests = [
        ...grouped.connection_request,
        ...grouped.connection_accepted,
      ];
      const uniqueConnectionRequests = deduplicateConnectionRequests(connectionRequests);
      
      // Count all notification types, using deduplicated connection requests
      const count =
        uniqueConnectionRequests.length +
        grouped.like.length +
        grouped.comment.length +
        grouped.tagged_in_post.length +
        grouped.review.length +
        grouped.collaboration_request.length +
        grouped.message.length;

      return count;
    },
    staleTime: 10 * 1000, // 10 seconds - more frequent updates for badge
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

