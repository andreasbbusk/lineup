import { create } from "zustand";

interface ActiveMessageAction {
  messageId: string;
  type: "edit" | "delete";
  originalContent: string | null;
}

interface MessageActionsState {
  activeMessageAction: ActiveMessageAction | null;
  startEdit: (messageId: string, content: string) => void;
  startDelete: (messageId: string) => void;
  clearAction: () => void;
}

export const useMessageActionsStore = create<MessageActionsState>((set) => ({
  activeMessageAction: null,
  startEdit: (messageId, content) =>
    set({
      activeMessageAction: { messageId, type: "edit", originalContent: content },
    }),
  startDelete: (messageId) =>
    set({
      activeMessageAction: { messageId, type: "delete", originalContent: null },
    }),
  clearAction: () => set({ activeMessageAction: null }),
}));
