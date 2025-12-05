import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";
import { Message } from "../../types";

const DEFAULT_PAGE_SIZE = 50;

/**
 * Hook for fetching messages with infinite scroll (pagination)
 * Returns both the query result and a flattened, deduplicated list of messages.
 */
export function useChatMessages(
  conversationId: string,
  pageSize: number = DEFAULT_PAGE_SIZE
) {
  const query = useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: async ({ pageParam }) => {
      const response = await chatApi.getMessages(conversationId, {
        limit: pageSize,
        before_message_id: pageParam,
      });

      // Type assertion - the response is already properly typed from backend
      return response as unknown as {
        messages: Message[];
        hasMore: boolean;
        nextCursor: string | null;
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!conversationId,
    staleTime: 1000 * 60, // 1 minute
  });

  const messages = useMemo(() => {
    if (!query.data?.pages) return [];

    // Reverse pages so oldest page comes first (history -> newest)
    const allMessages = [...query.data.pages]
      .reverse()
      .flatMap((page) => page.messages);

    // Deduplicate
    const seen = new Set<string>();
    return allMessages.filter((message) => {
      if (seen.has(message.id)) return false;
      seen.add(message.id);
      return true;
    });
  }, [query.data]);

  return { ...query, messages };
}
