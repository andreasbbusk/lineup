# LineUp - Profile & Onboarding Features (MVP)

## Overview

The user profile system consists of three main flows:

- **Onboarding:** Initial user setup
- **Profile View:** Public-facing user profile with two distinct viewing experiences:
  - **Own Profile:** Shows "Edit Profile" and "Share Profile" buttons in header
  - **Other User's Profile:** Shows "Connect" and "Message" buttons in header
- **Profile Edit:** Edit interface at `/profile/edit`

All visual details are defined in Figma.

---

## Feature 1: Onboarding Flow

### Functionality

Multi-step onboarding flow shown to new users. Collects essential profile information through a guided process before user enters the main app. Each step validates input and allows navigation between steps while preserving entered data.

**Route:** `/onboarding`

**Flow:**

1. **Splash Screen** - Logo animation and welcome screen
2. **Concept slider** - 3-step content slider with simple introduction
3. **Sign Up** - Create account with different providers
4. **Type of User Selection** - Select if user is a musician (required step)
5. **Basic Information** - Collect personal details (name, phone, birth year, location)
6. **I Am Looking To** - Select goals (what they want to achieve on the platform)
7. **Completion** - Save all data and redirect to home feed

**Note:** Interests and genres are NOT collected during onboarding. They correspond to the "What I Am Looking For" section on the profile page and can be added later via the profile edit page (`/profile/edit`). The "I Am Looking To" selections from onboarding are saved to the user's profile and displayed in the profile's "What I Am Looking For" section.

**Note:** LineUp Pro subscription screen is not part of MVP and should be ignored.

**Navigation:**

- Progress indicator showing current step
- Back button to previous step (preserves data)
- Next button to proceed (validates current step)
- Skip option on optional steps

### Data Requirements

**Step 1: Splash Screen**

- No data collection
- Display: Logo animation
- Action: Auto-advance

**Step 2: Concept Slider**

- No data collection
- Display: 3-step content slider with simple introduction to LineUp
- Navigation: Swipe or button navigation between slides
- Action: "Get Started" button to proceed to sign up

**Step 3: Sign Up**

- `email`: string (required, valid email format)
- `password`: string (required, min 8 chars, must meet password requirements)
- `passwordConfirm`: string (required, must match password)
- Alternative sign-up options: Social login buttons
- Link to login: "Already have an account? Log In"

**Step 4: Type of User Selection**

- `userType`: string (required, value: 'musician')
- Options:
  - **"I am a musician"** - Selected option (enabled)
    - Description: "I am a musician looking for collaborations and services"
  - **"Not a musician"** - Disabled (no prototype available)
    - Description: "I want to provide services for musicians"

**Step 5: Basic Information**

- `firstName`: string (required, max 50 chars, trim whitespace)
- `lastName`: string (required, max 50 chars, trim whitespace)
- `phoneCountryCode`: string (required, format: "+45", "+1", etc., displayed as flag emoji)
- `phoneNumber`: number (required, validated format per country)
- `yearOfBirth`: number (required, must be 13+ years old, current year validation)
- `location`: string (required, format: "City, Country", autocomplete from metadata)

**Step 6: I Am Looking To**

- `lookingFor`: Array of strings (min 1, max 4 items)
- Values: `['connect', 'promote', 'find-band', 'find-services']`
- Display labels:
  - `connect`: "Connect to fellow musicians"
  - `promote`: "Promote my music"
  - `find-band`: "Find a band to play with"
  - `find-services`: "Find services for my music"
- Skip option available
- **Note:** These selections are saved to the user's profile and correspond to the "What I Am Looking For" section on the profile page. Interests and genres are collected separately via the profile edit page, not during onboarding.

### Technical Considerations

- **State Management:** Zustand store (`onboardingStore`) persists data across steps, survives page refresh
- **Splash Screen:** Auto-advance after 1-2 seconds, no data collection
- **Concept Slider:**
  - 3-step content slider introducing LineUp platform
  - Swipe navigation and button navigation between slides
  - No data collection, informational only
  - "Get Started" button proceeds to sign up
- **Type of User Selection:**
  - Only "I am a musician" option is enabled
  - "Not a musician" option must be visually disabled (grayed out, non-clickable)
  - Store `userType: 'musician'` in onboarding store
- **Sign Up Flow:**
  - Email validation: Real-time format validation
  - Password requirements: Display requirements, validate strength
  - Password confirmation: Real-time match validation
  - Account creation: `supabase.auth.signUp()` creates Supabase auth account
  - Social login: Optional OAuth buttons (Google, Apple, etc.)
