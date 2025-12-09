import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";
import type { CreateConversationDto } from "../../types";

/**
 * Hook to create a new conversation (direct or group)
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationDto) =>
      chatApi.createConversation(data),
    onSuccess: () => {
      // Invalidate conversations list to show new conversation
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}

/**
 * Hook to leave a conversation (sets left_at timestamp for the user)
 */
export function useLeaveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      // Cancel any ongoing queries for this conversation to prevent "Not a participant" errors
      await queryClient.cancelQueries({
        queryKey: chatKeys.detail(conversationId),
      });
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(conversationId),
      });

      return chatApi.leaveConversation(conversationId);
    },
    onSuccess: (_, conversationId) => {
      // Remove the conversation data from cache immediately
      queryClient.removeQueries({
        queryKey: chatKeys.detail(conversationId),
      });
      queryClient.removeQueries({
        queryKey: chatKeys.messages(conversationId),
      });

      // Invalidate conversations list to remove it from the list
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      // Invalidate unread count
      queryClient.invalidateQueries({ queryKey: chatKeys.unread() });
    },
  });
}

/**
 * Mark messages as read and update unread counts
 * Refreshes conversation list to clear unread indicators
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageIds: string[]) => chatApi.markAsRead(messageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.unread() });
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}
