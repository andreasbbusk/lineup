import { supabase } from "@/app/modules/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTypingStore } from "../../stores/typingStore";
import {
  handleMessageInsert,
  handleMessageUpdate,
  handleMessageDelete,
} from "../../utils/realtimeMessageHandlers";

const messageEventConfig = {
  schema: "public" as const,
  table: "messages" as const,
};

export function useGlobalMessageSubscription(userId: string | null) {
  const queryClient = useQueryClient();
  const setTyping = useTypingStore((state) => state.setTyping);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`global-messages:${userId}`)
      .on(
        "postgres_changes",
        { ...messageEventConfig, event: "INSERT" },
        (payload) =>
          handleMessageInsert(queryClient, payload, {
            onMessageReceived: (convId, senderId) =>
              setTyping(convId, senderId, false),
          })
      )
      .on(
        "postgres_changes",
        { ...messageEventConfig, event: "UPDATE" },
        (payload) =>
          handleMessageUpdate(queryClient, payload, {
            onlyUpdateIfCacheExists: true,
          })
      )
      .on(
        "postgres_changes",
        { ...messageEventConfig, event: "DELETE" },
        (payload) =>
          handleMessageDelete(queryClient, payload, {
            onlyUpdateIfCacheExists: true,
          })
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, queryClient, setTyping]);
}