- **Validation:** Zod schemas for each step, client-side validation before proceeding
- **Metadata Fetching:** [Insert endpoint] for locations and genres (cached in Zustand, staleTime: Infinity)
- **Phone Validation:** Country code selector with flag emoji, validation library (e.g., libphonenumber-js)
- **Location Autocomplete:** Debounced search against metadata locations, shows suggestions dropdown
- **Completion Flow:**
  1. Create auth account (if not done in sign up step)
  2. Single API call `Insert API` saves all profile data atomically (userType, firstName, lastName, phoneCountryCode, phoneNumber, yearOfBirth, location, lookingFor)
  3. Marks `onboarding_completed: true` in database
  4. Redirects to `/` (home feed)
- **Progress Indicator:** Visual progress bar showing current step
- **Error Handling:** Display validation errors inline, network errors show retry option
- **Access Control:** Middleware redirects users with `onboarding_completed: true` away from `/onboarding`

---

## Feature 2: Profile View

### Functionality

Public-facing profile page displaying comprehensive user information, content portfolio, and activity. The profile experience differs based on whether viewing your own profile or someone else's profile, with the primary difference being the header action buttons.

**Routes:**

- Own profile: `/profile` (redirects to `/profile/:username` via Server Component)
- Other users: `/profile/:username`

**Profile Layout:**

- **Header Section:** user metadata, connection & note counts, action buttons
- **Content Sections:** About Me, What I Am Looking For, Interests, Genres, media, Past Collaborations, Spotify Playlist, Artists I Enjoy, Social Media, Reviews, FAQ
- **Theme Color:** User-selected theme color applied to header background, action buttons, accent elements, and tab indicators

**Header Action Buttons:**

The header action buttons are the primary differentiator between viewing experiences:

- **Own Profile (`isOwnProfile: true`):**

  - "Edit Profile" button → Navigates to `/profile/edit`
  - "Share Profile" button → Opens share modal/dialog

- **Other User's Profile (`isOwnProfile: false`):**
  - "Connect" button → Follow/unfollow action (optimistic update)
  - "Message" button → Opens messaging interface or navigates to conversation

**Interactions:**

- Click avatar (own profile): Opens avatar upload modal
- Click stats: Navigate to filtered views (connections list, posts by type)
- Click collaborations: Navigate to their profile?
- Media: Opens video player modal

### Data Requirements

**Profile Header:**

- `id`: UUID (user ID)
- `firstName`: string
- `lastName`: string
- `avatarUrl`: string | null (Supabase Storage URL, fallback to default avatar)
- `themeColor`: string | null (hex color code, e.g., "#FF5733")
- `isOwnProfile`: boolean (determines which action buttons to show in header)
- `isFollowing`: boolean (only for other profiles, indicates if current user follows this profile - used for "Connect" button state)

**Profile Stats:**

- `connectionsCount`: number (followers count)
- `notesCount`: number (total Note posts)
- `requestsCount`: number (total Request posts)

**About Me Section:**

- `aboutMe`: string | null (max 500 chars, plain text, line breaks preserved)
- Empty state: Shows "Add a bio" CTA linking to `/profile/edit` (only on own profile)

**What I Am Looking For Section:**

- `lookingFor`: Array of strings (from onboarding selections, e.g., ["connect", "promote", "find-band", "find-services"])
- Display labels (same as onboarding):
  - `connect`: "Connect to fellow musicians"
  - `promote`: "Promote my music"
  - `find-band`: "Find a band to play with"
  - `find-services`: "Find services for my music"
- Empty state: Shows "Add preferences" CTA linking to `/profile/edit` (only on own profile)

**Interests Section:**

- `interests`: Array of strings (max 10, freeform tags, e.g., ["Band", "Jam Sessions", "New Friends"])
- Empty state: Shows "Add interests" CTA linking to `/profile/edit` (only on own profile)

**Genres Section:**

- `genres`: Array of strings (max 10, from metadata, freeform allowed, e.g., ["Indie", "Pop", "Rock"])
- Empty state: Shows "Add genres" CTA linking to `/profile/edit` (only on own profile)

**Media Section:**

- Media extracted from user's posts
- Display: Grid layout (responsive, 2-3 columns), video thumbnails?, click to play
- Empty state: Should not be there if no content

**Past Collaborations Section:**

- Fetched via metadata endpoint?
- Display: Horizontal scroll or grid, collaborator avatars and names, click navigates to their profile
- Empty state: Nothing if no content

**Spotify Connection Section:**

- Hard coded for now

**Artists I Enjoy Section:**

- Hard coded for now

**Social Media Section:**

