import { useQuery } from "@tanstack/react-query";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";

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

