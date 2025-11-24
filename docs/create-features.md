# LineUp - Create Features (MVP)

## Overview

The Create page allows users to create and share content with the LineUp community. The page features tabbed navigation between **Note** and **Request** post types. Story functionality is not part of MVP and should be ignored.

**Route:** `/create`

**Tab Navigation:**

- **Note** tab (active by default)
- **Story** tab (disabled/ignored - not part of MVP)
- **Request** tab

All visual details are defined in Figma.

---

## Feature 1: Create Note

### Functionality

Create and share Note posts with the community. Notes are for sharing thoughts, questions, tutorials, and music-related content. Users can add tags, mention other users, and include media to make their posts more engaging.

**Tab:** Note (default active tab)

**Form Components:**

1. **Title Field** - Text input for post title
2. **Description Field** - Textarea for post content
3. **Add Tags Button** - Opens tag selector modal
4. **Add People Button** - Opens user tagging selector
5. **Add Media Button** - Opens media upload interface
6. **Post Button** - Submits the post

**User Flow:**

1. User navigates to `/create` (Note tab active by default)
2. User enters title and description
3. Optionally adds tags, mentions users, or uploads media
4. Clicks "Post" button to publish
5. Post is created and user is redirected or shown success message

### Data Requirements

**Title:**

- `title`: string (required, max 100 chars)
- Input: Single-line text input
- Placeholder: "Write a title..."
- Validation: Required, max length enforced, trim whitespace

**Description:**

- `description`: string (required, min 10, max 5000 chars)
- Input: Multi-line textarea (expands as user types)
- Placeholder: "Write a description..."
- Validation: Required, min 10 chars, max 5000 chars
- Character counter: Shows remaining characters (5000 - current length)

**Tags:**

- `tags`: Array of tag strings (optional, max 10 items, freeform)
- Input: Tag selector with autocomplete from metadata
- Display: Tags shown with # prefix in UI (e.g., "#tutorial", "#music-theory")
- Storage: Tags stored without # prefix in database
- Freeform entry: Users can create new tags not in metadata
- Backend: Creates new tag entries if they don't exist

**Tagged Users:**

- `taggedUsers`: Array of user IDs (optional, max 4 users)
- Input: User selector showing only users the current user follows
- Display: Selected users shown as avatars with names
- Validation: Backend validates author follows all tagged users
- Notification: Tagged users receive notification when post is created

**Media:**

- `media`: Array of media objects (optional, max 4 items)
- Format: `{ type: 'image' | 'video', url: string, thumbnail?: string }`
- Upload: Images and videos via `POST /api/upload/media`
- Max file size: 50MB per file
- Display: Media preview grid, can reorder or remove before posting
- Storage: Supabase Storage, URLs returned after upload

**Post Type:**

- `type`: 'note' (fixed value, set automatically)

**Complete Note Payload:**

```typescript
{
  title: string; // required, max 100 chars
  description: string; // required, min 10, max 5000 chars
  tags?: string[]; // optional, max 10, displayed with # prefix
  taggedUsers?: string[]; // optional, max 4 user IDs
  media?: Array<{ type: 'image' | 'video', url: string, thumbnail?: string }>; // optional, max 4
  type: 'note'; // fixed
}
```

### Technical Considerations

- **State Management:** Zustand store (`create-note-draft`) auto-saves draft on field changes (debounced 500ms)
- **Draft Persistence:** Zustand Store for text, IndexedDB for large media files
- **Form Validation:** Zod schema validates all fields client-side before submission
- **Tag Autocomplete:** Debounced search (300ms) against `GET /api/metadata` tags, shows suggestions dropdown
- **User Tagging:**
  - Fetch followed users via `GET /api/users/metadata?type=following&search=X`
  - Search filters by name/username in real-time
  - Selected users displayed as chips with remove option
- **Media Upload:**
  - Upload files first via `POST /api/upload/media`
  - Show upload progress for each file
  - Store returned URLs in draft state
  - Preview images/videos before posting
  - Allow reordering via drag-and-drop
