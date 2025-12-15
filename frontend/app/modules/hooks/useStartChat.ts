"use client";

import { useStartOrNavigateToChat } from "./useStartOrNavigateToChat";

/**
 * Global hook for starting a chat with a user
 *
 * @deprecated Use useStartOrNavigateToChat instead for better functionality (checks for existing chats)
 * This hook is kept for backward compatibility
 *
 * Creates a direct conversation and navigates to the chat interface.
 * Now uses useStartOrNavigateToChat internally to check for existing conversations first.
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
  const { startOrNavigateToChat } = useStartOrNavigateToChat();

  // Return function that matches the old API: (userId: string) => void
  return startOrNavigateToChat;
}
