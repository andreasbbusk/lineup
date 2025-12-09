import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";
import type { CreateConversationDto, UpdateConversationDto } from "../../types";

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

/**
 * Hook to update conversation details (name, avatar)
 */
export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: string;
      data: UpdateConversationDto;
    }) => chatApi.updateConversation(conversationId, data),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.detail(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}

/**
 * Hook to add participants to a group conversation
 */
export function useAddParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      participantIds,
    }: {
      conversationId: string;
      participantIds: string[];
    }) => chatApi.addParticipants(conversationId, { participantIds }),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.detail(conversationId),
      });
    },
  });
}

/**
 * Hook to remove a participant from a group conversation
 */
export function useRemoveParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => chatApi.removeParticipant(conversationId, userId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.detail(conversationId),
      });
    },
  });
}