- **Post Creation:**
  - Submit via `POST /api/posts/note` with all data
  - Optimistic update: Show post immediately, rollback on error
  - Invalidate home feed queries to show new post
  - Redirect to home feed or show success message
- **Real-time:** Socket.IO emits `post:new` event to followers
- **Error Handling:** Field-level validation errors, network errors with retry option
- **Accessibility:** Proper form labels, keyboard navigation, focus management

---

## Feature 2: Create Collaboration Request

### Functionality

Create and share Collaboration Request posts to find musicians for projects, bands, or services. Requests include genre matching, location, and paid opportunity indicators to help musicians find relevant opportunities.

**Tab:** Request

**Form Components:**

1. **Title Field** - Text input for request title
2. **Description Field** - Textarea for detailed request description
3. **Location Field** - Autocomplete input for location
4. **Add Genres Button** - Opens genre selector modal
5. **Paid Opportunity Toggle** - Boolean toggle for paid opportunities
6. **Add People Button** - Opens user tagging selector
7. **Add Media Button** - Opens media upload interface
8. **Post Button** - Submits the request

**User Flow:**

1. User navigates to `/create` and switches to Request tab
2. User enters title and description
3. Optionally adds location, genres, toggles paid opportunity
4. Optionally mentions users or uploads media
5. Clicks "Post" button to publish
6. Request is created and user is redirected or shown success message

### Data Requirements

**Title:**

- `title`: string (required, max 100 chars)
- Input: Single-line text input
- Placeholder: "Write a title..."
- Validation: Required, max length enforced, trim whitespace

**Description:**

- `description`: string (required, min 10, max 5000 chars)
- Input: Multi-line textarea (expands as user types)
- Placeholder: "Write a description..."
- Validation: Required, min 10 chars, max 5000 chars
- Character counter: Shows remaining characters (5000 - current length)

**Location:**

- `location`: string (optional, max 100 chars, format: "City, Country")
- Input: Autocomplete text input with suggestions from metadata
- Placeholder: "Enter location..." or "City, Country"
- Validation: Format validation, max length
- Freeform entry: Users can enter locations not in metadata
- Backend: Creates new location entries if they don't exist

**Genres:**

- `genres`: Array of genre strings (optional, max 10 items, freeform)
- Input: Genre selector with autocomplete from metadata
- Display: Genres shown without # prefix (e.g., "Indie", "Pop", "Rock")
- Storage: Genre names stored as-is in database
- Freeform entry: Users can create new genres not in metadata
- Backend: Creates new genre entries if they don't exist

**Paid Opportunity:**

- `paidOpportunity`: boolean (default: false)
- Input: Toggle switch or checkbox
- Display: Visual indicator (badge/icon) on published request
- Purpose: Helps musicians identify paid opportunities

**Tagged Users:**

- `taggedUsers`: Array of user IDs (optional, max 4 users)
- Input: User selector showing only users the current user follows
- Display: Selected users shown as avatars with names
- Validation: Backend validates author follows all tagged users
- Notification: Tagged users receive notification when request is created

**Media:**

- `media`: Array of media objects (optional, max 4 items)
- Format: `{ type: 'image' | 'video', url: string, thumbnail?: string }`
- Upload: Images and videos via `POST /api/upload/media`
- Max file size: 50MB per file
- Display: Media preview grid, can reorder or remove before posting
- Storage: Supabase Storage, URLs returned after upload

**Post Type:**

- `type`: 'request' (fixed value, set automatically)

**Complete Request Payload:**

```typescript
{
  title: string; // required, max 100 chars
  description: string; // required, min 10, max 5000 chars
  location?: string; // optional, max 100 chars, "City, Country" format
  genres?: string[]; // optional, max 10, displayed without # prefix
  paidOpportunity?: boolean; // optional, default false
  taggedUsers?: string[]; // optional, max 4 user IDs
  media?: Array<{ type: 'image' | 'video', url: string, thumbnail?: string }>; // optional, max 4
  type: 'request'; // fixed
}
```

### Technical Considerations

