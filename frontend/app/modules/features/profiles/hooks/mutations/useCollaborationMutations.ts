import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCollaboration, createCollaboration } from "../../api";

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

/**
 * Hook for creating a collaboration
 */
export function useCreateCollaboration(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collaboratorId: string) => createCollaboration(collaboratorId),
    onSuccess: () => {
      // Invalidate collaborations query to refetch the list
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["collaborations", userId],
        });
      }
      // Also invalidate post respondents since they may be updated
      queryClient.invalidateQueries({
        queryKey: ["posts", "respondents", "all"],
      });
    },
  });
}
