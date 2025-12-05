import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageIds: string[]) => chatApi.markAsRead(messageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.unread() });
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() }); 
    },
  });
}

