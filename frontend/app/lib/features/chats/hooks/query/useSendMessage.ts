import {
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";
import type { Message } from "../../types";

// ============================================================================
// Types
// ============================================================================

type MessagesPage = {
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
};

type InfiniteMessages = InfiniteData<MessagesPage, string | undefined>;

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for sending messages with optimistic updates
 *
 * Flow:
 * 1. onMutate: Immediately show message in UI with temp ID
 * 2. mutationFn: Send to server in background
 * 3. onSuccess: Replace temp message with server response
 * 4. onError: Rollback to snapshot if send fails
 */
export function useSendMessage(conversationId: string, userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      chatApi.sendMessage({
        conversation_id: conversationId,
        content,
        media_ids: [],
        reply_to_message_id: null,
      }),

    // Optimistic update: Show message immediately before server confirms
    onMutate: async (content: string) => {
      const tempId = `temp-${Date.now()}`;

      // Cancel in-flight queries to avoid race conditions
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(conversationId),
      });

      // Save current state for rollback on error
      const snapshot = queryClient.getQueryData<InfiniteMessages>(
        chatKeys.messages(conversationId)
      );

      // Create temporary message with client-side ID
      const optimisticMessage: Message = {
        id: tempId,
        conversationId,
        senderId: userId,
        content,
        mediaIds: null,
        isEdited: null,
        editedAt: null,
        isDeleted: null,
        deletedAt: null,
        replyToMessageId: null,
        createdAt: new Date().toISOString(),
        sentViaWebsocket: null,
        sender: undefined,
        replyTo: null,
        readReceipts: [],
        media: [],
      };

      // Add optimistic message to the first page (most recent messages)
      queryClient.setQueryData<InfiniteMessages>(
        chatKeys.messages(conversationId),
        (old) => {
          if (!old) return old;

          const newPages = [...old.pages];
          const firstPage = newPages[0];

          // Always add new messages to the first page (index 0), which contains the most recent messages
          newPages[0] = {
            ...firstPage,
            messages: [...firstPage.messages, optimisticMessage],
          };

          return {
            ...old,
            pages: newPages,
          };
        }
      );

      return { snapshot, tempId };
    },

    // Rollback: Restore previous state if send fails
    onError: (_err, _content, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          context.snapshot
        );
      }
    },

    // Replace temporary message with server response
    onSuccess: (serverMessage, _content, context) => {
      queryClient.setQueryData<InfiniteMessages>(
        chatKeys.messages(conversationId),
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              messages: page.messages.map((msg) =>
                msg.id === context.tempId ? serverMessage : msg
              ),
            })),
          };
        }
      );

      // Refresh conversation list to update last message preview
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}
