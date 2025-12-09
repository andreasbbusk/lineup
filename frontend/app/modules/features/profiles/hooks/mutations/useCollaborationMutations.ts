import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCollaboration } from "../../api";

/**
 * Hook for deleting a collaboration
 */
export function useDeleteCollaboration(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collaborationId: string) => deleteCollaboration(collaborationId),
    onSuccess: () => {
      // Invalidate collaborations query to refetch the list
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["collaborations", userId],
        });
      }
    },
  });
}
