import { supabase } from "@/app/modules/supabase/client";
import { QueryClient } from "@tanstack/react-query";
import { chatKeys } from "../queryKeys";
import {
  mapMessageWithSender,
  type DbMessageWithSender,
} from "./realtimeAdapter";
import { addMessageToCache, updateMessageInCache } from "./cacheUpdates";
import { Message } from "../types";

/**
 * Supabase select query for fetching a message with sender profile data.
 * This is the standard query used across all realtime message handlers.
 */
export const MESSAGE_WITH_SENDER_SELECT = `
  *,
  sender:profiles!messages_sender_id_fkey(
    id, 
    username, 
    first_name, 
    last_name, 
    avatar_url
  )
`;

/**
 * Fetches a complete message with sender data from Supabase.
 *
 * @param messageId - The ID of the message to fetch
 * @returns The message with sender data, or null if not found
 */
export async function fetchMessageWithSender(
  messageId: string
): Promise<Message | null> {
  const { data } = await supabase
    .from("messages")
    .select(MESSAGE_WITH_SENDER_SELECT)
    .eq("id", messageId)
    .single();

  if (!data) return null;

  return mapMessageWithSender(data as DbMessageWithSender);
}

type RealtimePayload = Record<string, unknown> & {
  new?: Record<string, unknown>;
  old?: Record<string, unknown>;
};

type MessageHandlerConfig = {
  initializeCacheIfMissing?: boolean;
  onlyUpdateIfCacheExists?: boolean;
  onMessageReceived?: (conversationId: string, senderId: string) => void;
  invalidateConversationList?: boolean;
};

function hasCache(queryClient: QueryClient, conversationId: string): boolean {
  return !!queryClient.getQueryData(chatKeys.messages(conversationId));
}

export async function handleMessageInsert(
  queryClient: QueryClient,
  payload: RealtimePayload,
  config: MessageHandlerConfig
): Promise<void> {
  const messageId = payload.new?.id as string | undefined;
  const conversationId = payload.new?.conversation_id as string | undefined;
  if (!messageId || !conversationId) return;

  const message = await fetchMessageWithSender(messageId);
  if (!message) return;

  const {
    initializeCacheIfMissing = false,
    onMessageReceived,
    invalidateConversationList = true,
  } = config;

  if (initializeCacheIfMissing) {
    addMessageToCache(queryClient, conversationId, message, "end", true);
  } else if (hasCache(queryClient, conversationId)) {
    addMessageToCache(queryClient, conversationId, message);
  }

  onMessageReceived?.(conversationId, message.senderId);
  if (invalidateConversationList) {
    queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
  }
}

export async function handleMessageUpdate(
  queryClient: QueryClient,
  payload: RealtimePayload,
  config: MessageHandlerConfig = {}
): Promise<void> {
  const messageId = payload.new?.id as string | undefined;
  const conversationId = payload.new?.conversation_id as string | undefined;
  if (!messageId || !conversationId) return;

  const { onlyUpdateIfCacheExists = false } = config;
  if (onlyUpdateIfCacheExists && !hasCache(queryClient, conversationId)) return;

  const message = await fetchMessageWithSender(messageId);
  if (!message) return;

  updateMessageInCache(queryClient, conversationId, message.id, () => message);
}

export function handleMessageDelete(
  queryClient: QueryClient,
  payload: RealtimePayload,
  config: MessageHandlerConfig = {}
): void {
  const messageId = payload.old?.id as string | undefined;
  const conversationId = payload.old?.conversation_id as string | undefined;
  if (!messageId || !conversationId) return;

  const { onlyUpdateIfCacheExists = false } = config;
  if (onlyUpdateIfCacheExists && !hasCache(queryClient, conversationId)) return;

  updateMessageInCache(queryClient, conversationId, messageId, (msg) => ({
    ...msg,
    isDeleted: true,
  }));
}