- **State Management:** Zustand store (`create-request-draft`) auto-saves draft on field changes (debounced 500ms)
- **Draft Persistence:** LocalStorage for text, IndexedDB for large media files
- **Form Validation:** Zod schema validates all fields client-side before submission
- **Location Autocomplete:** Debounced search (300ms) against `GET /api/metadata` locations, shows suggestions dropdown
- **Genre Autocomplete:** Debounced search (300ms) against `GET /api/metadata` genres, shows suggestions dropdown
- **Paid Opportunity Toggle:** Boolean state, visual indicator on form and published request
- **User Tagging:**
  - Fetch followed users via `GET /api/users/metadata?type=following&search=X`
  - Search filters by name/username in real-time
  - Selected users displayed as chips with remove option
- **Media Upload:**
  - Upload files first via `POST /api/upload/media`
  - Show upload progress for each file
  - Store returned URLs in draft state
  - Preview images/videos before posting
  - Allow reordering via drag-and-drop
- **Post Creation:**
  - Submit via `POST /api/posts/request` with all data
  - Optimistic update: Show request immediately, rollback on error
  - Invalidate home feed and collaboration requests queries
  - Redirect to home feed or show success message
- **Real-time:** Socket.IO emits `post:new` event to followers
- **Error Handling:** Field-level validation errors, network errors with retry option
- **Accessibility:** Proper form labels, keyboard navigation, focus management

---

## Shared Components & Systems

### Tab Navigation

**Tab Bar:**

- Visual indicator showing active tab (Note or Request)
- Story tab visible but disabled/ignored (not part of MVP)
- Click to switch between Note and Request tabs
- Active tab highlighted with theme color
- Preserves draft state when switching tabs

### Tag People Selector

**Functionality:**

- Opens modal/overlay with searchable list of followed users
- Search filters users by name or username in real-time
- Selected users displayed as chips with avatars
- Max 4 users can be selected
- Remove button on each chip to deselect
- "Add people" button shows count of selected users

**Data:**

- Fetched via `GET /api/users/metadata?type=following&search=X`
- Returns: `[{ id, firstName, lastName, avatarUrl, username }, ...]`
- Only users the current user follows are shown
- Backend validates all tagged users are followed before post creation

### Media Upload Component

**Functionality:**

- Opens file picker (images and videos)
- Supports multiple file selection (up to 4 total)
- Shows upload progress for each file
- Displays preview grid of uploaded media
- Allows reordering via drag-and-drop
- Remove button on each media item
- Max file size: 50MB per file

**Upload Process:**

1. User selects files
2. Files uploaded via `POST /api/upload/media` (multipart/form-data)
3. Returns: `{ url: string, thumbnail_url?: string, type: 'image' | 'video' }`
4. URLs stored in draft state
5. Preview shown in media grid
6. URLs included in post payload on submission

**Storage:**

- Supabase Storage (posts bucket)
- Images: Stored as-is
- Videos: Stored with optional thumbnail generation

### Tag/Genre Selector

**Functionality:**

- Opens modal/overlay with searchable list
- For Notes: Shows tags with # prefix
- For Requests: Shows genres without # prefix
- Autocomplete from metadata
- Freeform entry allowed (create new tags/genres)
- Selected items displayed as chips
- Max 10 tags/genres can be selected
- Remove button on each chip

**Data:**

- Tags/Genres fetched via `GET /api/metadata`
- Cached in Zustand store (staleTime: Infinity)
- Real-time search filters suggestions
- Backend creates new entries if they don't exist

### Metadata System

**Endpoint:** `GET /api/metadata`

**Response:**

```typescript
{
  tags: string[]; // For Note posts
  genres: string[]; // For Request posts
  locations: string[]; // For Request posts
}
```

**Caching:**

- Fetched once on app load
- Cached in Zustand store with `staleTime: Infinity`
- Refreshed only on app restart or manual refresh

**Display Rules:**

- Tags: Displayed with # prefix in UI (e.g., "#tutorial"), stored without prefix in database
- Genres: Displayed without # prefix (e.g., "Indie"), stored as-is
- Locations: Format "City, Country", stored as-is

