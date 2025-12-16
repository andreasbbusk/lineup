import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";
import { useMessageActionsStore } from "../../stores/messageStore";
import { Message, PaginatedMessages } from "../../types";
import {
  addMessageToCache,
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
    },
    onSuccess: async () => {
      // Force immediate refetch of conversation list to get updated last message
      await queryClient.refetchQueries({
        queryKey: chatKeys.lists(),
        type: "active",
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
    },
    onSuccess: async () => {
      // Force immediate refetch of conversation list to get updated last message
      await queryClient.refetchQueries({
        queryKey: chatKeys.lists(),
        type: "active",
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

    onMutate: async (content: string) => {
      const tempId = `temp-${Date.now()}-${Math.random()}`;

      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(conversationId),
      });
      await queryClient.cancelQueries({
        queryKey: chatKeys.lists(),
      });

      const snapshot = queryClient.getQueryData<InfiniteMessages>(
        chatKeys.messages(conversationId)
      );

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

      // Optimistically update conversation list (non-infinite structure)
      const conversationsSnapshot = queryClient.getQueryData(chatKeys.lists());

      queryClient.setQueryData(chatKeys.lists(), (oldData: unknown) => {
        if (!oldData || typeof oldData !== "object") return oldData;

        const data = oldData as {
          direct: Array<{
            id: string;
            lastMessage?: {
              content: string;
              senderId: string;
              createdAt: string;
            };
            updatedAt?: string;
          }>;
          groups: Array<{
            id: string;
            lastMessage?: {
              content: string;
              senderId: string;
              createdAt: string;
            };
            updatedAt?: string;
          }>;
        };

        const now = new Date().toISOString();
        const newLastMessage = {
          content,
          senderId: userId,
          createdAt: now,
        };

        return {
          direct: data.direct.map((conv) =>
            conv.id === conversationId
              ? { ...conv, lastMessage: newLastMessage, updatedAt: now }
              : conv
          ),
          groups: data.groups.map((conv) =>
            conv.id === conversationId
              ? { ...conv, lastMessage: newLastMessage, updatedAt: now }
              : conv
          ),
        };
      });

      return { snapshot, conversationsSnapshot, tempId };
    },

    onError: (_err, _content, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          context.snapshot
        );
      }
      if (context?.conversationsSnapshot) {
        queryClient.setQueryData(
          chatKeys.lists(),
          context.conversationsSnapshot
        );
      }
    },

    onSuccess: (serverMessage, _content, context) => {
      queryClient.setQueryData<InfiniteMessages>(
        chatKeys.messages(conversationId),
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              messages: page.messages.map((msg) => {
                if (msg.id === context.tempId) {
                  return {
                    ...msg,
                    ...serverMessage,
                    createdAt: msg.createdAt,
                  };
                }
                return msg;
              }),
            })),
          };
        }
      );

      // Refetch to get accurate server state with full sender info
      queryClient.refetchQueries({
        queryKey: chatKeys.lists(),
      });
    },
  });
}
