import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { chatKeys } from "../queryKeys";
import { Message, PaginatedMessages } from "../types";

/**
 * Updates a message in the infinite query cache for a conversation.
 * Useful for optimistic updates (edit, delete).
 */
export const updateMessageInCache = (
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
  transformer: (message: Message) => Message
) => {
  queryClient.setQueryData<InfiniteData<PaginatedMessages>>(
    chatKeys.messages(conversationId),
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          messages: page.messages.map((msg) =>
            msg.id === messageId ? transformer(msg) : msg
          ),
        })),
      };
    }
  );
};