---

## Edge Cases

### Create Note

- **Empty title:** Show validation error, prevent submission
- **Description too short:** Show validation error with min length requirement
- **Description too long:** Show character counter, prevent exceeding max
- **Tag limit exceeded:** Show error when trying to add 11th tag
- **User tagging limit exceeded:** Show error when trying to add 5th user
- **Media limit exceeded:** Show error when trying to add 5th media item
- **Media upload fails:** Show error, allow retry, don't clear selected files
- **Network error on post:** Show error with retry option, preserve draft
- **User not following tagged user:** Backend validation fails, show error message
- **Draft recovery:** On page load, check for draft, offer to restore
- **Tab switch with unsaved changes:** Show confirmation dialog
- **Browser refresh:** Restore draft from LocalStorage/IndexedDB

### Create Request

- **Empty title:** Show validation error, prevent submission
- **Description too short:** Show validation error with min length requirement
- **Description too long:** Show character counter, prevent exceeding max
- **Invalid location format:** Show format hint, validate on blur
- **Genre limit exceeded:** Show error when trying to add 11th genre
- **User tagging limit exceeded:** Show error when trying to add 5th user
- **Media limit exceeded:** Show error when trying to add 5th media item
- **Media upload fails:** Show error, allow retry, don't clear selected files
- **Network error on post:** Show error with retry option, preserve draft
- **User not following tagged user:** Backend validation fails, show error message
- **Draft recovery:** On page load, check for draft, offer to restore
- **Tab switch with unsaved changes:** Show confirmation dialog
- **Browser refresh:** Restore draft from LocalStorage/IndexedDB
- **Location autocomplete fails:** Allow manual entry, validate format

### Shared Components

- **Metadata fetch fails:** Show error, allow manual entry for tags/genres/locations
- **User search fails:** Show error, allow manual user selection if needed
- **Media file too large:** Show error before upload, validate file size
- **Unsupported file type:** Show error, validate file type before upload
- **Network offline:** Show offline indicator, queue uploads for when online

---

## Database Schema (PostgreSQL via Supabase)

### Posts Table

- `id`: UUID (primary key)
- `type`: enum ('note', 'request', 'story')
- `title`: text (required)
- `description`: text (required)
- `author_id`: UUID (foreign key → users.id)
- `location`: text (nullable, only for request type)
- `paid_opportunity`: boolean (default false, only for request type)
- `created_at`: timestamp with timezone (auto-generated)
- `updated_at`: timestamp with timezone (auto-generated)

### Supporting Tables

- `tags`: `id` (UUID), `name` (text, unique)
- `genres`: `id` (UUID), `name` (text, unique)
- `media`: `id` (UUID), `url` (text), `thumbnail_url` (text), `type` (enum: 'image', 'video')

### Junction Tables

- `post_media`: `post_id`, `media_id`, `order` (integer)
- `post_tags`: `post_id`, `tag_id` (only for Note type)
- `post_genres`: `post_id`, `genre_id` (only for Request type)
- `post_tagged_users`: `post_id`, `user_id` (max 4 per post, enforced in backend)

### Indexes

- `posts.type`, `posts.author_id`, `posts.created_at`, `post_genres.genre_id`

---

## Seeding Data

Returned via `GET /api/metadata` endpoint.

### Tags (for Note)

question, tutorial, music-theory, recording, equipment, concert, collaboration, mixing, mastering, production, songwriter, vocalist, guitarist, drummer, bassist, etc.

**Note:** Tags displayed with # prefix in UI, stored without in database

### Genres (for Request)

Indie, Pop, Rock, Hip-Hop, Electronic, Jazz, Folk, R&B, Metal, Classical, Alternative, Punk, Blues, Country, Soul, Funk, Reggae, etc.

### Locations (for Request)

Copenhagen, Denmark; Aarhus, Denmark; Oslo, Norway; Stockholm, Sweden; Helsinki, Finland; Gothenburg, Sweden; Bergen, Norway; Malmö, Sweden; Tampere, Finland; etc.

**Format:** "City, Country"
