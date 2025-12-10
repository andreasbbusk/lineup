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
┌─────────────────────────────────────────────────┐
│  🔍 Search query input (autofocus)             │
├─────────────────────────────────────────────────┤
│  [For You] [People] [Collabs] [Services] [Tags]
├─────────────────────────────────────────────────┤
│                                                 │
│  Recent Searches (when empty):                  │
│  • guitarist · People · 2h ago                 │
│  • jazz fusion · Tags · Yesterday               │
│                                                 │
│  OR                                             │
│                                                 │
│  Search Results (when query exists):            │
│  [Card 1] [Card 2] [Card 3]...                 │
│                                                 │
└─────────────────────────────────────────────────┘
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

### INFRASTRUCTURE PHASES

These phases build reusable infrastructure that will be used across the platform.

---

#### Phase 1: Search Service - All Tabs

**Classification:** INFRASTRUCTURE - Core search logic reused across platform

**Goal:** Implement all search service methods used by any search context

**What gets built:**
- SearchService methods for each entity type:
  - `searchPeople(query, filters?, limit, offset)` - Reusable people search
  - `searchCollaborations(query, filters?, limit, offset)` - Reusable collaboration search
  - `searchServices(query, filters?, limit, offset)` - Reusable services search
  - `searchTags(query, filters?, limit, offset)` - Reusable tags search
  - `searchForYou(query, userId, limit, offset)` - Aggregates all above
  - `getRecommendations(userId)` - Personalized recommendations
- Call existing RPC functions where available (search_people, search_collaborations, search_tags)
- Add new RPC function for searchServices
- Response mappers for each entity type

**Why infrastructure:**
- These methods will be called from:
  - Search page (For You tab, individual tabs)
  - Feed filters
  - Discovery pages
  - Recommendation systems
  - Any future discovery feature
- Core business logic, not UI-specific

**Deliverable:**
- SearchService class with all methods
- Methods tested and returning correct response types
- No endpoints exposed yet

**Files:**
- `backend/src/entities/search/search.service.ts` (update existing)
- `backend/src/entities/search/search.mapper.ts` (update for services)

---

#### Phase 2: Recent Searches Service

**Classification:** INFRASTRUCTURE - Reusable history/persistence layer

**Goal:** Implement recent searches CRUD operations as persistent service

**What gets built:**
- RecentSearchesService with methods:
  - `getRecentSearches(userId)` → Array of recent searches
  - `saveSearch(userId, query, tab, entityType?, entityId?)` → void (with deduplication)
  - `deleteRecentSearch(userId, searchId)` → void
  - `clearAllRecentSearches(userId)` → void

**Database requirement:**
- Add index: `CREATE INDEX idx_recent_searches_user_created ON recent_searches(user_id, created_at DESC)`

**Why infrastructure:**
- Recent search persistence could be used in:
  - Search page
  - Mobile app
  - Search widget in header
  - User settings page (view/manage search history)
  - Analytics (track user search patterns)
- Generic CRUD service, not tied to any UI

**Deliverable:**
- RecentSearchesService class with all methods
- Handles deduplication logic
- Methods tested

**Files:**
- `backend/src/entities/search/recent-searches.service.ts`

---

#### Phase 3: Search Controller & API

**Classification:** INFRASTRUCTURE - API contract for search functionality

**Goal:** Expose search and recent searches as reusable API endpoints

**What gets built:**
- SearchController endpoints:
  - `GET /search?q={query}&tab={tab}&limit=20&offset=0` → SearchResponse
  - `GET /search/recent` → Array<RecentSearch>
  - `POST /search/recent` → {query, tab, entityType?, entityId?}
  - `DELETE /search/recent/:id` → void
  - `DELETE /search/recent/clear` → void

**TSOA decorators:** Add proper @Get, @Post, @Delete, @Security decorators

**Why infrastructure:**
- These endpoints are the contract for all search functionality
- Any client (web, mobile, third-party) uses these endpoints
- Can be called from multiple UI contexts
- Version independently from UI changes

**Deliverable:**
- All endpoints functional
- Proper error handling
- Endpoints tested

**Files:**
- `backend/src/entities/search/search.controller.ts` (update existing)

---

### FEATURE PHASES

These phases build the search page feature specifically, using the infrastructure above.

---

#### Phase 4: Search Page - Core Layout

**Classification:** FEATURE - Search page specific UI

**Goal:** Build SearchPage container with routing, state management, and tab structure

**What gets built:**
- SearchPage component with:
  - SearchBar input (with 300ms debounce)
  - SearchTabs navigation (5 tabs)
  - State management: query, activeTab, results, loading
  - URL sync: `/search?q={query}&tab={tab}`
  - Fetch search results on query/tab change
  - Integration with RecentSearchesService for fetch/save/delete

**No result rendering yet** - just show placeholder loading state

**Deliverable:**
- SearchPage navigable from app
- Query and tab synced to URL
- API calls working with loading states
- Recent searches fetched
- Ready for result renderers

**Files:**
- `frontend/src/pages/search-page.tsx`
- `frontend/src/components/search/search-bar.tsx`
- `frontend/src/components/search/search-tabs.tsx`
- Update routing to include `/search`

---

#### Phase 5: Recent Searches - Display & Management

**Classification:** FEATURE - Search page specific display component

