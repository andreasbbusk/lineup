import { create } from "zustand";

interface TypingState {
  // Map of conversationId -> Set of userIds who are typing
  typingUsers: Record<string, Set<string>>;

  // Actions
  setTyping: (
    conversationId: string,
    userId: string,
    isTyping: boolean
  ) => void;
  clearTyping: (conversationId: string) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingUsers: {},

  setTyping: (conversationId, userId, isTyping) =>
    set((state) => {
      const currentTypers = new Set(state.typingUsers[conversationId] || []);

      if (isTyping) {
        currentTypers.add(userId);
      } else {
        currentTypers.delete(userId);
      }

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: currentTypers,
        },
      };
    }),

  clearTyping: (conversationId) =>
    set((state) => {
      const newTypingUsers = { ...state.typingUsers };
      delete newTypingUsers[conversationId];
      return { typingUsers: newTypingUsers };
    }),
}));
