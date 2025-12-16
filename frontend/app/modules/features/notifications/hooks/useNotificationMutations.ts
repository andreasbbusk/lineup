"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNotification, deleteNotification } from "../api";
import type { GroupedNotificationsResponse } from "../types";

/**
 * Hook to mark a notification as read or unread
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notificationId,
      isRead,
    }: {
      notificationId: string;
      isRead: boolean;
    }) => updateNotification(notificationId, isRead),
    onMutate: async ({ notificationId, isRead }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Snapshot the previous value
      const previousQueries = queryClient.getQueriesData({
        queryKey: ["notifications"],
      });

      // Optimistically update all notification queries
      // Just update the isRead status, don't remove notifications
      queryClient.setQueriesData<{
        notifications: GroupedNotificationsResponse;
      }>(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old?.notifications) return old;

          // Update the notification's isRead status in all groups
          const updateNotificationInGroup = <T extends Record<string, unknown>>(
            group: T[]
          ): T[] =>
            group.map((n) =>
              n.id === notificationId ? { ...n, isRead } : n
            );

          return {
            ...old,
            notifications: {
              like: updateNotificationInGroup(old.notifications.like),
              comment: updateNotificationInGroup(old.notifications.comment),
              connection_request: updateNotificationInGroup(
                old.notifications.connection_request
              ),
              connection_accepted: updateNotificationInGroup(
                old.notifications.connection_accepted
              ),
              tagged_in_post: updateNotificationInGroup(
                old.notifications.tagged_in_post
              ),
              review: updateNotificationInGroup(old.notifications.review),
              collaboration_request: updateNotificationInGroup(
                old.notifications.collaboration_request
              ),
              message: updateNotificationInGroup(old.notifications.message),
            },
          };
        }
      );

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      // Invalidate and refetch all notifications queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
        refetchType: "active",
      });
    },
  });
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      // Match all notification queries (including grouped ones)
      await queryClient.cancelQueries({ 
        queryKey: ["notifications"],
        exact: false 
      });

      // Snapshot the previous value for all notification queries
      const previousQueries = queryClient.getQueriesData({
        queryKey: ["notifications"],
        exact: false,
      });

      // Optimistically remove the notification from all groups
      // Update all notification queries (including grouped ones)
      queryClient.setQueriesData<{
        notifications: GroupedNotificationsResponse;
      }>(
        { 
          queryKey: ["notifications"],
          exact: false,
        },
        (old) => {
          if (!old?.notifications) return old;

          const updated: GroupedNotificationsResponse = {
            like: old.notifications.like.filter((n) => n.id !== notificationId),
            comment: old.notifications.comment.filter(
              (n) => n.id !== notificationId
            ),
            connection_request: old.notifications.connection_request.filter(
              (n) => n.id !== notificationId
            ),
            connection_accepted: old.notifications.connection_accepted.filter(
              (n) => n.id !== notificationId
            ),
            tagged_in_post: old.notifications.tagged_in_post.filter(
              (n) => n.id !== notificationId
            ),
            review: old.notifications.review.filter((n) => n.id !== notificationId),
            collaboration_request:
              old.notifications.collaboration_request.filter(
                (n) => n.id !== notificationId
              ),
            message: old.notifications.message.filter(
              (n) => n.id !== notificationId
            ),
          };
          return { ...old, notifications: updated };
        }
      );

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      console.error("Failed to delete notification:", err);
      // Rollback on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data, notificationId) => {
      console.log("[useDeleteNotification] onSuccess - notification deleted:", notificationId);
      // Don't refetch immediately - wait a bit to ensure backend has processed
      // The optimistic update already removed it from UI
      // Only invalidate the unread count, and let the polling interval handle the main query
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
        refetchType: "active", // Update count
      });
      // Mark notifications as stale but don't refetch immediately
      // This prevents race conditions where refetch happens before backend completes
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
        exact: false,
        refetchType: "none", // Don't refetch, just mark as stale
      });
    },
  });
}
