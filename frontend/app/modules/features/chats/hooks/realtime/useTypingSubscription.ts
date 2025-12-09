import { useEffect } from "react";
import { supabase } from "@/app/modules/supabase/client";
import { useTypingStore } from "../../stores/typingStore";

export function useTypingSubscription(conversationId: string | null) {
  const setTyping = useTypingStore((state) => state.setTyping);
  const clearTyping = useTypingStore((state) => state.clearTyping);

  useEffect(() => {
    if (!conversationId) return;

    // Clear typing status when mounting/changing conversation
    clearTyping(conversationId);

    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_participants",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const { user_id, is_typing } = payload.new as {
            user_id: string;
            is_typing: boolean;
          };

          setTyping(conversationId, user_id, is_typing);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      clearTyping(conversationId);
    };
  }, [conversationId, setTyping, clearTyping]);
}
