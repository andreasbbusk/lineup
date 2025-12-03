"use client";

import React, { useState } from "react";
import { Tabs, TabsContent } from "@/app/components/tabs";
import { useConversations } from "../../hooks/useConversations";
import { useConversationSubscription } from "../../hooks/realtime/useConversationSubscription";
import { ChatRow } from "./ChatRow";

type ConversationListProps = {
  currentUserId: string;
  onConversationClick: (conversationId: string) => void;
};

export function ConversationList({
  currentUserId,
  onConversationClick,
}: ConversationListProps) {
  const [activeTab, setActiveTab] = useState<"chats" | "groups">("chats");
  const { data, error } = useConversations();

  // Subscribe to real-time conversation updates
  useConversationSubscription(currentUserId);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Failed to load conversations</div>
      </div>
    );
  }

  const directChats = data?.direct ?? [];
  const groupChats = data?.groups ?? [];

  return (
    <div className="flex flex-col h-full">
      <Tabs variant="chat" activeTab={activeTab} onTabChange={setActiveTab}>
        <TabsContent value="chats">
          {directChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-grey text-center">No direct chats yet</p>
              <p className="text-sm text-grey text-center mt-2">
                Start a conversation with someone!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {directChats.map((conversation) => (
                <ChatRow
                  key={conversation.id}
                  conversation={conversation}
                  currentUserId={currentUserId}
                  onClick={() => onConversationClick(conversation.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="groups">
          {groupChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-grey text-center">No group chats yet</p>
              <p className="text-sm text-grey text-center mt-2">
                Create or join a group!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {groupChats.map((conversation) => (
                <ChatRow
                  key={conversation.id}
                  conversation={conversation}
                  currentUserId={currentUserId}
                  onClick={() => onConversationClick(conversation.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
