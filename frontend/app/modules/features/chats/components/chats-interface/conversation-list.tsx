import { Tabs, TabsContent } from "@/app/modules/components/tabs";
import { GroupedConversations, Conversation } from "../../types";
import { ChatRow } from "./chat-row";
import { ChatRowSkeleton } from "@/app/modules/components/skeleton";
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
  activeTab: "chats" | "groups";
  onTabChange: (tab: "chats" | "groups") => void;
};

// ============================================================================
// Helpers
// ============================================================================

/** Filter conversations by name and participant information */
const filterConversations = (
  conversations: Conversation[] = [],
  query: string,
  currentUserId: string
) => {
  if (!query.trim()) return conversations;

  const searchTerm = query.toLowerCase();

  return conversations.filter((conv) => {
    // For group chats, search in conversation name
    if (conv.type === "group") {
      return conv.name?.toLowerCase().includes(searchTerm);
    }

    // For direct chats, search in other participant's info
    const otherUser = conv.participants?.find(
      (p) => p.userId !== currentUserId
    )?.user;

    if (!otherUser) return false;

    const firstName = otherUser.firstName?.toLowerCase() || "";
    const lastName = otherUser.lastName?.toLowerCase() || "";
    const username = otherUser.username.toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();

    return (
      firstName.includes(searchTerm) ||
      lastName.includes(searchTerm) ||
      username.includes(searchTerm) ||
      fullName.includes(searchTerm)
    );
  });
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
          {isDirectChats
            ? "Start a conversation with someone!"
            : "Create or join a group!"}
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
  activeTab,
  onTabChange,
}: ConversationListProps) {
  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-t-[45px] p-8">
        <p className="text-sm text-red-500">Failed to load conversations</p>
      </div>
    );

  return (
    <div className="h-full [&>div]:flex [&>div]:flex-col [&>div]:h-full [&>div>ul]:shrink-0 [&>div>ul]:bg-white [&>div>ul]:will-change-auto [&>div>div]:flex-1 [&>div>div]:min-h-0 [&>div>div]:relative">
      <Tabs variant="chat" activeTab={activeTab} onTabChange={onTabChange}>
        <TabsContent
          value="chats"
          className="block! h-full! w-full! overflow-y-auto! overflow-x-hidden! bg-white! px-0! pt-0! gap-0! pb-16! no-scrollbar"
        >
          {renderContent(
            filterConversations(
              conversations?.direct,
              searchQuery,
              currentUserId
            ),
            isLoading,
            "No direct chats yet",
            currentUserId,
            onConversationClick
          )}
        </TabsContent>
        <TabsContent
          value="groups"
          className="block! h-full! w-full! overflow-y-auto! overflow-x-hidden! bg-white! px-0! pt-0! gap-0! pb-16! no-scrollbar"
        >
          {renderContent(
            filterConversations(
              conversations?.groups,
              searchQuery,
              currentUserId
            ),
            isLoading,
            "No group chats yet",
            currentUserId,
            onConversationClick
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
