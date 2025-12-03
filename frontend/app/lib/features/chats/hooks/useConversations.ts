// lib/features/chats/hooks/useConversations.ts
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "../api";
import { chatKeys } from "../queryKeys";
import { GroupedConversations } from "../types";

/**
 * Hook to fetch and group conversations by type (direct vs group)
 */
export function useConversations() {
  return useQuery({
    queryKey: chatKeys.lists(),
    queryFn: async () => {
      const conversations = await chatApi.getConversations();

      // Group conversations by type
      const grouped: GroupedConversations = {
        direct: [],
        groups: [],
      };

      if (conversations) {
        conversations.forEach((conv) => {
          if (conv.type === "direct") {
            grouped.direct.push(conv);
          } else {
            grouped.groups.push(conv);
          }
        });
      }

      return grouped;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

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

/**
 * Hook to fetch unread message count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: chatKeys.unread(),
    queryFn: async () => {
      const data = await chatApi.getUnreadCount();
      return data?.unread_count ?? 0;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}
