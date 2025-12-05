// lib/features/chats/hooks/realtime/useMessageSubscription.ts
import { useEffect } from "react";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { supabase } from "@/app/lib/supabase/client";
import {
  mapRealtimeMessage,
  type DbMessageRecord,
} from "../../utils/realtimeAdapter";
import { chatKeys } from "../../queryKeys";
import type { Message, PaginatedMessages } from "../../types";

/**
 * Subscribe to new messages in a conversation via Supabase Realtime
 */
export function useMessageSubscription(conversationId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
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

          // Update the messages cache with the new message
          queryClient.setQueryData<InfiniteData<PaginatedMessages>>(
            chatKeys.messages(conversationId),
            (old) => {
              if (!old) return old;

              // Check if message already exists in any page (prevent duplicates)
              const messageExists = old.pages.some((page) =>
                page.messages.some((msg) => msg.id === newMessage.id)
              );

              if (messageExists) {
                return old;
              }

              // Add message to the END of the first page (newest messages page)
              // Messages within each page are in chronological order (oldest first)
              // So new messages go at the end
              const updatedPages = [...old.pages];
              if (updatedPages[0]) {
                updatedPages[0] = {
                  ...updatedPages[0],
                  messages: [...updatedPages[0].messages, newMessage],
                };
              }

              return {
                ...old,
                pages: updatedPages,
              };
            }
          );

          // Invalidate conversations list to update lastMessage preview
          queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
        }
      )
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

          // Update message in cache
          queryClient.setQueryData<InfiniteData<PaginatedMessages>>(
            chatKeys.messages(conversationId),
            (old) => {
              if (!old) return old;

              const updatedPages = old.pages.map((page) => ({
                ...page,
                messages: page.messages.map((msg: Message) =>
                  msg.id === updatedMessage.id ? updatedMessage : msg
                ),
              }));

              return {
                ...old,
                pages: updatedPages,
              };
            }
          );
        }
      )
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

          // Remove message from cache
          queryClient.setQueryData<InfiniteData<PaginatedMessages>>(
            chatKeys.messages(conversationId),
            (old) => {
              if (!old) return old;

              const updatedPages = old.pages.map((page) => ({
                ...page,
                messages: page.messages.filter(
                  (msg: Message) => msg.id !== deletedMessageId
                ),
              }));

              return {
                ...old,
                pages: updatedPages,
              };
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
}
