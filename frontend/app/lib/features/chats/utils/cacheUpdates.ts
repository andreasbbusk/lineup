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
  position: "start" | "end" = "end"
) => {
  queryClient.setQueryData<InfiniteData<PaginatedMessages>>(
    chatKeys.messages(conversationId),
    (oldData) => {
      if (!oldData) return oldData;

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
