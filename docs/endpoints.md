# LineUp API Endpoints Reference

**Last Updated:** November 24, 2025  
**Total Endpoints:** 45

## Public Endpoints (3)

### `GET /api/metadata`

- **Purpose:** Get all tags, genres, artists, locations for dropdowns/autocomplete
- **Returns:** All metadata types with usage counts

### `GET /api/users/:username`

- **Purpose:** View any user's public profile with optional data includes
- **Returns:** Profile data, stats, connection status

### `GET /api/search`

- **Purpose:** Search for users, posts, or tags with filters
- **Query:** `q`, `tab`, `location`, `genres`, `lookingFor`, `paidOnly`
- **Returns:** Polymorphic results (users, posts, or metadata) based on tab

---

## Authentication & Profiles (6)

### `PUT /api/users/:username`

- **Purpose:** Update own profile
- **Updates:** Bio, interests, genres, social links, avatar, FAQ

### `GET /api/users/metadata`

- **Purpose:** Get user lists (connections, pending requests)
- **Query:** `type`, `search`, `limit`, `cursor`
- **Types:** `connections`, `pending_sent`, `pending_received`

### `GET /api/users/:username/posts`

- **Purpose:** Get user's posts separately for tab lazy loading
- **Query:** `cursor`, `limit`
- **Returns:** Posts with pagination

### `GET /api/users/:username/stats`

- **Purpose:** Get user stats only for real-time updates
- **Returns:** Connection count, notes count, requests count

### `POST /api/users/:username/block`

- **Purpose:** Block or unblock a user
- **Actions:** `block`, `unblock`

---

## Posts (10)

### `POST /api/posts`

- **Purpose:** Create a note, request, or story post
- **Body:** `type`, `title`, `description`, `tags`, `genres`, `location`, `paidOpportunity`, `taggedUsers`, `media`
- **Supports:** Notes, collaboration requests, stories

### `GET /api/posts`

- **Purpose:** List posts with filters and pagination
- **Query:** `type`, `authorId`, `cursor`, `limit`, `includeEngagement`, `includeMedia`, `genreIds`, `tags`, `location`, `paidOnly`
- **Returns:** Posts with optional engagement and media data

### `GET /api/posts/:id`

- **Purpose:** Get single post with full details
- **Query:** `includeComments`, `commentsLimit`
- **Returns:** Full post data, author, engagement, optional comments

### `PUT /api/posts/:id`

- **Purpose:** Edit existing post
- **Updates:** Title, description, tags, genres, media, location

### `DELETE /api/posts/:id`

- **Purpose:** Delete a post
- **Behavior:** Soft delete with cascade to comments, likes, bookmarks

### `POST /api/posts/:postId/engage`

- **Purpose:** Like, bookmark, or comment on a post
- **Actions:** `like`, `unlike`, `bookmark`, `unbookmark`, `comment`, `uncomment`
- **Body:** `action`, `content` (for comments), `commentId` (for uncomment)

### `POST /api/posts/:storyId/view`

- **Purpose:** Mark a story as viewed
- **Behavior:** Creates view record, tracks engagement

### `GET /api/posts/:storyId/viewers`

- **Purpose:** See who viewed your story
- **Returns:** Viewer list with timestamps and user info

### `GET /api/bookmarks`

- **Purpose:** List all posts the user has bookmarked
- **Query:** `type`, `cursor`, `limit`
- **Returns:** User's saved posts with pagination

---

## Comments (3)

### `GET /api/posts/:id/comments`

- **Purpose:** List all comments on a post
- **Query:** `cursor`, `limit`, `sort`
- **Returns:** Comments with pagination

### `PATCH /api/posts/:postId/comments/:commentId`

- **Purpose:** Edit your own comment
- **Body:** `content`

### `DELETE /api/posts/:postId/comments/:commentId`

- **Purpose:** Delete your own comment
- **Behavior:** Delete, updates post comment count

---

## Feed & Discovery (1)

### `GET /api/feed`

- **Purpose:** Get home feed with stories, recommendations, and posts
- **Query:** `component`, `cursor`, `limit`
- **Components:** `stories`, `recommendations`, `posts`
- **Returns:** All components or specific component based on query

---

## Connections (1)

### `POST /api/connections`

- **Purpose:** Manage connection requests (LinkedIn-style)
- **Body:** `targetUserId`, `action`
- **Actions:** `request`, `accept`, `reject`, `cancel`, `remove`

---

## Reviews (4)

