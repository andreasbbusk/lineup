import { QueryClient } from "@tanstack/react-query";
import { NOTIFICATION_QUERY_KEYS } from "./queryKeys";

/**
 * Context type for optimistic updates
 */
export interface OptimisticUpdateContext {
  previousQueries: Array<[readonly unknown[], unknown]>;
}

/**
 * Prepare for optimistic update by canceling queries and snapshotting current state
 */
export async function prepareOptimisticUpdate(
  queryClient: QueryClient
): Promise<OptimisticUpdateContext> {
  // Cancel any outgoing refetches to avoid overwriting optimistic update
  await queryClient.cancelQueries({
    queryKey: NOTIFICATION_QUERY_KEYS.all,
    exact: false,
  });

  // Snapshot the previous value for all notification queries
  const previousQueries = queryClient.getQueriesData({
    queryKey: NOTIFICATION_QUERY_KEYS.all,
    exact: false,
  });

  return { previousQueries };
}

/**
 * Rollback optimistic update on error
 */
export function rollbackOptimisticUpdate(
  queryClient: QueryClient,
  context: OptimisticUpdateContext | undefined
): void {
  if (context?.previousQueries) {
    context.previousQueries.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data);
    });
  }
}
