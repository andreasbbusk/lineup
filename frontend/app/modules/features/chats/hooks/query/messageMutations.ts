import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";
import { useMessageActionsStore } from "../../stores/messageStore";
import { Message, PaginatedMessages, GroupedConversations } from "../../types";
import {
  addMessageToCache,
  replaceMessageInCache,
  updateMessageInCache,
} from "../../utils/cacheUpdates";

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

      const messagesSnapshot = queryClient.getQueryData<
        InfiniteData<PaginatedMessages>
      >(chatKeys.messages(conversationId));

      // Optimistic update: update message in messages cache only
      updateMessageInCache(queryClient, conversationId, messageId, (msg) => ({
        ...msg,
        content,
        isEdited: true,
      }));

      clearAction();

      return { messagesSnapshot };
    },
    onError: (_err, _vars, context) => {
      if (context?.messagesSnapshot) {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          context.messagesSnapshot
        );
      }
      toast.error("Failed to edit message. Please try again.");
    },
    onSuccess: async () => {
      // Force immediate refetch of conversation list to get updated last message
      await queryClient.refetchQueries({
        queryKey: chatKeys.lists(),
        type: 'active'
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.unread() });
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

      const messagesSnapshot = queryClient.getQueryData<
        InfiniteData<PaginatedMessages>
      >(chatKeys.messages(conversationId));

      // Optimistic update: mark message as deleted in messages cache only
      updateMessageInCache(
        queryClient,
        conversationId,
        messageId,
        (msg) =>
          ({
            ...msg,
            isDeleted: true,
            deletedAt: new Date().toISOString(),
          } as Message)
      );

      clearAction();

      return { messagesSnapshot };
    },
    onError: (_err, _messageId, context) => {
      if (context?.messagesSnapshot) {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          context.messagesSnapshot
        );
      }
      toast.error("Failed to delete message. Please try again.");
    },
    onSuccess: async () => {
      // Force immediate refetch of conversation list to get updated last message
      await queryClient.refetchQueries({
        queryKey: chatKeys.lists(),
        type: 'active'
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.unread() });
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
      const now = new Date().toISOString();

      // Cancel in-flight queries to avoid race conditions
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(conversationId),
      });
      await queryClient.cancelQueries({
        queryKey: chatKeys.lists(),
      });

      // Save current state for rollback on error
      const messagesSnapshot = queryClient.getQueryData<InfiniteMessages>(
        chatKeys.messages(conversationId)
      );
      const conversationsSnapshot = queryClient.getQueryData<GroupedConversations>(
        chatKeys.lists()
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
        createdAt: now,
        sentViaWebsocket: null,
        sender: undefined,
        replyTo: null,
        readReceipts: [],
        media: [],
      };

      // Optimistically add message to messages cache
      addMessageToCache(queryClient, conversationId, optimisticMessage);

      // Optimistically update conversation list with new last message preview
      if (conversationsSnapshot) {
        const updateConversationPreview = (conversations: typeof conversationsSnapshot.direct) => {
          return conversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                lastMessagePreview: content.length > 50 ? content.slice(0, 50) + '...' : content,
                lastMessageAt: now,
                lastMessageId: tempId,
                lastMessageSenderId: userId,
              };
            }
            return conv;
          });
        };

        queryClient.setQueryData<GroupedConversations>(chatKeys.lists(), {
          direct: updateConversationPreview(conversationsSnapshot.direct),
          groups: updateConversationPreview(conversationsSnapshot.groups),
        });
      }

      return { messagesSnapshot, conversationsSnapshot, tempId };
    },

    // Rollback: Restore previous state if send fails
    onError: (_err, _content, context) => {
      if (context?.messagesSnapshot) {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          context.messagesSnapshot
        );
      }
      if (context?.conversationsSnapshot) {
        queryClient.setQueryData(
          chatKeys.lists(),
          context.conversationsSnapshot
        );
      }
    },

    // Replace temporary message with server response
    onSuccess: async (serverMessage, _content, context) => {
      replaceMessageInCache(
        queryClient,
        conversationId,
        context.tempId,
        serverMessage
      );

      // Force immediate refetch of conversation list
      await queryClient.refetchQueries({
        queryKey: chatKeys.lists(),
        type: 'active'
      });
      queryClient.invalidateQueries({ queryKey: chatKeys.unread() });
    },
  });
}
