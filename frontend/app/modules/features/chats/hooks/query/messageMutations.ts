import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";
import { useMessageActionsStore } from "../../stores/messageStore";
import { Message, PaginatedMessages } from "../../types";
import { addMessageToCache, replaceMessageInCache, updateMessageInCache } from "../../utils/cacheUpdates";
import { MESSAGE_STATES } from "../../constants";

type MessagesPage = {
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
};

type InfiniteMessages = InfiniteData<MessagesPage, string | undefined>;


export function useEditMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { clearAction } = useMessageActionsStore();

  return useMutation({
    mutationFn: async ({
      messageId,
      content,
    }: {
      messageId: string;
      content: string;
    }) => {
      return chatApi.editMessage(messageId, { content });
    },
    onMutate: async ({ messageId, content }) => {
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(conversationId),
      });

      const previousMessages = queryClient.getQueryData<
        InfiniteData<PaginatedMessages>
      >(chatKeys.messages(conversationId));

      // Optimistic update
      updateMessageInCache(queryClient, conversationId, messageId, (msg) => ({
        ...msg,
        content,
        isEdited: true,
      }));

      clearAction();

      return { previousMessages };
    },
    onError: (_err, _vars, context) => {
      // Rollback
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          context.previousMessages
        );
      }
      toast.error("Failed to edit message. Please try again.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}

export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { clearAction } = useMessageActionsStore();

  return useMutation({
    mutationFn: (messageId: string) => chatApi.deleteMessage(messageId),
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(conversationId),
      });

      const previousMessages = queryClient.getQueryData<
        InfiniteData<PaginatedMessages>
      >(chatKeys.messages(conversationId));

      // Optimistic update
      updateMessageInCache(
        queryClient,
        conversationId,
        messageId,
        (msg) =>
          ({
            ...msg,
            content: MESSAGE_STATES.DELETED_TEXT,
          } as Message)
      );

      clearAction();

      return { previousMessages };
    },
    onError: (_err, _messageId, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          context.previousMessages
        );
      }
      toast.error("Failed to delete message. Please try again.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}


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

      addMessageToCache(queryClient, conversationId, optimisticMessage);

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
      replaceMessageInCache(
        queryClient,
        conversationId,
        context.tempId,
        serverMessage
      );

      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}
