# Global Search – Concept & Feature Design

## 1. Purpose of Search

Search is a **core discovery surface** that lets users find:
- People to connect and collaborate with
- Collaboration requests (posts) to respond to
- Generic music-related services
- Tags used across content

Search is both:
- **Infrastructure:** Shared search logic, relevance, and storage used across multiple features.
- **Feature:** A dedicated, full-page search experience with tabs, recent searches, and specific result presentations.

This document focuses **only on concepts and feature behavior**, not implementation details or file structure.

---

## 2. High-Level Mental Model

### 2.1 Single Query, Multiple Lenses

- There is **one search query string**.
- The query applies across all content types.
- Tabs act as **lenses** over that same query, not separate searches.

Example: User searches for "guitarist"
- **For You:** Curated mix of people, collaboration requests, services, and tags relevant to "guitarist".
- **People:** Only user profiles that match "guitarist".
- **Collaborations:** Only collaboration requests mentioning "guitarist".
- **Services:** Only services relevant to "guitarist".
- **Tags:** Only tags that relate to "guitarist".

### 2.2 What Search Is Not

- Search does **not** expose extra filter UIs (no filter panels, dropdowns, etc.).
- Search does **not** depend on complex client-side filtering logic.
- Search does **not** maintain different queries per tab; the query remains global.

---

## 3. Tabs & Their Roles

The search page has five tabs:
- For You
- People
- Collaborations
- Services
- Tags

Each tab represents a **type of entity** and how results are presented.

### 3.1 For You – Aggregated Discovery

**Goal:** Provide the best overall matches and recommendations for the user.

Behavior:
- Uses the same query as other tabs, but **aggregates** results from:
  - People
  - Collaborations
  - Services
  - Tags
- When a query is present:
  - Fetches top results from each type.
  - Combines them into a single list.
  - Sorts by a unified relevance score.
  - Shows a visual indication of which type each result is (e.g., “Person”, “Collaboration”, “Service”, “Tag”).
- When there is **no query**:
  - Shows **personalized recommendations**, not search results.
  - Recommendations can include:
    - People that match the user’s genres/location.
    - Active collaboration requests related to the user’s interests.
    - Frequently used or trending tags.
    - Services that are broadly useful (e.g., mixing, mastering).

Key principles:
- The user should not need to know which tab to pick to "start" their exploration.
- For You provides a **default, intelligent** view of the most relevant items for any given query.

---

### 3.2 People – Profile Discovery

**Goal:** Help users find other users to connect and collaborate with.

What it searches:
- User profiles and related metadata.
- The query can match:
  - Username
  - First and last name
  - Bio / about text
  - Location
  - Possibly genres or roles via connected metadata

How results should feel:
- Focused on **identity and connection**.
- Cards show:
  - Avatar
  - Name
  - Short bio (truncated if long)
  - A connect button when not already connected, or a “Connected” label when they are.

Important constraints:
- Keep presentation minimal and scannable.
- Avoid overloading with extra fields.

---

### 3.3 Collaborations – Request Discovery

**Goal:** Find collaboration opportunities.

What it searches:
- Collaboration requests represented as posts.
- The query can match the post:
  - Title
  - Description

Behavior:
- Results are **request posts only** (no feed items that aren’t requests).
- Each result should be rendered as the **standard request card**, exactly as used elsewhere in the app.
  - Title
  - Description preview
  - Author info
  - Location (if provided)
  - Paid opportunity badge (if applicable)
  - Associated genres or tags

Key principle:
- Search does not invent new visual treatment; it simply filters the set of request posts and displays them using the **existing** request card UI.

---

### 3.4 Services – Generic Service Types

**Goal:** Help users discover **types of services** relevant to musicians, not specific one-off offers.

What it searches:
- A dedicated services data source containing generic, **seeded** entries (not created by regular users in the UI).
- Each service has:
  - Title
  - Description
  - Optional media
  - Optional location
  - Optional provider information (present in schema, but feature behavior treats services as generic for now)
  - Service type (an enum/classification)

Conceptual behavior:
- Results are **categories or generic offerings**, such as:
  - "Mixing & Mastering"
  - "Session Drumming"
  - "Music Video Production"
  - "Live Sound Engineering"
- Search matches primarily on title and description.
- This tab is about discovering **what kinds of help exist**, not about browsing individual providers in detail.

Future-friendly idea (not required now):
- Later, services could link to profiles that offer that service, but the current concept treats them as generic reference items.

---

### 3.5 Tags – Content Labels

**Goal:** Help users discover and navigate via tags used on posts.

What it searches:
- Tags that are attached to posts via metadata.
- Each tag has:
  - A name (stored without the `#` prefix).
  - A type that indicates it is a tag (not a genre or artist).
  - Usage count (how many posts use this tag).

Behavior:
- The query matches tag names.
- Results are **tag entries** showing:
  - `#tag-name` (the `#` is added in the UI only).
  - Usage count to indicate popularity.
- When a tag is selected:
  - Navigate to a tag-specific view or feed showing all posts that have that tag.

Key principle:
- Tags are a navigational primitive: search helps discover them; clicking a tag switches the user into a tag-centric content view.

---

## 4. Recent Searches

**Goal:** Improve UX by remembering what the user searched for recently and making it instantly reusable.

What is stored for each recent search:
- The user who made the search.
- The raw search query string.
- The tab context in which the search was performed.
- Optional entity references (for future enhancement): the type and ID of the item the user interacted with after the search.
- Timestamp of when the search was made.

