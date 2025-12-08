import { supabase } from "@/app/lib/supabase/client";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { chatKeys } from "../../queryKeys";
import type { PaginatedMessages } from "../../types";
import {
  mapRealtimeMessage,
  type DbMessageRecord,
} from "../../utils/realtimeAdapter";
import { updateMessageInCache } from "../../utils/cacheUpdates";

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

          queryClient.setQueryData<InfiniteData<PaginatedMessages>>(
            chatKeys.messages(conversationId),
            (old) => {
              if (!old) return old;

              // Prevent duplicates (message might already exist from optimistic update)
              const messageExists = old.pages.some((page) =>
                page.messages.some((msg) => msg.id === newMessage.id)
              );

              if (messageExists) return old;

              // Add to first page (most recent messages)
              const updatedPages = [...old.pages];
              if (updatedPages[0]) {
                updatedPages[0] = {
                  ...updatedPages[0],
                  messages: [...updatedPages[0].messages, newMessage],
                };
              }

              return { ...old, pages: updatedPages };
            }
          );

          // Update conversation list preview
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
              content: "This message was deleted.",
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
