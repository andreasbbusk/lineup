"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useCreateConversation, useConversations } from "@/app/modules/features/chats";
import type { CreateConversationDto } from "@/app/modules/features/chats/types";

interface StartChatOptions {
  participantId: string;
  postId?: string;
}

/**
 * Hook to start a chat or navigate to an existing one
 * Checks if a conversation already exists with the given participant and postId,
 * and either navigates to it or creates a new one
 * 
 * Supports two call signatures:
 * - Simple: startOrNavigateToChat(userId) - for backward compatibility
 * - Full: startOrNavigateToChat({ participantId, postId? }) - with optional postId
 */
export function useStartOrNavigateToChat() {
  const router = useRouter();
  const { data: conversationsData } = useConversations();
  const { mutate: createConversation, isPending: isCreating } =
    useCreateConversation();

  const startOrNavigateToChat = useCallback(
    (options: string | StartChatOptions) => {
      // Handle both string (userId) and object (options) signatures for backward compatibility
      const participantId = typeof options === "string" ? options : options.participantId;
      const postId = typeof options === "string" ? undefined : options.postId;

      // Get all conversations (direct and groups)
      const allConversations = conversationsData
        ? [...conversationsData.direct, ...conversationsData.groups]
        : [];

      // Try to find existing conversation
      // For direct conversations with a postId, match both participant and postId
      // For direct conversations without postId, match just the participant
      const existingConversation = allConversations.find((conv) => {
        if (conv.type !== "direct") return false;

        // Check if the conversation has the participant
        const hasParticipant = conv.participants?.some(
          (p) => p.userId === participantId
        );

        if (!hasParticipant) return false;

        // If postId is provided, check if conversation is linked to that post
        if (postId) {
          return conv.relatedPostId === postId;
        }

        // If no postId, match any direct conversation with this participant
        // (but prefer ones without a relatedPostId if multiple exist)
        return !conv.relatedPostId;
      });

      // If conversation exists, navigate to it
      if (existingConversation?.id) {
        router.push(`/chats/${existingConversation.id}`);
        return;
      }

      // Otherwise, create a new conversation
      const conversationData: CreateConversationDto = {
        type: "direct",
        participantIds: [participantId],
        name: null,
        avatarUrl: null,
        postId: postId || undefined,
      };

      createConversation(conversationData, {
        onSuccess: (conversation) => {
          router.push(`/chats/${conversation.id}`);
        },
        onError: (error) => {
          console.error("Failed to create conversation:", error);
        },
      });
    },
    [router, conversationsData, createConversation]
  );

  return {
    startOrNavigateToChat,
    isCreating,
  };
}

