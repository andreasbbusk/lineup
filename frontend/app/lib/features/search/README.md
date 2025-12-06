# Search Feature (Infrastructure)

This module provides core search infrastructure that can be used across the application.

**Architecture Note**: Search is an infrastructure feature. This means:
- **API clients** live here (infrastructure)
- **UI components** and **feature-specific hooks** live in the features that use them (e.g., chats)
- Features import from this module's public API via `@/app/lib/features/search`

## Current Implementation Status

### ✅ Implemented

#### People Tab (User Search)
- **API**: `searchApi.searchUsers()` (in this module)
- **Hook**: `useUserSearch()` (in `@/app/lib/features/chats`)
- **Components**: `UserSearchList`, `UserSuggestionRow` (in `@/app/lib/features/chats/components`)
- **Purpose**: Search for users by username, name, or bio
- **Usage**: Currently used in the "New Message" flow to find users to chat with

## Future Implementation

The backend `/search` endpoint supports multiple search tabs that are not yet implemented on the frontend:

### 🚧 TODO: For You Tab
Search for personalized recommendations based on user's interests and connections.

**Suggested Implementation:**
```typescript
// api.ts
searchForYou: async (query: string = "", limit: number = 50) => {
  const { data, error, response } = await apiClient.GET("/search", {
    params: {
      query: { q: query, tab: "for-you", limit, offset: 0 },
    },
  });
  if (error) return handleApiError(error, response);
  return data;
}

// hooks/query/useSearchForYou.ts
export function useSearchForYou(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["search", "for-you", query],
    queryFn: () => searchApi.searchForYou(query),
    enabled,
    staleTime: 60_000, // 1 minute
  });
}
```

**Components Needed:**
- `ForYouResultsList` - Display list of personalized results
- `ForYouResultRow` - Individual result item

### 🚧 TODO: Collaborations Tab
Search for collaboration opportunities (bands, projects, sessions).

**Suggested Implementation:**
```typescript
// api.ts
searchCollaborations: async (query: string = "", limit: number = 50) => {
  const { data, error, response } = await apiClient.GET("/search", {
    params: {
      query: { q: query, tab: "collaborations", limit, offset: 0 },
    },
  });
  if (error) return handleApiError(error, response);
  return data;
}

// hooks/query/useSearchCollaborations.ts
export function useSearchCollaborations(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["search", "collaborations", query],
    queryFn: () => searchApi.searchCollaborations(query),
    enabled,
    staleTime: 60_000,
  });
}
```

**Components Needed:**
- `CollaborationSearchList` - Display collaboration opportunities
- `CollaborationCard` - Individual collaboration item with details

### 🚧 TODO: Services Tab
Search for music-related services (studios, producers, lessons, etc.).

**Suggested Implementation:**
```typescript
// api.ts
searchServices: async (query: string = "", limit: number = 50) => {
  const { data, error, response } = await apiClient.GET("/search", {
    params: {
      query: { q: query, tab: "services", limit, offset: 0 },
    },
  });
  if (error) return handleApiError(error, response);
  return data;
}

// hooks/query/useSearchServices.ts
export function useSearchServices(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["search", "services", query],
    queryFn: () => searchApi.searchServices(query),
    enabled,
    staleTime: 60_000,
  });
}
```

**Components Needed:**
- `ServiceSearchList` - Display available services
- `ServiceCard` - Individual service item with provider info

### 🚧 TODO: Tags Tab
Search for content by tags/hashtags.

**Suggested Implementation:**
```typescript
// api.ts
searchTags: async (query: string = "", limit: number = 50) => {
  const { data, error, response } = await apiClient.GET("/search", {
    params: {
      query: { q: query, tab: "tags", limit, offset: 0 },
    },
  });
  if (error) return handleApiError(error, response);
  return data;
}

// hooks/query/useSearchTags.ts
export function useSearchTags(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["search", "tags", query],
    queryFn: () => searchApi.searchTags(query),
    enabled,
    staleTime: 60_000,
  });
}
```

**Components Needed:**
- `TagSearchList` - Display tags and their content
- `TagResultRow` - Individual tag with post count

## Architecture Considerations

### Generic Search Hook Pattern
As we add more search tabs, consider creating a generic `useSearch` hook:

