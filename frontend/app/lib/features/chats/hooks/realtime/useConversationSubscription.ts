// lib/features/chats/hooks/realtime/useConversationSubscription.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/app/lib/supabase/client";
import { chatKeys } from "../../queryKeys";

/**
 * Subscribe to conversation updates via Supabase Realtime
 * Listens for new conversations, updates, and deletions
 */
export function useConversationSubscription(userId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`conversations:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          // Refetch conversations when any change occurs
          queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
          queryClient.invalidateQueries({ queryKey: chatKeys.unread() });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_participants",
        },
        () => {
          // Refetch when participant status changes
          queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
