import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";
import { useMessageActionsStore } from "../../stores/messageStore";
import { PaginatedMessages } from "../../types";
import { updateMessageInCache } from "../../utils/cacheUpdates";

export function useEditMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { clearAction } = useMessageActionsStore();

  return useMutation({
    mutationFn: async ({
      messageId,
      content,
    }: {
      messageId: string;
      content: string;
    }) => {
      return chatApi.editMessage(messageId, { content });
    },
    onMutate: async ({ messageId, content }) => {
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(conversationId),
      });

      const previousMessages = queryClient.getQueryData<
        InfiniteData<PaginatedMessages>
      >(chatKeys.messages(conversationId));

      // Optimistic update
      updateMessageInCache(queryClient, conversationId, messageId, (msg) => ({
        ...msg,
        content,
        isEdited: true,
      }));

      clearAction();

      return { previousMessages };
    },
    onError: (_err, _vars, context) => {
      // Rollback
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          context.previousMessages
        );
      }
      toast.error("Failed to edit message. Please try again.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}