**Goal:** Display and manage recent searches on search page

**What gets built:**
- RecentSearches component:
  - Shows when query is empty
  - List of recent searches with query text and tab context
  - Click to restore search (updates SearchPage state)
  - Individual delete (X button)
  - "Clear all" button
- Integration into SearchPage
- Save recent search when user performs search

**Deliverable:**
- RecentSearches component fully functional
- Integrated into SearchPage
- Save/clear operations working via infrastructure service

**Files:**
- `frontend/src/components/search/recent-searches.tsx`
- Update `frontend/src/pages/search-page.tsx`

---

#### Phase 6: Search Results - People & Collaborations

**Classification:** FEATURE - Search page specific result renderers

**Goal:** Display search results for People and Collaborations tabs

**What gets built:**
- PeopleResults component:
  - User card: avatar, name, bio, connect button
  - Reuse or create minimal user card component
- CollaborationsResults component:
  - Pass post IDs to existing post card component
  - Let existing component handle rendering
- Integration into SearchPage (render based on activeTab)

**Deliverable:**
- People and Collaborations tabs showing correct results
- Connect button functional
- Cards styled and responsive

**Files:**
- `frontend/src/components/search/people-results.tsx`
- `frontend/src/components/search/collaborations-results.tsx`
- Update `frontend/src/pages/search-page.tsx`

---

#### Phase 7: Search Results - Services & Tags

**Classification:** FEATURE - Search page specific result renderers

**Goal:** Display search results for Services and Tags tabs

**What gets built:**
- ServicesResults component:
  - Service card: title, description snippet, type badge
  - Generic display (no provider logic)
- TagsResults component:
  - Tag list item: # + name, usage count
  - Click → Navigate to tag feed page
- Integration into SearchPage (render based on activeTab)

**Deliverable:**
- Services and Tags tabs showing correct results
- Tag navigation working

**Files:**
- `frontend/src/components/search/services-results.tsx`
- `frontend/src/components/search/tags-results.tsx`
- Update `frontend/src/pages/search-page.tsx`

---

#### Phase 8: Search Results - For You Tab

**Classification:** FEATURE - Search page specific aggregation display

**Goal:** Implement For You tab with aggregation and recommendations

**What gets built:**
- ForYouResults component:
  - Show mixed result types (person, collaboration, service, tag)
  - Category badge on each card
  - Sort by relevance
- Empty state recommendations:
  - Call backend getRecommendations
  - Display personalized content
- Integration into SearchPage (render based on activeTab)

**Deliverable:**
- For You tab fully functional
- Aggregation working correctly
- Empty state showing recommendations

**Files:**
- `frontend/src/components/search/for-you-results.tsx`
- Update `frontend/src/pages/search-page.tsx`

---

## Infrastructure vs Feature Summary

### Infrastructure (Reusable Across Platform)
- SearchService methods (search-people, search-collaborations, search-services, search-tags, search-for-you, get-recommendations)
- RecentSearchesService (CRUD operations)
- Search API endpoints (GET /search, POST/DELETE /search/recent)
- Response mappers (format database results to API response)
- Database indexes and triggers

**Used by:**
- Search page (all tabs)
- Feed filters (future)
- Discovery pages (future)
- Mobile app (future)
- Any feature needing to search or track search history

### Feature (Search Page Specific)
- SearchPage container component
- SearchBar component
- SearchTabs component
- RecentSearches component
- ForYouResults component
- PeopleResults component
- CollaborationsResults component
- ServicesResults component
- TagsResults component
- Search page routing and URL sync

**Used by:**
- Only the search page
- Exclusive to search page UI/UX

---

## Code Standards

### Naming & Structure

- **Over brevity:** Use full words. Prefer `searchQuery` over `q`, `activeTab` over `tab`
- **Clarity first:** Function names describe what they do: `saveRecentSearch()`, not `save()`
- **Signal over silence:** Comments only for non-obvious "why", not "what" the code does
- **Minimal code:** Each file does one thing well. No god classes.

### File Naming Convention

- **TypeScript services/controllers:** `kebab-case.ts`
  - `search.service.ts`
  - `search.controller.ts`
  - `recent-searches.service.ts`

- **React components:** `kebab-case.tsx`
  - `search-page.tsx`
  - `search-bar.tsx`
  - `recent-searches.tsx`
  - `for-you-results.tsx`

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

frontend/src/pages/
└── search-page.tsx               // Container component

frontend/src/components/search/
├── search-bar.tsx                // Input with debounce
├── search-tabs.tsx               // Tab navigation
├── recent-searches.tsx           // Recent searches display
├── for-you-results.tsx           // For You renderer
├── people-results.tsx            // People renderer
├── collaborations-results.tsx    // Collaborations renderer
├── services-results.tsx          // Services renderer
└── tags-results.tsx              // Tags renderer
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

- Search suggestions/autocomplete (reuses infrastructure)
- Trending searches across all users (reuses infrastructure)
- User-offered services (reuses infrastructure)
- Search analytics (reuses infrastructure)
- Advanced filters (if needed)
- Search history expiration (30 days)

---

## Related Files

- `docs/DATABASE_SCHEMA.md` - Full schema reference
- `backend/src/entities/search/` - Search implementation
- `frontend/src/pages/search-page.tsx` - Search UI entry point
