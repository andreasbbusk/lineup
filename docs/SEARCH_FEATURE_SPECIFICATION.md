# Search Feature Specification

## Overview

Search is **infrastructure**, not just a feature. It provides a unified way to discover users, collaboration requests, services, and tags across the platform using a single query that applies across multiple tabs.

### Core Principle: Universal Query, Tab-Specific Filtering

One search string applies across all tabs. Tabs are different **lenses** on the same query.

**Example:** User searches "guitarist"
- **For You:** Mixed results (top people, collabs, tags, services)
- **People:** Only profiles matching "guitarist"
- **Collaborations:** Only requests (posts type='request') matching "guitarist"
- **Services:** Only services matching "guitarist"
- **Tags:** Only tags matching "guitarist"

---

## Architecture Overview

### Data Model

#### Searchable Entities

1. **Profiles** (`profiles.search_vector`)
   - Indexed: username, first_name, last_name, bio, about_me, location
   - Returns user cards with: avatar, name, bio, connect button

2. **Collaboration Requests** (`posts.search_vector` WHERE type='request')
   - Indexed: title, description
   - Returns existing post cards
   - Includes: author info, location, paid opportunity badge, genres

3. **Services** (`services.search_vector`)
   - Indexed: title, description
   - Generic reference data (no specific provider considerations)
   - Returns: title, description, service type badge
   - Future: Can link to user providers via provider_id

