# LineUp Database Documentation

**Version:** 1.0  
**Database:** PostgreSQL (Supabase)  
**Last Updated:** November 20, 2025

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Schema Diagram](#schema-diagram)
3. [Core Tables](#core-tables)
4. [User Profile Tables](#user-profile-tables)
5. [Junction Tables](#junction-tables)
6. [Social & Collaboration Tables](#social--collaboration-tables)
7. [Engagement Tables](#engagement-tables)
8. [Messaging & Notifications](#messaging--notifications)
9. [Search System](#search-system)
10. [ENUM Types](#enum-types)
11. [Indexes](#indexes)
12. [Functions & Triggers](#functions--triggers)
13. [Row Level Security (RLS)](#row-level-security-rls)
14. [Usage Examples](#usage-examples)
15. [WebSocket Events](#websocket-events)
16. [Maintenance Tasks](#maintenance-tasks)

---

## Database Overview

LineUp is a social networking platform for musicians. The database supports:
- **User profiles** with genres, and social links
- **Posts** (Notes, Collaboration Requests, Stories)
- **Connections** (LinkedIn-style mutual connections)
- **Messaging** (Direct and group conversations, max 8 participants)
- **Notifications** (Real-time, WebSocket-compatible)
- **Search** (Full-text search across users, posts, tags)

**Authentication:** Supabase Auth (`auth.users` table)

---

## Schema Diagram

```
┌─────────────┐
│ auth.users  │ (Supabase Auth)
└──────┬──────┘
       │
       │ 1:1
       ▼
┌─────────────────────────────────────────────────────────┐
│                      CORE TABLES                        │
├─────────────────────────────────────────────────────────┤
│  profiles (extends auth.users)                          │
│  ├─ Basic info: username, name, avatar, bio             │
│  ├─ Contact: phone_country_code, phone_number           │
│  ├─ Preferences: theme_color, spotify_playlist_url      │
│  └─ Security: blocked_users[]                           │
│                                                         │
│  posts (Notes, Requests, Stories)                       │
│  ├─ type: 'note' | 'request' | 'story'                  │
│  ├─ content: title, description                         │
│  └─ metadata: location, paid_opportunity, expires_at    │
│                                                         │
│  metadata (tags, genres, artists)                       │
│  └─ type: 'tag' | 'genre' | 'artist'                    │
│                                                         │
│  media (images, videos)                                 │
│  └─ type: 'image' | 'video'                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  USER PROFILE TABLES                    │
├─────────────────────────────────────────────────────────┤
│  user_looking_for (what users seek)                     │
│  user_metadata (genres, artists)                        │
│  user_social_media (social links)                       │
│  faq_questions (seed data)                              │
│  user_faq (user answers to questions)                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   JUNCTION TABLES                       │
├─────────────────────────────────────────────────────────┤
│  post_media (posts ↔ media, with display_order)         │
│  post_metadata (posts ↔ tags/genres)                    │
│  post_tagged_users (posts ↔ users, max 4)               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              SOCIAL & COLLABORATION                     │
├─────────────────────────────────────────────────────────┤
│  connection_requests (LinkedIn-style)                   │
│  ├─ status: 'pending' | 'accepted' | 'rejected'         │
│  └─ Both users must accept                              │
│                                                         │
│  user_collaborations (past work together)               │
│  user_reviews (5-star ratings)                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    ENGAGEMENT                           │
├─────────────────────────────────────────────────────────┤
│  likes, bookmarks, comments                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              MESSAGING & NOTIFICATIONS                  │
├─────────────────────────────────────────────────────────┤
│  conversations (direct | group, max 8 participants)     │
│  conversation_participants                              │
│  messages (with replies, media, read receipts)          │
│  message_read_receipts                                  │
│  notifications (polymorphic, WebSocket-ready)           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   SEARCH SYSTEM                         │
├─────────────────────────────────────────────────────────┤
│  recent_searches (user search history)                  │
│  + Full-text search vectors on profiles/posts/metadata  │
│  + Search functions (for_you, people, collaborations)   │ 
└─────────────────────────────────────────────────────────┘
```

---

## Core Tables

### 1. profiles
**Purpose:** Extends Supabase Auth with user profile data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, FK→auth.users | User identifier |
| `username` | TEXT | UNIQUE, NOT NULL | 3-30 alphanumeric + underscore |
| `first_name` | TEXT | NOT NULL | User's first name |
| `last_name` | TEXT | NOT NULL | User's last name |
| `avatar_url` | TEXT | | Profile picture URL |
| `bio` | TEXT | ≤100 chars | Short bio |
| `about_me` | TEXT | ≤500 chars | Detailed description |
| `phone_country_code` | INTEGER | NOT NULL | Phone country code |
| `phone_number` | BIGINT | NOT NULL | Phone number |
| `year_of_birth` | INTEGER | NOT NULL, ≥13 years old | Birth year |
| `location` | TEXT | NOT NULL, ≤100 chars | "City, Country" |
| `user_type` | TEXT | DEFAULT 'musician' | User type |
| `theme_color` | TEXT | Hex color | Theme color (#RRGGBB) |
| `spotify_playlist_url` | TEXT | | Spotify link |
| `onboarding_completed` | BOOLEAN | DEFAULT FALSE | Onboarding status |
| `blocked_users` | UUID[] | DEFAULT '{}' | Array of blocked user IDs |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Auto-updated |
| `search_vector` | TSVECTOR | GENERATED | Full-text search |

**Indexes:**
- `idx_profiles_username`
- `idx_profiles_location`
- `idx_profiles_created_at`
- `idx_profiles_blocked_users` (GIN)
- `idx_profiles_search_vector` (GIN)

**Triggers:**
- `profiles_updated_at` - Auto-updates `updated_at`

---

### 2. posts
**Purpose:** All post types (Notes, Requests, Stories)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Auto-generated |
| `type` | post_type | NOT NULL | 'note', 'request', 'story' |
| `title` | TEXT | NOT NULL, ≤100 chars | Post title |
| `description` | TEXT | NOT NULL, 10-5000 chars | Post content |
| `author_id` | UUID | FK→profiles | Post creator |
| `location` | TEXT | | For requests |
| `paid_opportunity` | BOOLEAN | | For requests |
| `expires_at` | TIMESTAMPTZ | | For stories (24hr) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Auto-updated |
| `search_vector` | TSVECTOR | GENERATED | Full-text search |

**Indexes:**
- `idx_posts_type`
- `idx_posts_author_id`
- `idx_posts_created_at` (DESC)
- `idx_posts_type_created`
- `idx_posts_search_vector` (GIN)

**Triggers:**
- `posts_updated_at`
- `trigger_notify_post_like` (creates notification)
- `trigger_notify_post_comment` (creates notification)
- `trigger_notify_tagged_in_post` (creates notification)

---

### 3. metadata
**Purpose:** Consolidated tags, genres, artists

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Auto-generated |
| `type` | metadata_type | NOT NULL | 'tag', 'genre', 'artist' |
| `name` | TEXT | NOT NULL | Value (e.g., "Rock", "Guitar") |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `search_vector` | TSVECTOR | GENERATED | Full-text search |

**Unique Constraint:** `(type, name)` - prevents duplicate "Rock" genre

**Indexes:**
- `idx_metadata_type`
- `idx_metadata_name`
- `idx_metadata_type_name`
- `idx_metadata_search_vector` (GIN)
- `idx_metadata_name_trgm` (GIN) - fuzzy search

---

### 4. media
**Purpose:** Uploaded images and videos

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Auto-generated |
| `url` | TEXT | NOT NULL | Media URL (storage bucket) |
| `thumbnail_url` | TEXT | | For videos |
| `type` | media_type | NOT NULL | 'image', 'video' |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

---

## User Profile Tables

### 5. user_looking_for
**Purpose:** What users are seeking on the platform

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | PK, FK→profiles | User |
| `looking_for_value` | looking_for_type | PK | 'connect', 'promote', 'find-band', 'find-services' |

**Constraint:** Max 4 selections per user (via trigger)

---

### 6. user_metadata
**Purpose:** Links users to genres, artists

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | PK, FK→profiles | User |
| `metadata_id` | UUID | PK, FK→metadata | Genre/artist |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Constraint:** Max 10 metadata items per user (via trigger)

**Indexes:**
- `idx_user_metadata_user_id`
- `idx_user_metadata_metadata_id`

---

### 7. user_social_media
**Purpose:** User's social media profile links

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | PK, FK→profiles | 1:1 with user |
| `instagram` | TEXT | | Instagram URL |
| `twitter` | TEXT | | Twitter/X URL |
| `youtube` | TEXT | | YouTube URL |
| `facebook` | TEXT | | Facebook URL |
| `tiktok` | TEXT | | TikTok URL |
| `soundcloud` | TEXT | | SoundCloud URL |
| `bandcamp` | TEXT | | Bandcamp URL |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Auto-updated |

---

### 8. faq_questions
**Purpose:** Pre-defined questions users can answer

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Auto-generated |
| `question` | TEXT | UNIQUE, NOT NULL, ≤500 chars | Question text |
| `display_order` | INTEGER | DEFAULT 0 | Sort order |
| `is_active` | BOOLEAN | DEFAULT FALSE | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Seed Data:** 10 pre-defined questions:
1. What instruments do you play?
2. What genres are you most interested in?
3. Are you available for gigs or collaborations?
4. What's your experience level?
5. Do you have your own equipment?
6. What are your musical influences?
7. Are you looking to join a band or start one?
8. What's your rehearsal availability?
9. Do you have any recordings or demos?
10. What are your musical goals?

---

### 9. user_faq
**Purpose:** User answers to FAQ questions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Auto-generated |
| `user_id` | UUID | FK→profiles | Profile owner |
| `question_id` | UUID | FK→faq_questions | Question being answered |
| `answer` | TEXT | NOT NULL, 1-1000 chars | User's answer |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Auto-updated |

**Unique Constraint:** `(user_id, question_id)` - one answer per question

---

## Junction Tables

### 10. post_media
**Purpose:** Links posts to media files with ordering

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `post_id` | UUID | PK, FK→posts | |
| `media_id` | UUID | PK, FK→media | |
| `display_order` | INTEGER | DEFAULT 0 | Carousel ordering |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

---

### 11. post_metadata
**Purpose:** Links posts to tags (Notes) or genres (Requests)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `post_id` | UUID | PK, FK→posts | |
| `metadata_id` | UUID | PK, FK→metadata | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Constraint:** Max 10 tags/genres per post (via trigger)

---

### 12. post_tagged_users
**Purpose:** Mentions/tags users in posts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `post_id` | UUID | PK, FK→posts | |
| `user_id` | UUID | PK, FK→profiles | Tagged user |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Constraint:** Max 4 tagged users per post (via trigger)

---

## Social & Collaboration Tables

### 13. connection_requests
**Purpose:** LinkedIn-style mutual connections

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Auto-generated |
| `requester_id` | UUID | FK→profiles | Who sent request |
| `recipient_id` | UUID | FK→profiles | Who received request |
| `status` | TEXT | 'pending', 'accepted', 'rejected' | Request status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Auto-updated |

**Unique Constraint:** `(requester_id, recipient_id)`

**Check Constraint:** `requester_id != recipient_id`

**Indexes:**
- `idx_connection_requests_requester_id`
- `idx_connection_requests_recipient_id`
- `idx_connection_requests_status`

**View:** `connections` - Shows accepted connections (bidirectional)

**Triggers:**
- `connection_requests_updated_at`
- `trigger_notify_connection_request` (creates notifications)

**Helper Functions:**
- `are_users_connected(user_a, user_b)` → BOOLEAN
- `get_connection_status(user_a, user_b)` → TEXT

---

### 14. user_collaborations
**Purpose:** Past collaborations between users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Auto-generated |
| `user_id` | UUID | FK→profiles | |
| `collaborator_id` | UUID | FK→profiles | |
| `description` | TEXT | ≤200 chars | Collaboration details |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Unique Constraint:** `(user_id, collaborator_id)`

**Check Constraint:** `user_id != collaborator_id`

---

### 15. user_reviews
**Purpose:** User reviews (5-star rating system)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Auto-generated |
| `user_id` | UUID | FK→profiles | Reviewed user |
| `reviewer_id` | UUID | FK→profiles | Reviewer |
| `rating` | INTEGER | 1-5 | Star rating |
| `description` | TEXT | ≤500 chars | Review text |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Unique Constraint:** `(user_id, reviewer_id)` - one review per pair

**Check Constraint:** `user_id != reviewer_id`

**Triggers:**
- `trigger_notify_review` (creates notification)

---

## Engagement Tables

### 16. likes
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `post_id` | UUID | PK, FK→posts | |
| `user_id` | UUID | PK, FK→profiles | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

---

### 17. bookmarks
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `post_id` | UUID | PK, FK→posts | |
| `user_id` | UUID | PK, FK→profiles | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**RLS:** Only user can see their own bookmarks (private)

---

### 18. comments
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Auto-generated |
| `post_id` | UUID | FK→posts | |
| `author_id` | UUID | FK→profiles | |
| `content` | TEXT | 1-1000 chars | Comment text |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Auto-updated |

**Triggers:**
- `comments_updated_at`

---

## Messaging & Notifications

### 19. conversations
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Auto-generated |
| `type` | conversation_type | 'direct', 'group' | |
| `name` | TEXT | | Required for groups |
| `avatar_url` | TEXT | | For groups |
| `created_by` | UUID | FK→profiles | Creator |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Auto-updated on new message |
| `last_message_id` | UUID | | Denormalized |
| `last_message_preview` | TEXT | | Denormalized |
| `last_message_at` | TIMESTAMPTZ | | Denormalized |

**Constraint:** Group conversations must have a name (via trigger)

**Helper Function:**
- `get_or_create_direct_conversation(user_a, user_b)` → UUID

---

### 20. conversation_participants
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `conversation_id` | UUID | PK, FK→conversations | |
| `user_id` | UUID | PK, FK→profiles | |
| `joined_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `left_at` | TIMESTAMPTZ | | NULL if active |
| `is_admin` | BOOLEAN | DEFAULT FALSE | For groups |
| `last_read_message_id` | UUID | | Read receipts |
| `last_read_at` | TIMESTAMPTZ | | Read receipts |
| `notifications_enabled` | BOOLEAN | DEFAULT TRUE | |
| `is_muted` | BOOLEAN | DEFAULT FALSE | |
| `is_typing` | BOOLEAN | DEFAULT FALSE | WebSocket |
| `last_typing_at` | TIMESTAMPTZ | | WebSocket |

**Constraint:** Max 8 participants per conversation (via trigger)

**Helper Functions:**
- `get_unread_message_count(user_id, conversation_id)` → INTEGER
- `mark_conversation_read(user_id, conversation_id)` → VOID

---

### 21. messages
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Auto-generated |
| `conversation_id` | UUID | FK→conversations | |
| `sender_id` | UUID | FK→profiles | |
| `content` | TEXT | 1-5000 chars | Message text |
| `media_ids` | UUID[] | | Array of media IDs |
| `is_edited` | BOOLEAN | DEFAULT FALSE | |
| `edited_at` | TIMESTAMPTZ | | |
| `is_deleted` | BOOLEAN | DEFAULT FALSE | Soft delete |
| `deleted_at` | TIMESTAMPTZ | | |
| `reply_to_message_id` | UUID | FK→messages | Thread support |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `sent_via_websocket` | BOOLEAN | DEFAULT FALSE | WebSocket tracking |

**Triggers:**
- `messages_update_conversation` - Updates conversation's last_message

---

### 22. message_read_receipts
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `message_id` | UUID | PK, FK→messages | |
| `user_id` | UUID | PK, FK→profiles | |
| `read_at` | TIMESTAMPTZ | DEFAULT NOW() | |

---

### 23. notifications
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Auto-generated |
| `recipient_id` | UUID | FK→profiles | Who receives |
| `actor_id` | UUID | FK→profiles | Who triggered (nullable) |
| `type` | notification_type | | See ENUM types |
| `entity_type` | TEXT | | 'post', 'comment', etc. |
| `entity_id` | UUID | | Related entity ID |
| `title` | TEXT | NOT NULL | Notification title |
| `body` | TEXT | | Optional details |
| `action_url` | TEXT | | Deep link |
| `is_read` | BOOLEAN | DEFAULT FALSE | |
| `is_archived` | BOOLEAN | DEFAULT FALSE | |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |
| `read_at` | TIMESTAMPTZ | | Auto-set on read |
| `sent_via_websocket` | BOOLEAN | DEFAULT FALSE | WebSocket tracking |

**Triggers:**
- `notifications_mark_read` - Sets read_at when is_read changes

**Auto-created for:**
- Post likes
- Comments
- Connection requests
- Connection accepts
- Tagged in post
- Reviews

---

## Search System

### 24. recent_searches
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Auto-generated |
| `user_id` | UUID | FK→profiles | |
| `search_query` | TEXT | NOT NULL | Search term |
| `search_tab` | TEXT | 'for_you', 'people', 'collaborations', 'tags' | |
| `entity_type` | TEXT | | 'user', 'post', 'tag' |
| `entity_id` | UUID | | Clicked result |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | |

**Helper Functions:**
- `log_search(user_id, query, tab, ...)` - Saves search, keeps last 50
- `clear_recent_searches(user_id)` - Clears all
- `get_recent_searches(user_id, limit)` - Retrieves with entity details

---

### Search Functions

#### For You Tab
```sql
search_for_you(user_id, query, limit, offset) → TABLE
```
- Returns: users with shared genres + matching collaboration requests
- Personalized based on user's genres

#### People Tab
```sql
search_people(user_id, query, filter_location, filter_genres, 
              filter_looking_for, limit, offset) → TABLE
```
- Returns: all users with filters
- Includes connection status

#### Collaborations Tab
```sql
search_collaborations(user_id, query, filter_location, filter_genres, 
                      filter_paid_only, limit, offset) → TABLE
```
- Returns: collaboration requests (type='request')
- Includes author info, genres, tagged users

#### Tags Tab
```sql
search_tags(query, filter_type, limit, offset) → TABLE
```
- Returns: metadata with usage counts
- Sorted by relevance or usage

#### Empty State Functions
```sql
get_suggested_people(user_id, limit) → TABLE
```
- Returns: people with shared genres or same location

```sql
get_trending_tags(limit) → TABLE
```
- Returns: tags with highest recent usage (last 7 days)

---

## ENUM Types

```sql
-- Post types
CREATE TYPE post_type AS ENUM ('note', 'request', 'story');

-- Media types
CREATE TYPE media_type AS ENUM ('image', 'video');

-- Metadata types
CREATE TYPE metadata_type AS ENUM ('tag', 'genre', 'artist');

-- What users are looking for
CREATE TYPE looking_for_type AS ENUM ('connect', 'promote', 'find-band', 'find-services');

-- Conversation types
CREATE TYPE conversation_type AS ENUM ('direct', 'group');

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'like',
  'comment',
  'connection_request',
  'connection_accepted',
  'tagged_in_post',
  'review',
  'faq_question',
  'collaboration_request',
  'message'
);
```

---

## Indexes

### Performance Indexes

**Profiles:**
```sql
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
CREATE INDEX idx_profiles_blocked_users ON profiles USING GIN(blocked_users);
```

**Posts:**
```sql
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_type_created ON posts(type, created_at DESC);
```

**Metadata:**
```sql
CREATE INDEX idx_metadata_type ON metadata(type);
CREATE INDEX idx_metadata_name ON metadata(name);
CREATE INDEX idx_metadata_type_name ON metadata(type, name);
```

**Connection Requests:**
```sql
CREATE INDEX idx_connection_requests_requester_id ON connection_requests(requester_id);
CREATE INDEX idx_connection_requests_recipient_id ON connection_requests(recipient_id);
CREATE INDEX idx_connection_requests_status ON connection_requests(status);
```

**Messages:**
```sql
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
```

**Notifications:**
```sql
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_recipient_unread ON notifications(recipient_id, is_read) 
  WHERE is_read = FALSE;
```

### Full-Text Search (GIN Indexes)

```sql
CREATE INDEX idx_profiles_search_vector ON profiles USING GIN(search_vector);
CREATE INDEX idx_posts_search_vector ON posts USING GIN(search_vector);
CREATE INDEX idx_metadata_search_vector ON metadata USING GIN(search_vector);
```

### Fuzzy Search (Trigram Indexes)

```sql
CREATE INDEX idx_profiles_username_trgm ON profiles USING GIN(username gin_trgm_ops);
CREATE INDEX idx_profiles_first_name_trgm ON profiles USING GIN(first_name gin_trgm_ops);
CREATE INDEX idx_profiles_last_name_trgm ON profiles USING GIN(last_name gin_trgm_ops);
CREATE INDEX idx_metadata_name_trgm ON metadata USING GIN(name gin_trgm_ops);
```

---

## Functions & Triggers

### Utility Functions

**Auto-update timestamp:**
```sql
CREATE FUNCTION update_updated_at() RETURNS TRIGGER;
```

**Constraint enforcement:**
```sql
CREATE FUNCTION check_looking_for_limit() RETURNS TRIGGER; -- Max 4
CREATE FUNCTION check_user_metadata_limit() RETURNS TRIGGER; -- Max 10
CREATE FUNCTION check_tagged_users_limit() RETURNS TRIGGER; -- Max 4
CREATE FUNCTION check_post_metadata_limit() RETURNS TRIGGER; -- Max 10
CREATE FUNCTION check_conversation_participant_limit() RETURNS TRIGGER; -- Max 8
CREATE FUNCTION validate_group_conversation() RETURNS TRIGGER; -- Groups need names
```

### Notification Triggers

```sql
CREATE FUNCTION notify_post_like() RETURNS TRIGGER;
CREATE FUNCTION notify_post_comment() RETURNS TRIGGER;
CREATE FUNCTION notify_connection_request() RETURNS TRIGGER;
CREATE FUNCTION notify_tagged_in_post() RETURNS TRIGGER;
CREATE FUNCTION notify_review() RETURNS TRIGGER;
```

### Messaging Functions

```sql
CREATE FUNCTION update_conversation_timestamp() RETURNS TRIGGER;
CREATE FUNCTION update_conversation_last_message() RETURNS TRIGGER;
CREATE FUNCTION mark_notification_read() RETURNS TRIGGER;
```

### Helper Functions

**Connections:**
```sql
are_users_connected(user_a UUID, user_b UUID) RETURNS BOOLEAN
get_connection_status(user_a UUID, user_b UUID) RETURNS TEXT
```

**Blocking:**
```sql
block_user(blocker_id UUID, blocked_id UUID) RETURNS VOID
unblock_user(blocker_id UUID, blocked_id UUID) RETURNS VOID
```

**Messaging:**
```sql
get_or_create_direct_conversation(user_a UUID, user_b UUID) RETURNS UUID
get_unread_message_count(user_id UUID, conversation_id UUID) RETURNS INTEGER
mark_conversation_read(user_id UUID, conversation_id UUID) RETURNS VOID
```

---

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:

### Public Read
- `profiles` - Everyone can view
- `posts` - Everyone can view
- `metadata` - Everyone can view
- `likes` - Everyone can view
- `comments` - Everyone can view

### User-Specific Write
- Users can only update their own profile
- Users can only create/edit/delete their own posts
- Users can only manage their own bookmarks, likes, comments

### Private Data
- `bookmarks` - Only user can see their own
- `notifications` - Only recipient can see
- `messages` - Only conversation participants can see
- `recent_searches` - Only user can see their own

### Connection-Based
- Users can send connection requests
- Recipients can accept/reject
- Both parties can delete accepted connections

---

## Usage Examples

### 1. Create User Profile (Onboarding)

```sql
-- User signs up via Supabase Auth (creates auth.users record)
-- Then create profile:
INSERT INTO profiles (id, username, first_name, last_name, 
                      phone_country_code, phone_number, 
                      year_of_birth, location)
VALUES (
  auth.uid(),
  'johndoe',
  'John',
  'Doe',
  45, -- Denmark
  12345678,
  1995,
  'Copenhagen, Denmark'
);

-- Add genres
INSERT INTO user_metadata (user_id, metadata_id)
SELECT auth.uid(), id 
FROM metadata 
WHERE name IN ('Rock', 'Jazz', 'Blues') AND type = 'genre';

-- Add looking_for
INSERT INTO user_looking_for (user_id, looking_for_value)
VALUES 
  (auth.uid(), 'connect'),
  (auth.uid(), 'find-band');
```

### 2. Create Collaboration Request

```sql
-- Create post
INSERT INTO posts (type, title, description, author_id, location, paid_opportunity)
VALUES (
  'request',
  'Looking for Drummer - Rock Band',
  'We are a rock band looking for an experienced drummer for regular gigs...',
  auth.uid(),
  'Copenhagen, Denmark',
  TRUE
)
RETURNING id;

-- Add genres
INSERT INTO post_metadata (post_id, metadata_id)
SELECT 'post-id', id 
FROM metadata 
WHERE name IN ('Rock', 'Alternative') AND type = 'genre';
```

### 3. Send Connection Request

```sql
INSERT INTO connection_requests (requester_id, recipient_id)
VALUES (auth.uid(), 'other-user-id');
```

### 4. Accept Connection

```sql
UPDATE connection_requests
SET status = 'accepted'
WHERE recipient_id = auth.uid()
  AND requester_id = 'requesting-user-id';
```

### 5. Search for People

```sql
SELECT * FROM search_people(
  auth.uid(),
  'guitarist',
  filter_location := 'Copenhagen',
  filter_genres := ARRAY[(SELECT id FROM metadata WHERE name = 'Rock')]::UUID[]
);
```

### 6. Send Message

```sql
-- Get or create conversation
SELECT get_or_create_direct_conversation(auth.uid(), 'other-user-id');

-- Send message
INSERT INTO messages (conversation_id, sender_id, content)
VALUES ('conversation-id', auth.uid(), 'Hey, want to collaborate?');
```

### 7. Get Unread Notifications

```sql
SELECT * FROM notifications
WHERE recipient_id = auth.uid()
  AND is_read = FALSE
ORDER BY created_at DESC;
```

---

## WebSocket Events

Subscribe to real-time changes using Supabase Realtime:

### New Messages

```javascript
supabase
  .channel(`conversation:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, handleNewMessage)
  .subscribe();
```

### New Notifications

```javascript
supabase
  .channel(`user:${userId}:notifications`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `recipient_id=eq.${userId}`
  }, handleNotification)
  .subscribe();
```

### Typing Indicators

```javascript
supabase
  .channel(`conversation:${conversationId}:presence`)
  .on('presence', { event: 'sync' }, () => {
    // Update typing indicators
  })
  .subscribe();
```

### Connection Requests

```javascript
supabase
  .channel(`user:${userId}:connections`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'connection_requests',
    filter: `recipient_id=eq.${userId}`
  }, handleConnectionRequest)
  .subscribe();
```

---

## Maintenance Tasks

### Cleanup Expired Stories

Run daily via cron:

```sql
DELETE FROM posts
WHERE type = 'story'
  AND expires_at < NOW();
```

### Prune Old Notifications

Keep last 30 days:

```sql
DELETE FROM notifications
WHERE created_at < NOW() - INTERVAL '30 days'
  AND is_read = TRUE;
```

### Vacuum Recent Searches

Automatically handled by `log_search()` function - keeps only last 50 per user.

### Database Statistics

```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

---

## Summary Statistics

- **Total Tables:** 24
- **Total Functions:** 40+
- **Total Indexes:** 45+
- **Total Triggers:** 15+
- **Total ENUM Types:** 6
- **Total RLS Policies:** 50+