- Hard coded for now

**Personal Reviews Section:**

- Hard coded for now

**FAQ Section:**

- Frequently asked questions where followers can ask questions
- Display: Expandable Q&A format, questions from followers, answers from profile owner
- Empty state: Shows "No questions yet" message

**Complete Profile Response:**

```typescript
{
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  location: string; // "City, Country"
  memberSince: string; // ISO date
  themeColor: string | null; // Hex color code
  aboutMe: string | null;
  interests: string[]; // ["Band", "Jam Sessions", ...]
  genres: string[]; // ["Indie", "Pop", ...]
  lookingFor: string[]; // ["connect", "promote", ...]
  spotifyPlaylistUrl: string | null; // Spotify playlist URL
  artistsEnjoyed: string[]; // ["Artist Name 1", "Artist Name 2", ...]
  socialMedia: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    // ... other platforms
  } | null;
  reviews: Array<{
    id: string;
    reviewerId: string;
    reviewerName: string;
    reviewerAvatar: string | null;
    rating: number; // 1-5 stars
    comment: string;
    createdAt: string; // ISO date
  }>;
  faq: Array<{
    id: string;
    question: string;
    answer: string | null;
    askedBy: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
    };
    createdAt: string; // ISO date
    answeredAt: string | null; // ISO date
  }>;
  isFollowing: boolean; // For other profiles
  isOwnProfile: boolean;
  stats: {
    connectionsCount: number;
    notesCount: number;
    requestsCount: number;
  }
}
```

### Technical Considerations

- **Data Fetching:** Server/page/layout Component fetches profile via `GET /api/users/:username`, passes to Client Components for interactivity
- **Profile Type Detection:** Server Component determines `isOwnProfile` by comparing current user ID with profile user ID
- **Header Button Rendering:** Conditionally render action buttons based on `isOwnProfile`:
  - Own profile: Show "Edit Profile" and "Share Profile" buttons
  - Other profile: Show "Connect" and "Message" buttons
- **Connect Button:**
  - Shows "Connect" if not following, "Connected" if following
  - Optimistic update on click, real-time sync via Socket.IO
  - Rolls back on error
- **Theme Color Application:** CSS custom properties set dynamically based on `themeColor`, applied to:
  - Profile header background
  - Action buttons (Connect, Message, Edit Profile, Share Profile)
  - Tab indicators and active states
  - Accent borders and highlights
- **Avatar Upload:** Click avatar on own profile opens modal, uploads via `POST /api/upload/avatar`, updates optimistically
- **Stats Navigation:** Click stats navigates to filtered views?
- **Collaborations Loading:** "See all" button for collaborations list
- **FAQ Interaction:** Followers can submit questions (only if following), profile owner receives notification, can answer questions
- **Caching:** TanStack Query with 5 min staleTime for profile data, invalidated on profile update or follow/unfollow
- **Performance:** Next.js Image component for avatars, lazy load sections below fold, lazy load Spotify embed
- **Accessibility:** Proper ARIA labels, keyboard navigation, focus management
- **Empty States:** Contextual CTAs based on whether viewing own profile or other user's profile

---

## Feature 3: Profile Edit

### Functionality

Profile editing interface allowing users to update their profile information. Displays fields in a card layout with inline editing. Each section shows current values with "Edit" links to modify them.

**Route:** `/profile/edit`