Behavior on the search page:
- When the search input is **focused and empty**:
  - Show a list of the user’s recent searches.
- When the user **starts typing**, recent searches are hidden and replaced by search results.

Display rules:
- Show up to a small, recent set (e.g., last 10–15 searches).
- Order by most recent first.
- For each entry, show:
  - The query string.
  - The tab where it was originally run (e.g., People, Tags).
- Provide:
  - A way to restore a search by clicking on it.
  - A way to remove individual entries.
  - A “Clear all” action to remove all stored recent searches.

Deduplication behavior:
- If the user repeats the same query on the same tab:
  - Remove the older record.
  - Insert a new one, so it appears at the top.

Privacy assumptions:
- Recent searches are private to each user.
- There is no global visibility of a user’s search history.

---

## 5. Relevance & Ranking – Conceptual Rules

### 5.1 Base Relevance (Text Matching)

Base relevance is provided by the underlying full-text search capabilities and considers:
- How well the text matches the query.
- Which fields are matched (e.g., username vs bio vs description).
- Frequency and position of matches.

In practice, this means:
- Exact username or title matches rank very high.
- Matches in primary identity fields (name, title) rank higher than descriptive fields (bio, description, about text).
- Shorter content that matches well can be ranked above longer content with weaker matches.

### 5.2 Additional Business Signals

Beyond text matching, search can apply **business rules** to adjust relevance scores:

For **people**:
- Boost results where:
  - The name closely matches the query.
  - The user shares genres with the searching user.
  - The user shares a location with the searching user.
- Optionally de-prioritize:
  - Users the searching user is already connected with (if the goal is discovery of new people).

For **collaborations**:
- Boost:
  - Recent posts (newer requests higher).
  - Paid opportunities, if they tend to be more serious.
  - Requests that share genres or tags with the searching user.

For **services**:
- Boost:
  - Clear title matches.
  - Services that are broadly relevant or used often.

For **tags**:
- Boost:
  - Tags with higher usage count.
  - Tags that closely or exactly match the query.

### 5.3 Aggregation in For You

When combining results from different types in **For You**:
- Normalize relevance scores across types to a comparable scale.
- Apply a **type-level weight** to reflect platform priorities. Example:
  - People: highest weight (core of the platform).
  - Collaborations: slightly lower but still high.
  - Services: medium.
  - Tags: lower (discovery, not end-goal).

Conceptual ordering:
- Within For You, the list is sorted primarily by this combined relevance score.
- Ties (or near-ties) can be broken by recency or secondary signals.

---

## 6. Search Page Behavior

### 6.1 Core Interactions

- The search page is a **dedicated full-screen experience**.
- It contains:
  - A single search input at the top.
  - A row of tabs below the input.
  - A main content area that shows either:
    - Recent searches (when no query), or
    - Search results for the active tab (when there is a query).

### 6.2 Query Lifecycle

1. User opens the search page.
2. The search input is empty and focused.
3. Recent searches are displayed.
4. User types a query:
   - After a short pause (debounce), a search is performed.
   - Results for the active tab are shown.
5. User switches tabs:
   - The same query is used.
   - Results are re-fetched for the newly active tab.
6. User clears the input:
   - Search results disappear.
   - Recent searches appear again.

### 6.3 Per-Tab Behavior Summary

- **For You:**
  - With query: mixed, relevance-ordered list across types.
  - Without query: personalized recommendations.

- **People:**
  - With query: list of people cards matching the query.
  - Without query: either nothing or a future recommendation pattern; conceptually, empty is acceptable.

- **Collaborations:**
  - With query: list of collaboration request cards filtered by the query.
  - Without query: optionally nothing or a future “active near you / matching your genres” view.

- **Services:**
  - With query: list of generic service types relevant to the query.
  - Without query: list of broadly useful services (e.g., mixing, mastering, session players).

- **Tags:**
  - With query: list of tags with usage counts.
  - Without query: potentially trending or popular tags.

The **minimum requirement** is defined, while recommendation-based enhancements can be introduced incrementally.

---

## 7. Conceptual Separation: Infrastructure vs Feature

Even though this document does not talk about code structure, it is important to conceptually separate:

### 7.1 Infrastructure (Reused Logic)

- Core search logic for each entity type (people, collaborations, services, tags).
- The For You aggregation and recommendation behavior.
- The relevance and ranking logic (text scores + business signals).
- Storage and retrieval of recent searches.
- Public search endpoints that any client can call.

These concepts are **not tied** to a specific page. They can support:
- The main search page.
- Inline/compact search experiences elsewhere.
- Mobile apps.
- Future discovery features.

### 7.2 Feature (Search Page Experience)

- The full-page search experience with tabs.
- How recent searches are visually presented and interacted with.
- How results are grouped and rendered within each tab.
- The exact empty states and microcopy.

These concepts are **specific** to the main search page and can evolve independently of core search logic.

---

## 8. Future Extensions (Conceptual Only)

These are **not required now**, but are natural extensions of the concepts:

- Autocomplete / Suggestions:
  - Suggest people, tags, or services as the user types, before pressing enter.

- Trending / Popular Searches:
  - A global or location-based list of what is being searched for frequently.

- Service Providers:
  - Linking generic services to specific users who offer them.

- Analytics:
  - Aggregating trends in search behavior to guide product decisions.

- Advanced Filters:
  - Opt-in filters (time, location, genres) for power users, layered on top of simple query.

These should reuse the same infrastructure concepts without changing the high-level mental model of search.
