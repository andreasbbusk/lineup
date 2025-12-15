import type { NotificationResponse } from "../types";

/**
 * Deduplicate connection requests by keeping the most recent one per actor
 */
export function deduplicateConnectionRequests(
  requests: NotificationResponse[]
): NotificationResponse[] {
  const map = new Map<string, NotificationResponse>();

  for (const request of requests) {
    const actorId = request.actorId;
    if (!actorId) {
      // Keep requests without actorId
      map.set(`no-actor-${request.id}`, request);
      continue;
    }

    const existing = map.get(actorId);
    if (!existing) {
      map.set(actorId, request);
      continue;
    }

    // Keep the most recent one
    const existingDate = existing.createdAt
      ? new Date(existing.createdAt).getTime()
      : 0;
    const currentDate = request.createdAt
      ? new Date(request.createdAt).getTime()
      : 0;

    if (currentDate > existingDate) {
      map.set(actorId, request);
    }
  }

  return Array.from(map.values());
}