**Access:** Only for own profile (middleware redirects if accessing other user's edit page)

**Layout:**

- **Navigation Bar:** Back arrow, search, notifications, menu icons
- **Avatar Section:** Profile picture with "Edit picture" text below
- **Profile Details Card:** White card containing all editable fields

**Form Sections:**

1. **Avatar Upload** - Profile picture with "Edit picture" link below
2. **Name** - Text field (editable inline)
3. **Bio** - Short tagline text field (editable inline, e.g., "Singer-songwriter, guitarist")
4. **About Me** - Multi-line text area (editable inline, max 500 chars)
5. **What I Am Looking For** - Tags/chips display with "Edit" link (opens edit modal)
6. **Interests** - Tags/chips display with "Edit" link (opens edit modal)
7. **Genres** - Tags/chips display with "Edit" link (opens edit modal)
8. **Theme** - Color swatch display with "Edit" link (opens color picker)

**Note:** Personal information fields (phone, birth year, location) are not shown in the edit interface per Figma design. These are set during onboarding and may be edited through account settings.

**Actions:**

- Back arrow: Navigates back to profile
- "Edit picture": Opens avatar upload modal
- "Edit" links: Open edit modals for respective sections (Looking For, Interests, Genres, Theme)
- Inline fields: Direct editing for Name, Bio, About Me
- Auto-save: Changes saved automatically on blur/change (debounced)

### Data Requirements

**Avatar Upload:**

- File: Image file (JPG, PNG, WEBP)
- Max size: 5MB
- Dimensions: Recommended 400x400px, auto-cropped to square
- Upload endpoint: `POST /api/upload/avatar`
- Response: `{ url: string }` (Supabase Storage URL)
- Process: Click "Edit picture" opens upload modal, uploads immediately, updates optimistically
- Display: Circular avatar with "Edit picture" text below

**Name:**

- `firstName`: string (required, max 50 chars, trim whitespace)
- `lastName`: string (required, max 50 chars, trim whitespace)
- Display: Combined as "Name" field showing full name
- Input: Inline text field, editable directly in the card
- Validation: Real-time validation on blur

**Bio:**

- `bio`: string (optional, max 100 chars, short tagline)
- Display: Single line text (e.g., "Singer-songwriter, guitarist")
- Input: Inline text field, editable directly in the card
- Character counter: Shows remaining characters (100 - current length)
- **Note:** This is a short tagline separate from "About Me". If not implemented in profile view, this field may be optional or displayed as the first line of About Me.

**About Me:**

- `aboutMe`: string (optional, max 500 chars, plain text)
- Display: Multi-line text area in card
- Input: Inline text area, editable directly in the card
- Character counter: Shows remaining characters (500 - current length)
- Line breaks preserved

**What I Am Looking For:**

- `lookingFor`: Array of strings (required, min 1, max 4 items)
- Values: `['connect', 'promote', 'find-band', 'find-services']`
- Display: Tags/chips showing selected options with "Edit" link
- Display labels (same as onboarding):
  - `connect`: "Connect to fellow musicians"
  - `promote`: "Promote my music"
  - `find-band`: "Find a band to play with"
  - `find-services`: "Find services for my music"
- Input: Click "Edit" opens modal with multi-select checkboxes

**Interests:**

- `interests`: Array of strings (optional, max 10 items, freeform)
- Display: Tags/chips showing current interests (e.g., ["Band", "Jam Sessions", "New Friends"]) with "Edit" link
- Input: Click "Edit" opens modal with tag input component, suggestions from common interests
- Display in modal: Chips with remove button, add new tags

**Genres:**

- `genres`: Array of genre strings (optional, max 10, from metadata, freeform allowed)
- Display: Tags/chips showing current genres (e.g., ["Death Metal", "Rock", "Jazz"]) with "Edit" link
- Input: Click "Edit" opens modal with multi-select autocomplete, shows suggestions from `GET /api/metadata`
- Display in modal: Chips with remove button

**Theme Color:**

- `themeColor`: string | null (optional, hex color code, e.g., "#FF5733")
- Display: Small circular color swatch showing current theme color with "Edit" link
- Input: Click "Edit" opens color picker modal with preset options and custom color input
- Preview: Shows color applied to sample profile header in modal

**Update Payload:**

All fields optional (partial update supported). Each field can be updated independently:

```typescript
{
  firstName?: string;
  lastName?: string;
  bio?: string; // Short tagline (optional, may not be displayed on profile view)
  aboutMe?: string;
  interests?: string[];
  genres?: string[];
  lookingFor?: string[];
  avatarUrl?: string;
  themeColor?: string | null;
}
```

### Technical Considerations

- **Layout:** Single card layout with all fields visible, inline editing for text fields, modal editing for complex sections
- **Data Fetching:** Server Component fetches current profile data via `GET /api/users/:username`, passes to Client Component
- **Inline Editing:**
  - Name, Bio, About Me: Direct text input in card, auto-save on blur (debounced 500ms)
  - Real-time validation on blur
  - Character counters for Bio (100 chars) and About Me (500 chars)
- **Modal Editing:**
  - "Edit" links open modals for: Looking For, Interests, Genres, Theme
  - Modals contain full editing interface with save/cancel buttons
  - Changes saved on modal save, not auto-saved
- **Avatar Upload:**
  - Click "Edit picture" opens upload modal
  - Client-side image compression before upload (reduce file size)
  - Upload progress indicator
  - Preview before confirming
  - Replace old avatar in Supabase Storage if exists
  - Optimistic update on success
- **Looking For Modal:**
  - Multi-select checkboxes with labels
  - Min 1, max 4 selections required
  - Save button validates before submitting
- **Interests Modal:**
  - Tag input component with suggestions from common interests
  - Max 10 items
  - Chips with remove button
  - Add new tags by typing and pressing Enter
- **Genres Modal:**
  - Multi-select with autocomplete from `GET /api/metadata`
  - Max 10 items
  - Freeform entry allowed
  - Chips with remove button
- **Theme Color Modal:**
  - Color picker with preset options and custom color input
  - Preview shows color applied to sample profile header
  - Save applies theme color to profile
- **Auto-save:**
  - Inline fields (Name, Bio, About Me): Auto-save on blur (debounced 500ms)
  - Modal fields: Save on modal save button click
  - LocalStorage draft backup for recovery
- **Validation:**
  - Zod schema matching backend validation
  - Real-time field validation on blur for inline fields
  - Modal validation before save
- **Optimistic Updates:**
  - Avatar updates immediately on upload success
  - Inline field updates show loading state, rollback on error
  - Modal changes update after successful save
- **Error Handling:**
  - Field-level errors shown inline below fields
  - Network errors show retry option
  - Avatar upload errors show in modal with retry
  - Modal validation errors shown in modal
- **Navigation:**
  - Back arrow navigates to `/profile/:username`
- **Accessibility:**
  - Proper form labels, error announcements
  - Keyboard navigation for all fields
  - Focus management in modals
  - ARIA labels for edit links

---

## Database Schema (PostgreSQL via Supabase)

### Users Table

```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_country_code TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  year_of_birth INTEGER NOT NULL,
  location TEXT NOT NULL,
  avatar_url TEXT,
  about_me TEXT,
  looking_for TEXT[], -- ['connect', 'promote', 'find-band', 'find-services']
  theme_color TEXT, -- Hex color code
  spotify_playlist_url TEXT,
  spotify_access_token TEXT, -- Encrypted, stored securely
  spotify_refresh_token TEXT, -- Encrypted, stored securely
  social_media JSONB, -- { instagram, twitter, youtube, facebook, tiktok, ... }
  onboarding_completed BOOLEAN DEFAULT FALSE,
  username_last_changed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### User Interests (Many-to-Many)

```sql
user_interests (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interest TEXT NOT NULL,
  PRIMARY KEY (user_id, interest)
)
```

**Note:** Interests stored as simple strings, no separate interests table needed for MVP

### User Genres (Many-to-Many)

```sql
user_genres (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, genre_id)
)
```

**Note:** Uses same genres table as create features

### User Collaborations (Many-to-Many)

```sql
user_collaborations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  collaborator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, collaborator_id)
)
```

**Note:** Bidirectional relationship, both users appear in each other's collaborations

### User Artists (Many-to-Many)

```sql
user_artists (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  PRIMARY KEY (user_id, artist_name)
)
```

**Note:** Artists stored as simple strings, no separate artists table needed for MVP

### User Reviews

```sql
user_reviews (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- User being reviewed
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE, -- User writing review
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, reviewer_id) -- One review per reviewer per user
)
```

**Note:** Reviews help build professional recognition and trust

### User FAQ

```sql
user_faq (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Profile owner
  question TEXT NOT NULL,
  answer TEXT,
  asked_by_id UUID REFERENCES users(id) ON DELETE CASCADE, -- User asking question
  created_at TIMESTAMP DEFAULT NOW(),
  answered_at TIMESTAMP
)
```

**Note:** FAQ allows followers to ask questions, profile owner can answer

### Follows (Connections)

```sql
follows (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
)
```

**Note:** Unidirectional relationship, follower → following. Connections count is number of followers.

### Indexes

- `users.username` - For profile lookups (unique index)
- `users.email` - For auth lookups (unique index)
- `users.created_at` - For sorting new users
- `user_genres.genre_id` - For filtering users by genre
- `user_collaborations.user_id` - For fetching user's collaborations
- `user_reviews.user_id` - For fetching user's reviews
- `user_reviews.reviewer_id` - For fetching reviews written by a user
- `user_faq.user_id` - For fetching user's FAQ questions
- `user_faq.asked_by_id` - For fetching questions asked by a user
- `follows.following_id` - For counting connections (followers)
- `follows.follower_id` - For fetching users a person follows

### Constraints

- `username`: Unique, alphanumeric + underscores only, 3-30 chars
- `phone_country_code` + `phone_number`: Unique together (composite)
- `year_of_birth`: Must make user at least 13 years old
- `looking_for`: Array with max 4 items from enum

---

## Seeding Data

### Interests Suggestions

Band, Jam Sessions, New Friends, Studio Time, Recording, Live Gigs, Songwriting Partner, Music Producer, Session Musician

**Note:** Freeform entry allowed

### Locations & Genres

Uses same seeding data as Create features (see create-features.md)
