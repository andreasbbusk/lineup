import { Tabs, TabsContent } from "@/app/modules/components/tabs";
import { GroupedConversations, Conversation } from "../../types";
import { ChatRow } from "./chat-row";
import { ChatRowSkeleton } from "@/app/modules/components/skeleton";
import { DEFAULT_SKELETON_COUNT } from "../../constants";
import {
  SwipeableList,
  SwipeableListItem,
  LeadingActions,
  TrailingActions,
  SwipeAction,
  Type,
} from "react-swipeable-list";
import { Trash2, LogOut, Info } from "lucide-react";
import "react-swipeable-list/dist/styles.css";
// ============================================================================
// Types
// ============================================================================

type ConversationListProps = {
  conversations: GroupedConversations | undefined;
  isLoading: boolean;
  error: unknown;
  currentUserId: string;
  onConversationClick: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onNavigateToSettings: (conversationId: string) => void;
  searchQuery?: string;
  activeTab: "chats" | "groups";
  onTabChange: (tab: "chats" | "groups") => void;
};

// ============================================================================
// Helpers
// ============================================================================

/** Create leading swipe actions for group info */
const createLeadingActions = (
  conversation: Conversation,
  onNavigateToSettings: (id: string) => void
) => {
  // Only show info button for groups
  if (conversation.type !== "group") return undefined;

  return (
    <LeadingActions>
      <SwipeAction onClick={() => onNavigateToSettings(conversation.id)}>
        <div className="flex flex-col items-center justify-center h-full px-6 bg-dark-cyan-blue">
          <Info size={20} className="text-white" />
          <span className="text-xs font-medium text-white mt-1">Info</span>
        </div>
      </SwipeAction>
    </LeadingActions>
  );
};

/** Create trailing swipe actions based on conversation type and user role */
const createTrailingActions = (
  conversation: Conversation,
  currentUserId: string,
  onDelete: (id: string) => void
) => {
  const isDirect = conversation.type === "direct";
  const isCreator = conversation.creator?.id === currentUserId;

  return (
    <TrailingActions>
      <SwipeAction destructive={true} onClick={() => onDelete(conversation.id)}>
        <div className="flex flex-col items-center justify-center h-full px-6">
          {isDirect || isCreator ? (
            <Trash2 size={20} className="text-white" />
          ) : (
            <LogOut size={20} className="text-white" />
          )}
          <span className="text-xs font-medium text-white mt-1">
            {isDirect ? "Delete" : isCreator ? "Delete" : "Leave"}
          </span>
        </div>
      </SwipeAction>
    </TrailingActions>
  );
};

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
  onClick: (id: string) => void,
  onDelete: (id: string) => void,
  onNavigateToSettings: (id: string) => void
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
  return (
    <SwipeableList type={Type.IOS} threshold={0.3} className="w-full">
      {conversations.map((conversation) => (
        <SwipeableListItem
          key={conversation.id}
          leadingActions={createLeadingActions(
            conversation,
            onNavigateToSettings
          )}
          trailingActions={createTrailingActions(
            conversation,
            currentUserId,
            onDelete
          )}
          className="bg-white"
        >
          <div className="bg-white w-full">
            <ChatRow
              conversation={conversation}
              currentUserId={currentUserId}
              onClick={() => onClick(conversation.id)}
            />
          </div>
        </SwipeableListItem>
      ))}
    </SwipeableList>
  );
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
  onDeleteConversation,
  onNavigateToSettings,
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
    <div className="flex flex-col h-full overflow-hidden bg-dark-cyan-blue rounded-t-[45px]">
      <Tabs
        variant="chat"
        activeTab={activeTab}
        onTabChange={onTabChange}
        className="mx-auto w-full max-w-200 flex flex-col h-full [&>ul]:shrink-0 [&>div:last-child]:flex-1 [&>div:last-child]:overflow-hidden [&>div:last-child]:min-h-0 [&>div:last-child]:flex [&>div:last-child]:flex-col"
      >
        <TabsContent value="chats" className="min-h-0! overflow-y-auto pb-24!">
          {renderContent(
            filterConversations(
              conversations?.direct,
              searchQuery,
              currentUserId
            ),
            isLoading,
            "No direct chats yet",
            currentUserId,
            onConversationClick,
            onDeleteConversation,
            onNavigateToSettings
          )}
        </TabsContent>
        <TabsContent value="groups" className="min-h-0! overflow-y-auto pb-24!">
          {renderContent(
            filterConversations(
              conversations?.groups,
              searchQuery,
              currentUserId
            ),
            isLoading,
            "No group chats yet",
            currentUserId,
            onConversationClick,
            onDeleteConversation,
            onNavigateToSettings
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
