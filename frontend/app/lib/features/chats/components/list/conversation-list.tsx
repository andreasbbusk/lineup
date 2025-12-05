import { Tabs, TabsContent } from "@/app/components/tabs";
import { useState } from "react";
import { GroupedConversations } from "../../types";
import { ChatRow } from "./chat-row";
import { ChatRowSkeleton } from "@/app/components/skeleton";

type ConversationListProps = {
  conversations: GroupedConversations | undefined;
  isLoading: boolean;
  error: unknown;
  currentUserId: string;
  onConversationClick: (conversationId: string) => void;
};

export function ConversationList({
  conversations,
  isLoading,
  error,
  currentUserId,
  onConversationClick,
}: ConversationListProps) {
  const [activeTab, setActiveTab] = useState<"chats" | "groups">("chats");

  const directChats = conversations?.direct ?? [];
  const groupChats = conversations?.groups ?? [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-t-[45px] p-8">
        <p className="text-sm text-red-500">Failed to load conversations</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs variant="chat" activeTab={activeTab} onTabChange={setActiveTab}>
        <TabsContent value="chats">
          {isLoading ? (
            <div className="w-full flex flex-col gap-4">
              {[...Array(5)].map((_, i) => (
                <ChatRowSkeleton key={i} />
              ))}
            </div>
          ) : directChats.length === 0 ? (
            <EmptyState
              title="No direct chats yet"
              description="Start a conversation with someone!"
            />
          ) : (
            <div className="w-full flex flex-col">
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
          {isLoading ? (
            <div className="w-full flex flex-col gap-4">
              {[...Array(5)].map((_, i) => (
                <ChatRowSkeleton key={i} />
              ))}
            </div>
          ) : groupChats.length === 0 ? (
            <EmptyState
              title="No group chats yet"
              description="Create or join a group!"
            />
          ) : (
            <div className="w-full flex flex-col">
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

// Extracted empty state component
function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 w-full">
      <p className="text-grey text-center font-medium">{title}</p>
      <p className="text-sm text-grey text-center mt-2">{description}</p>
    </div>
  );
}
