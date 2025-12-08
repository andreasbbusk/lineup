# Chat System - Feature-First Architecture

A complete, production-ready chat system implementation for Next.js with real-time messaging, infinite scroll, and type-safe API integration.

## Architecture Overview

This implementation follows a **feature-first** architecture where all code for the chat system lives in a single directory (`lib/features/chats/`), organized by concern.

### Directory Structure

```
lib/features/chats/
├── api.ts                      # API client methods
├── queryKeys.ts               # React Query key factory
├── types.ts                   # Type aliases from API schema
├── index.ts                   # Main exports
├── utils/
│   ├── realtimeAdapter.ts    # DB → Frontend type mapping
│   └── dateHelpers.ts        # Date formatting utilities
├── hooks/
│   ├── index.ts
│   ├── query/                # Data mutations and queries
│   │   ├── useConversations.ts
│   │   ├── useConversation.ts
│   │   ├── useChatMessages.ts
│   │   ├── useSendMessage.ts
│   │   ├── useDeleteMessage.ts
│   │   └── useMarkAsRead.ts
│   └── realtime/             # Real-time subscriptions
│       ├── useMessageSubscription.ts
│       └── useConversationSubscription.ts
└── components/
    ├── index.ts
    ├── list/
    │   ├── ChatRow.tsx       # Individual conversation row
    │   └── ConversationList.tsx  # Tabbed list (Chats/Groups)
    └── window/
        ├── MessageBubble.tsx # Message display component
        ├── MessageInput.tsx  # Message composition
        └── ChatWindow.tsx    # Complete chat interface
```

## Key Features

### Type Safety
- All types derived from OpenAPI schema (`@/app/lib/types/api`)
- No manual type definitions - types are inferred from backend
- Snake_case API responses mapped to camelCase for frontend

### Real-time Updates
- Supabase Realtime integration for instant message delivery
- Optimistic UI updates for better UX
- Automatic cache invalidation on changes

### Performance
- Infinite scroll pagination for messages
- Query result caching with React Query
- Efficient re-renders with proper memoization

### UI/UX
- Direct messages and group chats with tab navigation
- Unread message badges
- Typing indicators
- Message editing/deletion support
- Avatar display with fallbacks
- Responsive design

## Usage Examples

### Basic Conversation List

```tsx
import { ConversationList, useConversations, useConversationSubscription } from "@/app/lib/features/chats";

function ChatPage() {
  const { user } = useAuth(); // Your auth hook
  const { data: conversations, isLoading, error } = useConversations();
  
  useConversationSubscription(user.id);

  return (
    <ConversationList
      conversations={conversations}
      isLoading={isLoading}
      error={error}
      currentUserId={user.id}
      onConversationClick={(conversationId) => {
        // Navigate to chat window
        router.push(`/chats/${conversationId}`);
      }}
    />
  );
}
```

### Chat Window

```tsx
import { ChatWindow, useConversation, useChatMessages, useSendMessage, useMessageSubscription } from "@/app/lib/features/chats";

function ChatPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const { data: conversation } = useConversation(params.id);
  const { data: messages, fetchNextPage, hasNextPage, isFetchingNextPage } = useChatMessages(params.id);
  const { mutate: sendMessage } = useSendMessage(params.id);

  useMessageSubscription(params.id);

  // Flatten messages...

  return (
    <ChatWindow
      conversationId={params.id}
      currentUserId={user.id}
      conversationName={conversation?.name}
      messages={allMessages}
      isLoading={isLoading}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onSendMessage={sendMessage}
      onTyping={(isTyping) => { ... }}
      onBack={() => router.back()}
    />
  );
}
```

## API Integration

The chat API uses `openapi-fetch` for full type inference:

```tsx
import { chatApi } from "@/app/lib/features/chats";

// All methods are fully typed based on OpenAPI schema
await chatApi.getConversations();
await chatApi.getMessages(conversationId, { limit: 50 });
await chatApi.sendMessage({
  conversation_id: "...",
  content: "Hello!",
  media_ids: [],
  reply_to_message_id: null
});
await chatApi.markAsRead(["message-id-1", "message-id-2"]);
await chatApi.setTyping(conversationId, true);
```

## Real-time Subscriptions

Real-time features are handled by subscriptions in your page components:

```tsx
import {
  useMessageSubscription,
  useConversationSubscription
} from "@/app/lib/features/chats";

function ChatComponent({ conversationId, userId }) {
  // Auto-updates message cache on new messages
  useMessageSubscription(conversationId);

  // Auto-updates conversation list
  useConversationSubscription(userId);

  // Your component logic...
}
```

## Best Practices

1. **Orchestrate data at the page level** - Components should be presentational and accept data/callbacks as props.
2. **Use specific hooks** - Use `useSendMessage`, `useDeleteMessage` etc. instead of manual mutations.
3. **Leverage optimistic updates** - Use the `UIMessage` type for pending states
4. **Handle loading/error states** - All hooks return `isLoading` and `error`
5. **Use query invalidation sparingly** - Real-time subscriptions handle most updates
6. **Keep components under 150 lines** - Split complex components as needed
