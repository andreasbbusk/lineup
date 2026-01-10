import { InfiniteData, QueryClient } from "@tanstack/react-query";
import { chatKeys } from "../queryKeys";
import { Message, PaginatedMessages } from "../types";

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

export const addMessageToCache = (
  queryClient: QueryClient,
  conversationId: string,
  message: Message,
  position: "start" | "end" = "end",
  initializeIfMissing: boolean = false
) => {
  queryClient.setQueryData<InfiniteData<PaginatedMessages>>(
    chatKeys.messages(conversationId),
    (oldData) => {
      // If cache doesn't exist and we're allowed to initialize it
      if (!oldData) {
        if (initializeIfMissing) {
          return {
            pages: [
              {
                messages: [message],
                hasMore: true,
                nextCursor: null,
              },
            ],
            pageParams: [undefined],
          };
        }
        // If cache doesn't exist and we shouldn't initialize, return undefined
        // This will leave the cache unchanged (still undefined)
        return oldData;
      }

      const updatedPages = [...oldData.pages];
      const targetPage = position === "end" ? updatedPages[0] : updatedPages[updatedPages.length - 1];

      if (targetPage) {
        const isDuplicate = targetPage.messages.some((msg) => msg.id === message.id);
        if (isDuplicate) return oldData;

        if (position === "end") {
          updatedPages[0] = {
            ...targetPage,
            messages: [...targetPage.messages, message],
          };
        } else {
          updatedPages[updatedPages.length - 1] = {
            ...targetPage,
            messages: [message, ...targetPage.messages],
          };
        }
      }

      return {
        ...oldData,
        pages: updatedPages,
      };
    }
  );
};

export const removeMessageFromCache = (
  queryClient: QueryClient,
  conversationId: string,
  messageId: string
) => {
  queryClient.setQueryData<InfiniteData<PaginatedMessages>>(
    chatKeys.messages(conversationId),
    (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          messages: page.messages.filter((msg) => msg.id !== messageId),
        })),
      };
    }
  );
};

export const replaceMessageInCache = (
  queryClient: QueryClient,
  conversationId: string,
  tempId: string,
  newMessage: Message
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
            msg.id === tempId ? newMessage : msg
          ),
        })),
      };
    }
  );
};
