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
      queryClient.setQueriesData<{
        notifications: GroupedNotificationsResponse;
      }>(
        { queryKey: ["notifications"] },
        (old) => {
          if (!old?.notifications) return old;

          // Remove the notification from all groups if marking as read
          if (isRead) {
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

          // If marking as unread, update the notification's isRead status
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
    onSuccess: () => {
      // Invalidate notifications queries to refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

