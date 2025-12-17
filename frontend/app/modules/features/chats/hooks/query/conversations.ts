import { useQuery } from "@tanstack/react-query";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";
import { STALE_TIME } from "../../constants";

/**
 * Hook to fetch a single conversation by ID
 */
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: chatKeys.detail(conversationId),
    queryFn: () => chatApi.getConversation(conversationId),
    enabled: !!conversationId,
  });
}

export const useConversations = () =>
  useQuery({
    queryKey: chatKeys.lists(),
    queryFn: async () => {
      const conversations =
        (await chatApi.getConversations())?.filter(
          (conv) => conv.type === "group" || conv.lastMessagePreview
        ) ?? [];

      return {
        direct: conversations.filter((conv) => conv.type === "direct"),
        groups: conversations.filter((conv) => conv.type === "group"),
      };
    },
    staleTime: STALE_TIME.CONVERSATIONS,
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: chatKeys.unread(),
    queryFn: async () => {
      const data = await chatApi.getUnreadCount();
      return data?.count ?? 0;
    },
    staleTime: STALE_TIME.USER_SEARCH,
  });

