"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNotification, deleteNotification } from "../api";

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
    onSuccess: () => {
      // Invalidate notifications queries to refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
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

