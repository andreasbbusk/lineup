import { useQuery } from "@tanstack/react-query";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";
import { STALE_TIME } from "../../constants";
import { searchApi } from "@/app/modules/features/search";
import type { components } from "@/app/modules/types/api";

type UserSearchResult = components["schemas"]["UserSearchResult"];

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
      return data?.unread_count ?? 0;
    },
    staleTime: STALE_TIME.USER_SEARCH,
  });

/**
 * Hook to fetch user's connections (suggestions)
 */
export function useConnections() {
  return useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const response = await searchApi.searchUsers("", 100);

      // Filter for connected users only and sort alphabetically
      const connectedUsers = (response?.results || [])
        .filter(
          (result): result is UserSearchResult =>
            result.type === "user" && result.isConnected === true
        )
        .sort((a, b) => a.username.localeCompare(b.username));

      return connectedUsers;
    },
    staleTime: STALE_TIME.CONNECTIONS,
  });
}