```typescript
export function useSearch(
  tab: "people" | "for-you" | "collaborations" | "services" | "tags",
  query: string,
  options?: { enabled?: boolean; limit?: number }
) {
  const { enabled = true, limit = 50 } = options || {};

  return useQuery({
    queryKey: ["search", tab, query],
    queryFn: () => {
      switch (tab) {
        case "people": return searchApi.searchUsers(query, limit);
        case "for-you": return searchApi.searchForYou(query, limit);
        case "collaborations": return searchApi.searchCollaborations(query, limit);
        case "services": return searchApi.searchServices(query, limit);
        case "tags": return searchApi.searchTags(query, limit);
      }
    },
    enabled,
    staleTime: 60_000,
  });
}
```

### Unified Search Page
Create a dedicated search page (`/search`) with:
- Tab navigation for switching between search types
- Shared search input
- Dynamic result rendering based on active tab
- Recent searches functionality
- Search suggestions/autocomplete

### Type Safety
Ensure all search result types are properly typed in `@/app/lib/types/api.d.ts`:
- `UserSearchResult` (exists)
- `ForYouSearchResult` (TODO)
- `CollaborationSearchResult` (TODO)
- `ServiceSearchResult` (TODO)
- `TagSearchResult` (TODO)

## File Structure

```
/app/lib/features/search/ (INFRASTRUCTURE - no dependencies on features)
├── README.md (this file)
├── index.ts (public API)
├── api.ts (search API client)
└── hooks/
    ├── index.ts
    └── useUserSearch.ts (generic user search hook)

/app/lib/features/chats/ (example feature using search)
├── index.ts (re-exports useUserSearch from search for convenience)
├── hooks/
│   └── query/
│       └── useConnections.ts (chat-specific, uses searchApi)
└── components/
    └── new-chat/
        ├── user-search-list.tsx (UI component)
        └── user-suggestion-row.tsx (UI component)
```

## Dependency Flow (No Circular Dependencies)

```
┌─────────────────────────────────┐
│  search (infrastructure)        │
│  - searchApi                    │
│  - useUserSearch                │
│  (imports: NOTHING from features)│
└─────────────────────────────────┘
           ↑
           │ imports
           │
┌─────────────────────────────────┐
│  chats (feature)                │
│  - useConnections (uses search) │
│  - UI components                │
│  (imports: search)              │
└─────────────────────────────────┘
           ↑
           │ imports
           │
┌─────────────────────────────────┐
│  pages (UI)                     │
│  - /chats/new                   │
│  (imports: chats, search)       │
└─────────────────────────────────┘
```

## Architecture Rules

### ✅ Belongs in Search (Infrastructure)
- Generic API clients (`searchApi.searchUsers()`)
- Generic hooks (`useUserSearch`, `useSearchForYou`)
- Types related to search API contracts
- **NO dependencies on other features**

### ❌ Does NOT Belong in Search
- UI components (they're feature-specific)
- Feature-specific logic (e.g., `useConnections` filters for chat connections)
- Business logic that combines search with other features

### Future Search Features

When implementing new search tabs, follow this pattern:
1. Add API method to `/app/lib/features/search/api.ts`
2. Add generic hook to `/app/lib/features/search/hooks/`
3. Export from `/app/lib/features/search/index.ts`
4. Features import via `@/app/lib/features/search` (never the other way around)
5. Features create their own UI components and feature-specific logic

## Usage Example

### Current (People Search)
```typescript
import { useUserSearch, UserSearchList } from "@/app/lib/features/search";

function MyComponent() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useUserSearch(query, query.length > 0);

  const users = data?.results?.filter(r => r.type === "user") || [];

  return (
    <UserSearchList
      users={users}
      isLoading={isLoading}
      onUserClick={(userId) => console.log(userId)}
    />
  );
}
```

### Future (Unified Search Page)
```typescript
import { useSearch } from "@/app/lib/features/search";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("people");

  const { data, isLoading } = useSearch(activeTab, query, {
    enabled: query.length > 0,
  });

  return (
    <div>
      <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <SearchInput value={query} onChange={setQuery} />
      <SearchResults tab={activeTab} data={data} isLoading={isLoading} />
    </div>
  );
}
```

## Migration Notes

This feature was created by extracting search functionality from:
- `/app/lib/api/search-api.ts` → `/app/lib/features/search/api.ts`
- `/app/lib/features/chats/hooks/query/useUserSearch.ts` → `/app/lib/features/search/hooks/query/useUserSearch.ts`
- `/app/lib/features/chats/components/new-chat/user-search-list.tsx` → `/app/lib/features/search/components/user-search-list.tsx`
- `/app/lib/features/chats/components/new-chat/user-suggestion-row.tsx` → `/app/lib/features/search/components/user-suggestion-row.tsx`

The original files in the chats feature should be removed after verifying all imports are updated.
