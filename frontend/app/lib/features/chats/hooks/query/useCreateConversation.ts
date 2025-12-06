import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";

/**
 * Hook to create a new conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (participantIds: string[]) =>
      chatApi.createConversation({
        type: "direct",
        participantIds,
        name: null,
        avatarUrl: null,
      }),
    onSuccess: () => {
      // Invalidate conversations list to show new conversation
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}
