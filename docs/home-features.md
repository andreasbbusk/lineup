# LineUp - Home Features (MVP)

## Overview

Home consists of three components:

1. Story scroll container (horizontal)
2. Collaboration requests scroll container (horizontal)
3. Infinite feed with posts (vertical)

All visual details are defined in Figma.

---

## Feature 1: Story Container

### Functionality

- Horizontal scroll with profiles from followed users
- Two states per profile:
  - **Active story (< 24 hours):** Click opens story viewer
  - **No active story:** Click navigates to profile
- Story viewer: Fullscreen overlay with automatic/manual navigation

### Data Requirements

- User ID, username, firstName, lastName, avatarUrl
- `hasActiveStory`: boolean
- `storyCount`: number
- For story viewer: Story ID, media type/URL, timestamp, author info

### Technical Considerations

- **State Management:** Zustand to track viewed stories (session state)
- **Real-time:** Socket.IO event when followed users post new story
- **Data Fetching:** TanStack Query with short cache (1-2 min), possibly prefetch first 3-5 stories
- **Database:** Stories have TTL (24 hours) - automatic cleanup
- **Performance:** Lazy load profile images, video thumbnails
- **Note:** Story feature coming later (see create-features.md)

---

## Feature 2: Collaboration Requests Container

### Functionality

- Horizontal scroll with collaboration request preview cards
- Click on card navigates to `/posts/request/[postId]`
- "See more collabs" button links to `/posts?type=request`

### Data Requirements

- Post ID (type: 'request'), title, description
- Profile info (author: user ID, username, firstName, lastName, avatarUrl)
- Created timestamp, location (optional, format: "City, Country")
- Genres (array of genre strings, max 10, displayed without # prefix)
- Paid opportunity indicator (boolean)
- Tagged users (max 4, optional)
- Media array (max 4, optional)

### Technical Considerations

- **Recommendation Logic:** Match user genres/interests with request genres, prioritize new (<7 days), exclude requests the user has interacted with
- **Data Fetching:** Initial fetch 3-5 cards via `GET /api/posts?type=request&limit=5`, stale-while-revalidate strategy
- **Database:** Indexing on genres for fast query
- **Empty State:** When no relevant requests are found

---

## Feature 3: Infinite Feed (Posts)

### Functionality

- Vertical infinite scroll with posts from followed users
- Post interactions: Like, comment, share, bookmark
- Double-tap image to like

### Data Requirements

- Post ID, type ('note' | 'request')
- Created timestamp, title, description (text, min 10, max 5000 chars), media array
- Author info (user ID, username, firstName, lastName, avatarUrl)
- Tagged users (max 4, optional) - array of `{ id, firstName, lastName, avatarUrl }`
- For Note posts: tags (array of tag strings, max 10, displayed with # prefix in UI)
- For Request posts: genres (array of genre strings, max 10, displayed without # prefix), location (optional), paidOpportunity (boolean)
- Engagement counts (likes, comments, shares)
- User interaction state (`hasLiked`, `hasBookmarked`)

### Technical Considerations

- **Pagination:** TanStack Query `useInfiniteQuery` with cursor-based pagination (not offset)
- **Real-time:** Socket.IO `post:new` event - batch new posts, show notification banner
- **Optimistic Updates:** Like/comment/bookmark with instant UI update and rollback on error
- **Infinite Scroll:** Intersection Observer detects when user reaches bottom, prefetch at 80% scrolled
- **Performance:** Next.js Image component, cache posts (5 min staleTime), debounce scroll events
- **Database:** Posts indexed on author + timestamp

---

## Edge Cases

- **Following no users:** Onboarding state in all three containers
- **No active stories:** Show profiles without highlight ring
- **No collaboration requests:** Empty state
- **Load error:** Error state with retry option
- **Offline:** Show cached data with offline indicator
