import { create } from "zustand";
import type { Message } from "../types";

interface ActiveMessageAction {
  messageId: string;
  type: "edit" | "delete" | "reply";
  originalContent: string | null;
  replyToMessage?: Message | null;
}

interface MessageActionsState {
  activeMessageAction: ActiveMessageAction | null;
  startEdit: (messageId: string, content: string) => void;
  startDelete: (messageId: string) => void;
  startReply: (message: Message) => void;
  clearAction: () => void;
}

export const useMessageActionsStore = create<MessageActionsState>((set) => ({
  activeMessageAction: null,
  startEdit: (messageId, content) =>
    set({
      activeMessageAction: {
        messageId,
        type: "edit",
        originalContent: content,
        replyToMessage: null,
      },
    }),
  startDelete: (messageId) =>
    set({
      activeMessageAction: {
        messageId,
        type: "delete",
        originalContent: null,
        replyToMessage: null,
      },
    }),
  startReply: (message) =>
    set({
      activeMessageAction: {
        messageId: message.id,
        type: "reply",
        originalContent: null,
        replyToMessage: message,
      },
    }),
  clearAction: () => set({ activeMessageAction: null }),
}));
