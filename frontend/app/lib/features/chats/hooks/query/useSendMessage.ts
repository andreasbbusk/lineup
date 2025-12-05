import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageContent: string) =>
      chatApi.sendMessage({
        conversation_id: conversationId,
        content: messageContent,
        media_ids: [],
        reply_to_message_id: null,
      }),
    onSuccess: () => {
      // Invalidate messages to refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}

