import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blockUser, unblockUser } from "@/app/modules/api/usersApi";

/**
 * Hook to block a user
 */
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return blockUser(userId);
    },
    onSuccess: (_, userId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["blockStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["connectionStatus"] });
    },
  });
}

/**
 * Hook to unblock a user
 */
export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return unblockUser(userId);
    },
    onSuccess: (_, userId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["blockStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
}
