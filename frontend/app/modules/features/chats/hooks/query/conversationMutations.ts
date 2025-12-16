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
      // Refetch conversations list to immediately show new conversation
      queryClient.refetchQueries({ queryKey: chatKeys.lists() });
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

      // Refetch conversations list to immediately remove it from the list
      queryClient.refetchQueries({ queryKey: chatKeys.lists() });
      // Refetch unread count
      queryClient.refetchQueries({ queryKey: chatKeys.unread() });
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
      // Refetch to immediately update unread counts and indicators
      queryClient.refetchQueries({ queryKey: chatKeys.unread() });
      queryClient.refetchQueries({ queryKey: chatKeys.lists() });
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
      // Refetch to immediately show updated conversation details
      queryClient.refetchQueries({
        queryKey: chatKeys.detail(conversationId),
      });
      queryClient.refetchQueries({ queryKey: chatKeys.lists() });
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
      // Refetch to immediately show new participants
      queryClient.refetchQueries({
        queryKey: chatKeys.detail(conversationId),
      });
      queryClient.refetchQueries({ queryKey: chatKeys.lists() });
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
      // Refetch to immediately reflect participant removal
      queryClient.refetchQueries({
        queryKey: chatKeys.detail(conversationId),
      });
      queryClient.refetchQueries({ queryKey: chatKeys.lists() });
    },
  });
}
