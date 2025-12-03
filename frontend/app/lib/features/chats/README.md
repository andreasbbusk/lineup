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
│   ├── useConversations.ts   # Fetch & group conversations
│   ├── useChatMessages.ts    # Infinite scroll message fetching
│   └── realtime/
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
import { ConversationList } from "@/app/lib/features/chats";

function ChatPage() {
  const { user } = useAuth(); // Your auth hook

  return (
    <ConversationList
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
import { ChatWindow } from "@/app/lib/features/chats";

function ChatPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const { data: conversation } = useConversation(params.id);

  return (
    <ChatWindow
      conversationId={params.id}
      currentUserId={user.id}
      conversationName={conversation?.name}
      onBack={() => router.back()}
    />
  );
}
```

### Using Hooks Directly

```tsx
import {
  useConversations,
  useChatMessages,
  useUnreadCount
} from "@/app/lib/features/chats";

function CustomChatComponent() {
  // Fetch grouped conversations
  const { data: conversations, isLoading } = useConversations();

  // Get unread count
  const { data: unreadCount } = useUnreadCount();

  // Fetch messages with infinite scroll
  const {
    data: messages,
    fetchNextPage,
    hasNextPage
  } = useChatMessages("conversation-id");

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <p>Direct Chats: {conversations?.direct.length}</p>
      <p>Groups: {conversations?.groups.length}</p>
    </div>
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

Real-time features are automatically enabled in components. To use them directly:

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

## Type Definitions

### Core Types

```typescript
type Conversation = {
  id: string;
  type: "direct" | "group";
  name?: string;
  avatarUrl?: string;
  participants?: Participant[];
  unreadCount: number;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  // ... more fields
}

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  // ... more fields
}

type UIMessage = Message & {
  isSending?: boolean;
  isError?: boolean;
}
```

## Utilities

### Date Formatting

```tsx
import {
  formatMessageTime,      // "Just now", "5m ago", "2h ago"
  formatConversationTime, // "Now", "5m", "2h"
  formatFullTime,         // "3:45 PM"
  truncateMessage
} from "@/app/lib/features/chats";

const time = formatMessageTime(message.createdAt);
const preview = truncateMessage(message.content, 50);
```

## Best Practices

1. **Always use hooks for data fetching** - Don't call API methods directly in components
2. **Leverage optimistic updates** - Use the `UIMessage` type for pending states
3. **Handle loading/error states** - All hooks return `isLoading` and `error`
4. **Use query invalidation sparingly** - Real-time subscriptions handle most updates
5. **Keep components under 150 lines** - Split complex components as needed

## Customization

### Styling
All components use Tailwind CSS with CSS variables for theming:
- `var(--color-crocus-yellow)` - Primary accent color
- `var(--color-grey)` - Secondary text color
- `var(--color-black)` - Primary text color
- `var(--color-white)` - Background color

### Extending Types
Add UI-specific fields to `types.ts`:

```typescript
export type UIMessage = Message & {
  isSending?: boolean;
  isError?: boolean;
  isPending?: boolean; // Your custom field
}
```

## Troubleshooting

### Messages not updating in real-time
- Check Supabase credentials in `.env.local`
- Verify Realtime is enabled in Supabase project
- Check browser console for subscription errors

### Type errors
- Run `npm run generate-types` to regenerate API types
- Ensure `@/app/lib/types/api.d.ts` is up to date

### Infinite scroll not working
- Check that `getNextPageParam` returns valid cursor
- Verify API returns messages in correct order
- Monitor scroll event handler

## Migration from Old Components

If you have existing chat components (`card-message.tsx`, `message.tsx`, `send-message.tsx`), you can safely delete them and replace with this implementation:

1. Replace imports: `import { ChatWindow } from "@/app/lib/features/chats"`
2. Update props to match new component signatures
3. Remove manual API calls - use hooks instead
4. Update styling to match new design system

## Contributing

When adding new features:
1. Add types to `types.ts` (only if not in API schema)
2. Add API methods to `api.ts`
3. Create hooks in `hooks/`
4. Build components in `components/`
5. Export everything through `index.ts`
