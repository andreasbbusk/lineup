import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertUserFaq, deleteUserFaq } from "../../api";

/**
 * Hook to upsert a user FAQ answer
 */
export function useUpsertFaq(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { questionId: string; answer: string }) =>
      upsertUserFaq(username, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq", username] });
    },
  });
}

/**
 * Hook to delete a user FAQ answer
 */
export function useDeleteFaq(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => deleteUserFaq(username, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq", username] });
    },
  });
}
