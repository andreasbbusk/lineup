// lib/features/chats/queryKeys.ts
export const chatKeys = {
    all: ["chats"] as const,
    lists: () => [...chatKeys.all, "list"] as const,
    // Specific conversation details
    detail: (id: string) => [...chatKeys.all, "detail", id] as const,
    // Messages within a conversation
    messages: (conversationId: string) => [...chatKeys.all, "messages", conversationId] as const,
    // Unread count
    unread: () => [...chatKeys.all, "unread"] as const,
  };
  