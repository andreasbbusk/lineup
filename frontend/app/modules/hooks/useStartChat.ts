"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCreateConversation } from "@/app/modules/features/chats/hooks/query/conversationMutations";

/**
 * Global hook for starting a chat with a user
 *
 * Creates a direct conversation and navigates to the chat interface.
 * Handles conversation creation errors gracefully.
 *
 * @example
 * ```tsx
 * const startChat = useStartChat();
 *
 * <Button onClick={() => startChat(userId)}>
 *   Message
 * </Button>
 * ```
 */
export function useStartChat() {
  const router = useRouter();
  const createConversation = useCreateConversation();

  const startChat = useCallback(
    async (userId: string) => {
      try {
        const conversation = await createConversation.mutateAsync({
          type: "direct",
          participantIds: [userId],
        });

        if (conversation?.id) {
          router.push(`/chats/${conversation.id}`);
        }
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    },
    [createConversation, router]
  );

  return startChat;
}
