import { supabase } from "@/app/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { MESSAGE_STATES } from "../../constants";
import { chatKeys } from "../../queryKeys";
import {
  mapRealtimeMessage,
  type DbMessageRecord,
} from "../../utils/realtimeAdapter";
import {
  updateMessageInCache,
  addMessageToCache,
} from "../../utils/cacheUpdates";

/**
 * Subscribe to real-time message updates via Supabase Realtime
 * Listens for INSERT, UPDATE, and DELETE events on the messages table
 * Automatically updates the query cache to reflect changes
 */
export function useMessageSubscription(conversationId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      // ========================================================================
      // INSERT: New message received
      // ========================================================================
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = mapRealtimeMessage(payload.new as DbMessageRecord);

          addMessageToCache(queryClient, conversationId, newMessage);

          queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
        }
      )
      // ========================================================================
      // UPDATE: Message edited
      // ========================================================================
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = mapRealtimeMessage(
            payload.new as DbMessageRecord
          );

          updateMessageInCache(
            queryClient,
            conversationId,
            updatedMessage.id,
            () => updatedMessage
          );
        }
      )
      // ========================================================================
      // DELETE: Message removed
      // ========================================================================
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const deletedMessageId = payload.old.id;

          updateMessageInCache(
            queryClient,
            conversationId,
            deletedMessageId,
            (msg) => ({
              ...msg,
              isDeleted: true,
              content: MESSAGE_STATES.DELETED_TEXT,
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
}
