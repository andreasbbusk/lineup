import {
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";
import type { Message } from "../../types";

// Type for the infinite query page structure
type MessagesPage = {
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
};

// Type for the infinite query data
type InfiniteMessages = InfiniteData<MessagesPage, string | undefined>;

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
      const tempId = `temp-${Date.now()}`;

      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(conversationId),
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

      queryClient.setQueryData<InfiniteMessages>(
        chatKeys.messages(conversationId),
        (old) => {
          if (!old) return old;

          const newPages = [...old.pages];
          const lastPageIndex = newPages.length - 1;
          const lastPage = newPages[lastPageIndex];

          newPages[lastPageIndex] = {
            ...lastPage,
            messages: [...lastPage.messages, optimisticMessage],
          };

          return {
            ...old,
            pages: newPages,
          };
        }
      );

      return { snapshot, tempId };
    },

    onError: (_err, _content, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          context.snapshot
        );
      }
    },

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

      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}
