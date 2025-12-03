"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../../api";
import { chatKeys } from "../../queryKeys";

type MessageInputProps = {
  conversationId: string;
  onTyping?: (isTyping: boolean) => void;
};

export function MessageInput({ conversationId, onTyping }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: (messageContent: string) =>
      chatApi.sendMessage({
        conversation_id: conversationId,
        content: messageContent,
        media_ids: [],
        reply_to_message_id: null,
      }),
    onSuccess: () => {
      setContent("");
      // Invalidate messages to refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
    },
  });

  // Handle typing indicator
  const handleTypingChange = (typing: boolean) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      onTyping?.(typing);
      chatApi.setTyping(conversationId, typing);
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;

    // Set typing indicator
    handleTypingChange(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingChange(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate(trimmedContent);
    handleTypingChange(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-crocus-yellow max-h-32 overflow-y-auto"
          disabled={sendMessageMutation.isPending}
        />
        <button
          type="submit"
          disabled={!content.trim() || sendMessageMutation.isPending}
          className="shrink-0 w-10 h-10 rounded-full bg-crocus-yellow flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
