import { supabase } from "@/app/modules/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { chatKeys } from "../../queryKeys";
import { useTypingStore } from "../../stores/typingStore";
import {
  mapMessageWithSender,
  type DbMessageWithSender,
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
  const setTyping = useTypingStore((state) => state.setTyping);

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
        async (payload) => {
          // Fetch the complete message with sender data
          const { data } = await supabase
            .from("messages")
            .select(
              `
              *,
              sender:profiles!messages_sender_id_fkey(
                id, 
                username, 
                first_name, 
                last_name, 
                avatar_url
              )
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (data) {
            const newMessage = mapMessageWithSender(
              data as DbMessageWithSender
            );

            addMessageToCache(queryClient, conversationId, newMessage);

            // If we receive a message from a user, stop showing them as typing
            setTyping(conversationId, newMessage.senderId, false);

            queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
          }
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
        async (payload) => {
          // Fetch the complete message with sender data
          const { data } = await supabase
            .from("messages")
            .select(
              `
              *,
              sender:profiles!messages_sender_id_fkey(
                id, 
                username, 
                first_name, 
                last_name, 
                avatar_url
              )
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (data) {
            const updatedMessage = mapMessageWithSender(
              data as DbMessageWithSender
            );

            updateMessageInCache(
              queryClient,
              conversationId,
              updatedMessage.id,
              () => updatedMessage
            );
          }
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
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient, setTyping]);
}
