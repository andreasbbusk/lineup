import { Tabs, TabsContent } from "@/app/components/tabs";
import { useState } from "react";
import { GroupedConversations, Conversation } from "../../types";
import { ChatRow } from "./chat-row";
import { ChatRowSkeleton } from "@/app/components/skeleton";
import { DEFAULT_SKELETON_COUNT } from "../../constants";

// ============================================================================
// Types
// ============================================================================

type ConversationListProps = {
  conversations: GroupedConversations | undefined;
  isLoading: boolean;
  error: unknown;
  currentUserId: string;
  onConversationClick: (conversationId: string) => void;
  searchQuery?: string;
};

// ============================================================================
// Helpers
// ============================================================================

/** Filter conversations by name only */
const filterConversations = (conversations: Conversation[] = [], query: string) => {
  if (!query.trim()) return conversations;

  const searchTerm = query.toLowerCase();
  return conversations.filter((conv) =>
    conv.name?.toLowerCase().includes(searchTerm)
  );
};

/** Render loading skeletons, empty state, or conversation list */
const renderContent = (
  conversations: Conversation[],
  isLoading: boolean,
  emptyMsg: string,
  currentUserId: string,
  onClick: (id: string) => void
) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-4 p-4">
        {Array.from({ length: DEFAULT_SKELETON_COUNT }, (_, i) => (
          <ChatRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!conversations.length) {
    const isDirectChats = emptyMsg.includes("direct");
    return (
      <div className="flex flex-col items-center justify-center py-12 w-full">
        <p className="text-grey text-center font-medium">{emptyMsg}</p>
        <p className="text-sm text-grey text-center mt-2">
          {isDirectChats ? "Start a conversation with someone!" : "Create or join a group!"}
        </p>
      </div>
    );
  }

  // Conversation list
  return conversations.map((conversation) => (
    <ChatRow
      key={conversation.id}
      conversation={conversation}
      currentUserId={currentUserId}
      onClick={() => onClick(conversation.id)}
    />
  ));
};

// ============================================================================
// Component
// ============================================================================

export function ConversationList({
  conversations,
  isLoading,
  error,
  currentUserId,
  onConversationClick,
  searchQuery = "",
}: ConversationListProps) {
  const [activeTab, setActiveTab] = useState<"chats" | "groups">("chats");

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-t-[45px] p-8">
        <p className="text-sm text-red-500">Failed to load conversations</p>
      </div>
    );

  return (
    <Tabs variant="chat" activeTab={activeTab} onTabChange={setActiveTab}>
      <TabsContent value="chats">
        {renderContent(
          filterConversations(conversations?.direct, searchQuery),
          isLoading,
          "No direct chats yet",
          currentUserId,
          onConversationClick
        )}
      </TabsContent>
      <TabsContent value="groups">
        {renderContent(
          filterConversations(conversations?.groups, searchQuery),
          isLoading,
          "No group chats yet",
          currentUserId,
          onConversationClick
        )}
      </TabsContent>
    </Tabs>
  );
}