4. **Tags/Metadata** (`metadata.search_vector` WHERE type='tag'`)
   - Indexed: name
   - Pulled from `post_metadata` (used in at least one post)
   - Returns: tag name with usage count
   - Click behavior: Filter feed by tag

5. **Recent Searches** (`recent_searches` table)
   - Stores: query, tab context, optional entity reference
   - Deduplicates identical query+tab combinations
   - Shown in empty state (no active query)

### Database Tables

All searchable entities already have:
- `search_vector` tsvector column
- GIN index on search_vector
- Trigger to auto-update search_vector on insert/update

`recent_searches` table structure:
```sql
id uuid PRIMARY KEY
user_id uuid (FK profiles)
search_query text
search_tab text (enum: 'for_you', 'people', 'collaborations', 'services', 'tags')
entity_type text (optional)
entity_id uuid (optional)
created_at timestamp
```

---

## UI/UX Specification

### Search Page Layout

```
┌─────────────────────────────────────────┐
│  🔍 Search query input (autofocus)     │
├─────────────────────────────────────────┤
│  [For You] [People] [Collabs] [Services] [Tags]
├─────────────────────────────────────────┤
│                                         │
│  Recent Searches (when empty):          │
│  • guitarist · People · 2h ago         │
│  • jazz fusion · Tags · Yesterday       │
│                                         │
│  OR                                     │
│                                         │
│  Search Results (when query exists):    │
│  [Card 1] [Card 2] [Card 3]...         │
│                                         │
└─────────────────────────────────────────┘
```

### Tab Specifications

#### For You Tab
**Empty state (no query):**
- Show personalized recommendations
- Algorithm: user's genres → people in those genres → active collabs → trending tags → popular services

**With query:**
- Aggregate best matches from all other tabs
- Top 3 people, top 3 collabs, top 2 services, top 2 tags
- Sort globally by relevance score
- Show category badge on each card (Person, Collaboration, Service, Tag)

#### People Tab
**Results display:**
- Avatar
- Full name
- Bio (single line, truncated)
- "Connect" button if not connected, or "Connected" indicator if already connected

**No additional info needed** (no genres, location, etc.)

#### Collaborations Tab
**Results display:**
- Reuse existing post/request card component
- Just filter post IDs from search and pass to existing component
- Already includes: title, description, author, location, paid badge, genres

#### Services Tab
**Results display:**
- Title
- Description snippet
- Service type badge
- Generic reference data (no provider-specific logic yet)

#### Tags Tab
**Results display:**
- Tag name prefixed with # (in UI only, not stored)
- Usage count (how many posts use this tag)
- Click behavior: Navigate to tag feed showing all posts with that tag

### Recent Searches Behavior

**When shown:**
- Active when search input is empty/focused
- Displays last 15 searches chronologically (most recent first)

**Interaction:**
- Click entry → Restores that query in that tab (URL: `/search?q={query}&tab={tab}`)
- X button → Delete individual search
- "Clear all" button → Bulk delete all

**Deduplication:**
- If user searches "guitarist" in People tab twice, delete old entry, create new
- Keeps most recent at top naturally

**Storage:**
- One entry per unique query+tab combination
- Include optional entity_id if user clicked through to specific result (future enhancement)

---

## Implementation Phases

Each phase represents a feature branch that should compile and function independently.

### Phase 1: Backend Search Service

**Branch:** `feature/search-service-base`

**Goal:** Implement all search service methods without API endpoints

**What gets built:**
- SearchService methods for each tab (people, collaborations, services, tags, forYou)
- Call existing RPC functions where available (search_people, search_collaborations, search_tags)
- Add new RPC function for searchServices
- Add ForYou recommendation logic (query aggregation when search exists, personalized recommendations when empty)

**Deliverable:**
- SearchService class fully implemented
- All methods tested and returning correct response types
- No endpoints exposed yet

**Files:**
- `backend/src/entities/search/search.service.ts` (update existing)
- `backend/src/entities/search/search.mapper.ts` (update for services)

---

### Phase 2: Recent Searches Service

**Branch:** `feature/recent-searches-backend`

**Goal:** Implement recent searches CRUD operations

**What gets built:**
- RecentSearchesService with methods:
  - `getRecentSearches(userId)` → Array of recent searches
  - `saveSearch(userId, query, tab, entityType?, entityId?)` → void (with deduplication)
  - `deleteRecentSearch(userId, searchId)` → void
  - `clearAllRecentSearches(userId)` → void

**Database requirement:**
- Add index: `CREATE INDEX idx_recent_searches_user_created ON recent_searches(user_id, created_at DESC)`

**Deliverable:**
- RecentSearchesService class fully implemented
- Handles deduplication logic
- Methods tested

**Files:**
- `backend/src/entities/search/recent-searches.service.ts`

---

### Phase 3: Search Controller & API

**Branch:** `feature/search-api-endpoints`

**Goal:** Expose search and recent searches as API endpoints

**What gets built:**
- Update SearchController with endpoints:
  - `GET /search?q={query}&tab={tab}&limit=20&offset=0` → SearchResponse
  - `GET /search/recent` → Array<RecentSearch>
  - `POST /search/recent` → {query, tab, entityType?, entityId?}
  - `DELETE /search/recent/:id` → void
  - `DELETE /search/recent/clear` → void

**TSOA decorators:** Add proper @Get, @Post, @Delete, @Security decorators

**Deliverable:**
- All endpoints functional
- Proper error handling
- Endpoints tested

**Files:**
- `backend/src/entities/search/search.controller.ts` (update existing)

---

### Phase 4: Frontend Search Page Shell

**Branch:** `feature/search-page-component`

**Goal:** Build SearchPage container with routing and state management

**What gets built:**
- SearchPage component with:
  - SearchBar input (with debounce 300ms)
  - SearchTabs navigation (5 tabs)
  - State: query, activeTab, results, loading
  - URL sync: `/search?q={query}&tab={tab}`
  - Fetch search results on query/tab change

**No result rendering yet** - just show raw results in debug view

**Deliverable:**
- SearchPage navigable from app
- Query and tab synced to URL
- API calls working with loading states
- Ready for result renderers

**Files:**
- `frontend/src/pages/SearchPage.tsx`
- `frontend/src/components/search/SearchBar.tsx`
- `frontend/src/components/search/SearchTabs.tsx`
- Update routing to include `/search`

---

### Phase 5: Recent Searches Frontend

**Branch:** `feature/search-recent-searches`

**Goal:** Display and manage recent searches

**What gets built:**
- RecentSearches component:
  - Shows when query is empty
  - List of recent searches with query text and tab context
  - Click to restore search
  - Individual delete (X button)
  - "Clear all" button
- Fetch recent searches on component mount
- Save recent search when user performs search

**Deliverable:**
- RecentSearches component fully functional
- Integrated into SearchPage
- Save/clear operations working

**Files:**
- `frontend/src/components/search/RecentSearches.tsx`
- Update SearchPage to fetch and handle recent searches

---

### Phase 6: Result Renderers - People & Collaborations

**Branch:** `feature/search-results-people-collabs`

**Goal:** Display search results for People and Collaborations tabs

**What gets built:**
- PeopleResults renderer:
  - User card: avatar, name, bio, connect button
  - Reuse existing user card component or create minimal version
- CollaborationsResults renderer:
  - Pass post IDs to existing post card component
  - Let existing component handle rendering

**Deliverable:**
- People and Collaborations tabs showing correct results
- Connect button functional
- Cards styled and responsive

**Files:**
- `frontend/src/components/search/PeopleResults.tsx`
- `frontend/src/components/search/CollaborationsResults.tsx`
- Update SearchPage to render based on activeTab

---

### Phase 7: Result Renderers - Services & Tags

**Branch:** `feature/search-results-services-tags`

**Goal:** Display search results for Services and Tags tabs

**What gets built:**
- ServicesResults renderer:
  - Service card: title, description snippet, type badge
  - Generic display (no provider logic)
- TagsResults renderer:
  - Tag list item: # + name, usage count
  - Click → Navigate to tag feed page

**Deliverable:**
- Services and Tags tabs showing correct results
- Tag navigation working

**Files:**
- `frontend/src/components/search/ServicesResults.tsx`
- `frontend/src/components/search/TagsResults.tsx`
- Update SearchPage to render based on activeTab

---

### Phase 8: For You Tab & Polish

**Branch:** `feature/search-for-you-tab`

**Goal:** Implement For You tab with aggregation and recommendations

**What gets built:**
- ForYouResults renderer:
  - Show mixed result types (person, collaboration, service, tag)
  - Category badge on each card
  - Sort by relevance
- Empty state recommendations:
  - Call backend getRecommendations endpoint
  - Display personalized content

**Deliverable:**
- For You tab fully functional
- Aggregation working correctly
- Empty state showing recommendations

**Files:**
- `frontend/src/components/search/ForYouResults.tsx`
- Update SearchPage to handle For You logic

---

## Code Standards

### Naming & Structure

- **Over brevity:** Use full words. Prefer `searchQuery` over `q`, `activeTab` over `tab`
- **Clarity first:** Function names describe what they do: `saveRecentSearch()`, not `save()`
- **Signal over silence:** Comments only for non-obvious "why", not "what" the code does
- **Minimal code:** Each file does one thing well. No god classes.

### Example Code Style

```typescript
// ✓ GOOD: Clear names, obvious flow
async function saveRecentSearch(
  userId: string,
  searchQuery: string,
  selectedTab: string,
  token: string
): Promise<void> {
  // Deduplicate: delete existing identical search to move it to top
  await deleteExistingSearch(userId, searchQuery, selectedTab);
  
  const { error } = await client
    .from("recent_searches")
    .insert({
      user_id: userId,
      search_query: searchQuery,
      search_tab: selectedTab,
    });

  if (error) throw createHttpError({
    message: `Failed to save search: ${error.message}`,
    statusCode: 500,
    code: "DATABASE_ERROR",
  });
}

// ✓ GOOD: Minimal, focused component
export function SearchBar({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus
    />
  );
}

// ✗ BAD: Abbreviated, unclear
async function srvSrch(q, t, c) {
  const d = await c.from("s").select("*").match({ q });
  return d;
}

// ✗ BAD: Over-explained
// This function takes a userId string parameter
// and returns an array of recent searches
// It queries the recent_searches table
async function getRecentSearches(userId) {
  // ...
}
```

### File Organization

```
backend/src/entities/search/
├── search.controller.ts          // All endpoints
├── search.service.ts             // Search logic
├── search.mapper.ts              // Response mapping
├── recent-searches.service.ts    // Recent searches CRUD
└── search.dto.ts                 // Request DTOs

frontend/src/components/search/
├── SearchPage.tsx                // Container component
├── SearchBar.tsx                 // Input with debounce
├── SearchTabs.tsx                // Tab navigation
├── RecentSearches.tsx            // Recent searches display
├── ForYouResults.tsx             // For You renderer
├── PeopleResults.tsx             // People renderer
├── CollaborationsResults.tsx     // Collaborations renderer
├── ServicesResults.tsx           // Services renderer
└── TagsResults.tsx               // Tags renderer
```

---

## API Specification

### Endpoints

#### Search
```
GET /api/search?q={query}&tab={tab}&limit=20&offset=0

Response: SearchResponse {
  results: Array<ForYouResult | UserResult | CollaborationResult | ServiceResult | TagResult>
}
```

#### Recent Searches
```
GET /api/search/recent
Response: Array<RecentSearch>

POST /api/search/recent
Body: { query: string, tab: string, entityType?: string, entityId?: string }
Response: 204 No Content

DELETE /api/search/recent/:id
Response: 204 No Content

DELETE /api/search/recent/clear
Response: 204 No Content
```

---

## Testing Checklist

### Backend
- [ ] searchPeople returns correct user cards
- [ ] searchCollaborations returns correct post IDs
- [ ] searchServices returns generic service results
- [ ] searchTags returns tags with usage counts
- [ ] searchForYou with query returns mixed results sorted by relevance
- [ ] searchForYou without query returns recommendations
- [ ] Recent searches deduplication works
- [ ] Recent searches ordered by created_at DESC

### Frontend
- [ ] Search page navigable and renders all tabs
- [ ] Debouncing works (300ms delay)
- [ ] Query synced to URL params
- [ ] Recent searches shown when empty
- [ ] Recent searches delete works
- [ ] Clear all recent searches works
- [ ] Each tab renders correct card types
- [ ] Connect button functional on people cards
- [ ] Tag click navigates to tag feed
- [ ] Loading states show during requests

---

## Future Enhancements

- Search suggestions/autocomplete
- Trending searches across all users
- User-offered services (link provider_id)
- Search analytics (what users search for)
- Advanced filters (if needed)
- Search history expiration (30 days)

---

## Related Files

- `docs/DATABASE_SCHEMA.md` - Full schema reference
- `backend/src/entities/search/` - Search implementation
- `frontend/src/pages/SearchPage.tsx` - Search UI entry point