### `GET /api/users/:username/reviews`

- **Purpose:** List all reviews for a user
- **Query:** `cursor`, `limit`
- **Returns:** Reviews with ratings and text

### `POST /api/users/:username/reviews`

- **Purpose:** Write a review for a user
- **Body:** `rating` (1-5), `content`, `collaborationId`

### `PATCH /api/reviews/:id`

- **Purpose:** Edit your own review
- **Body:** `rating`, `content`

### `DELETE /api/reviews/:id`

- **Purpose:** Delete your own review
- **Behavior:** Permanent delete

---

## Collaborations (4)

### `GET /api/users/:username/collaborations`

- **Purpose:** List all collaborations a user has done
- **Returns:** Collaboration history with details

### `POST /api/collaborations`

- **Purpose:** Create a new collaboration entry
- **Body:** `title`, `description`, `participants`, `startDate`, `endDate`, `mediaUrl`

### `PATCH /api/collaborations/:id`

- **Purpose:** Update collaboration details
- **Body:** `title`, `description`, `startDate`, `endDate`, `mediaUrl`

### `DELETE /api/collaborations/:id`

- **Purpose:** Delete a collaboration entry
- **Behavior:** Permanent delete

---

## Messaging (10)

### `POST /api/conversations`

- **Purpose:** Start a new DM or group conversation
- **Body:** `participantIds`, `type`, `name`, `initialMessage`
- **Supports:** Individual (DM) and group chats

### `GET /api/conversations`

- **Purpose:** List all conversations with unread counts
- **Query:** `cursor`, `limit`, `unreadOnly`
- **Returns:** Conversations with last message and unread count

### `PUT /api/conversations/:id`

- **Purpose:** Update conversation settings
- **Body:** `name`, `isMuted`, `isPinned`, `customEmoji`
- **Updates:** Group name, mute status, pin status

### `DELETE /api/conversations/:id`

- **Purpose:** Delete DM or leave group conversation
- **Query:** `action` (delete or leave)
- **Behavior:** Soft delete for DM, removes user from group

### `GET /api/conversations/:id/messages`

- **Purpose:** Get all messages in a conversation
- **Query:** `cursor`, `limit`, `before`
- **Returns:** Messages with read receipts and author info

### `POST /api/conversations/:id/messages`

- **Purpose:** Send a text, voice, image, or video message
- **Body:** `content`, `type`, `mediaUrl`, `duration`, `replyTo`
- **Supports:** Text, voice, image, video

### `PATCH /api/conversations/:id/messages/:messageId`

- **Purpose:** Edit a message
- **Body:** `content`
- **Constraints:** Text only, within 15 minutes of sending

### `DELETE /api/conversations/:id/messages/:messageId`

- **Purpose:** Delete a sent message
- **Behavior:** Soft delete with "Message deleted" placeholder

### `POST /api/conversations/:id/participants`

- **Purpose:** Add users to a group conversation
- **Body:** `userIds`
- **Constraint:** Max 8 participants total

### `DELETE /api/conversations/:id/participants/:userId`

- **Purpose:** Remove user from group or leave group
- **Behavior:** Updates participant list, sends system message

---

## Notifications (3)

### `GET /api/notifications`

- **Purpose:** Get all notifications with filters
- **Query:** `type`, `unreadOnly`, `cursor`, `limit`
- **Returns:** Notifications with actor info and related entities

### `PATCH /api/notifications/:id`

- **Purpose:** Mark a notification as read or unread
- **Body:** `isRead`

### `DELETE /api/notifications/:id`

- **Purpose:** Delete a single notification
- **Behavior:** Permanent delete

---

## Media (2)

### `POST /api/upload`

- **Purpose:** Upload images/videos for avatars or post media
- **Body:** `files`, `type`, `generateThumbnails`
- **Returns:** Upload URLs, thumbnails, metadata
- **Supports:** Batch upload (max 4 files)

### `DELETE /api/media/:id`

- **Purpose:** Delete uploaded media from storage
- **Behavior:** Removes from Supabase Storage and database

---

## Notes

- Authentication: Handled by Supabase Auth (not counted in endpoints)
- WebSocket: Real-time features via Socket.IO (separate from REST API)
- File uploads: Uses Supabase Storage with signed URLs
- Pagination: All list endpoints support cursor-based pagination
- Rate limiting: Apply per-endpoint based on criticality

**Total:** 45 Endpoints  
**Public:** 3  
**Authenticated:** 42
