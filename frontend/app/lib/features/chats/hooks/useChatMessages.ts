// lib/features/chats/hooks/useChatMessages.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { chatApi } from "../api";
import { chatKeys } from "../queryKeys";
import { mapApiMessage, type DbMessageRecord } from "../utils/realtimeAdapter";
import { Message } from "../types";

const DEFAULT_PAGE_SIZE = 50;

/**
 * Hook for fetching messages with infinite scroll (pagination)
 * Messages are loaded in reverse chronological order
 */
export function useChatMessages(conversationId: string, pageSize: number = DEFAULT_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: async ({ pageParam }) => {
      const response = await chatApi.getMessages(conversationId, {
        limit: pageSize,
        before_message_id: pageParam,
      });

      // Map snake_case API response to camelCase
      // Type assertion because the API schema has an error type, but the actual response is correct
      const messages: Message[] = response ? (response as unknown as DbMessageRecord[]).map(mapApiMessage) : [];

      return {
        messages,
        // The cursor for the next page is the ID of the oldest message in this batch
        nextCursor: messages.length > 0 ? messages[messages.length - 1].id : undefined,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!conversationId,
    staleTime: 1000 * 60, // 1 minute
  });
}
