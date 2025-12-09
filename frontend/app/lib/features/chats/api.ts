// lib/features/chats/api.ts
import { apiClient, handleApiError } from "@/app/lib/api/api-client";
import type {
  CreateConversationDto,
  UpdateConversationDto,
  AddParticipantsDto,
  SendMessageDto,
  EditMessageDto,
} from "./types";

export const chatApi = {
  // --- Conversations ---

  getConversations: async () => {
    // openapi-fetch infers the URL and return type automatically!
    const { data, error, response } = await apiClient.GET("/conversations");

    if (error) {
      return handleApiError(error, response);
    }
    return data;
  },

  getConversation: async (id: string) => {
    const { data, error, response } = await apiClient.GET(
      "/conversations/{conversationId}",
      {
        params: { path: { conversationId: id } },
      }
    );

    if (error) return handleApiError(error, response);
    return data;
  },

  getUnreadCount: async () => {
    const { data, error, response } = await apiClient.GET(
      "/conversations/unread-count"
    );

    if (error) return handleApiError(error, response);
    return data;
  },

  createConversation: async (body: CreateConversationDto) => {
    const { data, error, response } = await apiClient.POST("/conversations", {
      body,
    });

    if (error) return handleApiError(error, response);
    return data;
  },

  leaveConversation: async (conversationId: string) => {
    const { error, response } = await apiClient.DELETE(
      "/conversations/{conversationId}",
      {
        params: { path: { conversationId } },
      }
    );

    if (error) return handleApiError(error, response);
  },

  updateConversation: async (
    conversationId: string,
    body: UpdateConversationDto
  ) => {
    const { data, error, response } = await apiClient.PUT(
      "/conversations/{conversationId}",
      {
        params: { path: { conversationId } },
        body,
      }
    );

    if (error) return handleApiError(error, response);
    return data;
  },

  addParticipants: async (conversationId: string, body: AddParticipantsDto) => {
    const { data, error, response } = await apiClient.POST(
      "/conversations/{conversationId}/participants",
      {
        params: { path: { conversationId } },
        body,
      }
    );

    if (error) return handleApiError(error, response);
    return data;
  },

  removeParticipant: async (conversationId: string, userId: string) => {
    const { error, response } = await apiClient.DELETE(
      "/conversations/{conversationId}/participants/{userId}",
      {
        params: { path: { conversationId, userId } },
      }
    );

    if (error) return handleApiError(error, response);
  },

  // --- Messages ---

  getMessages: async (
    conversationId: string,
    params?: { before_message_id?: string; limit?: number }
  ) => {
    const { data, error, response } = await apiClient.GET(
      "/messages/{conversationId}",
      {
        params: {
          path: { conversationId },
          query: params,
        },
      }
    );

    if (error) return handleApiError(error, response);
    return data;
  },

  sendMessage: async (body: SendMessageDto) => {
    const { data, error, response } = await apiClient.POST("/messages", {
      body,
    });

    if (error) return handleApiError(error, response);
    return data;
  },

  editMessage: async (messageId: string, body: EditMessageDto) => {
    const { data, error, response } = await apiClient.PUT(
      "/messages/{messageId}",
      {
        params: { path: { messageId } },
        body,
      }
    );

    if (error) return handleApiError(error, response);
    return data;
  },

  deleteMessage: async (messageId: string) => {
    const { error, response } = await apiClient.DELETE(
      "/messages/{messageId}",
      {
        params: { path: { messageId } },
      }
    );

    if (error) return handleApiError(error, response);
  },

  markAsRead: async (messageIds: string[]) => {
    const { error, response } = await apiClient.POST("/messages/read", {
      body: { message_ids: messageIds },
    });

    if (error) return handleApiError(error, response);
  },

  setTyping: async (conversationId: string, isTyping: boolean) => {
    const { error, response } = await apiClient.POST(
      "/messages/typing/{conversationId}",
      {
        params: {
          path: { conversationId },
          query: { isTyping },
        },
      }
    );

    if (error) return handleApiError(error, response);
  },
};
