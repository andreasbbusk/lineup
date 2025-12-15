# LineUp - Project Documentation

## 1. Link(s) to the Deployed Solution

Enter deployed backend and frontend links here.

---

## 2. Login Information for Test Users

Enter login information for test users here (if relevant).

---

## 3. Technical Description of Architecture and Technology Choices

### Architecture Overview

LineUp is built as a full-stack application with a clear separation between backend and frontend, following a RESTful API architecture pattern.

### Backend Architecture

**Technology Stack:**

- **Runtime**: Node.js with Express.js 5.1.0
- **Language**: TypeScript 5.9.3
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth (JWT-based)
- **Storage**: Supabase Storage for media files
- **API Documentation**: TSOA (TypeScript OpenAPI) for automatic Swagger/OpenAPI generation
- **Real-time**: Socket.IO for live updates (post updates, new stories, engagement changes)

**Architecture Pattern:**

- RESTful API with Express.js
- Entity-based structure organized by domain (auth, posts, users, messages, etc.)
- Middleware-based authentication and CORS handling
- Service layer pattern with controllers, services, DTOs, and mappers
- 20 API endpoints (6 public, 14 authenticated)

**Key Design Decisions:**

- TypeScript for type safety across the entire backend
- TSOA for automatic route generation and API documentation
- Supabase for database, auth, and storage to reduce infrastructure complexity
- Entity-based organization for maintainability and scalability

### Frontend Architecture

**Technology Stack:**

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **State Management**:
  - TanStack Query (React Query) for server-derived data
  - Zustand for client/session state
- **Styling**: Tailwind CSS 4 with custom CSS for brand-specific components
- **Validation**: Zod schemas for forms and API contracts
- **UI Components**: Radix UI primitives
- **Animation**: Framer Motion
- **Backend Integration**: Dedicated HTTP client singleton for API communication

**Architecture Pattern:**

- Feature-based structure organized by domain (auth, profiles, chats, feed, etc.)
- Client-only data fetching via TanStack Query (no Next.js Server Actions)
- Strict separation of concerns:
  - `components/ui/` - Pure, reusable UI primitives
  - `components/shared/` - Cross-feature components
  - `lib/features/*/components/` - Smart, feature-specific components
- TypeScript types mirror backend entities using `snake_case` for consistency

**Key Design Decisions:**

- Next.js App Router for modern React patterns
- Client-only data fetching to maximize React Native code reuse potential
- Feature-based organization for better maintainability
- TanStack Query for efficient server state management
- Zod for runtime validation and type inference

### Database Architecture

**Database**: PostgreSQL (Supabase)

**Schema Overview:**

- **18 Database Tables** organized into:
  - Core tables (profiles, posts, metadata, media)
  - User profile tables (user_metadata, user_social_media, user_looking_for, user_faq)
  - Junction tables (post_media, post_metadata, post_tagged_users)
  - Social & collaboration tables (connection_requests, user_collaborations, user_reviews)
  - Engagement tables (likes, bookmarks, comments)
  - Messaging & notifications (conversations, messages, notifications)
  - Search system (recent_searches with full-text search vectors)

**Key Features:**

- Full-text search using PostgreSQL TSVECTOR
- Row Level Security (RLS) policies for data protection
- Triggers for automatic timestamp updates and notifications
- ENUM types for data consistency (post_type, metadata_type, media_type, etc.)
- Comprehensive indexing for performance optimization

---

## 4. List and Description of Implemented Features

### Authentication & Onboarding

- Multi-step onboarding flow with splash screen, concept introduction, sign up, user type selection, basic information collection, and goals selection
- Supabase Auth integration with JWT-based authentication
- Login and signup pages

### User Profiles

- Comprehensive profile system with avatar, bio, location, theme color customization
- Profile viewing (own profile and other users' profiles)
- Profile editing with modals for basic info, interests, genres, social links, and FAQ
- Past collaborations display (bidirectional relationships)
- User reviews and ratings system
- Spotify playlist integration
- Social media links
- "Looking for" preferences (connect, promote, find-band, find-services)

### Social Feed

- Personalized feed showing posts from followed musicians
- Support for three post types:
  - **Notes**: Share thoughts, questions, tutorials, and music-related content
  - **Requests**: Post collaboration opportunities, band searches, or service needs
  - **Stories**: Temporary content with 24-hour lifespan (not fully implemented in MVP)
- Real-time updates via Socket.IO
- Engagement features: likes, bookmarks, comments

### Content Creation

- Create page with tabbed navigation (Note/Request)
- Rich text posts with media support (images/videos)
- Tagging system for Notes
- User tagging (mention up to 4 people you follow)
- Genre selection for Requests
- Draft auto-save functionality
- Media upload with image compression

### Search & Discovery

- Comprehensive search system with tabbed navigation:
  - **For You**: Personalized results combining people and collaboration requests
  - **People**: Search for musicians by name, username, or role
  - **Collaborations**: Search collaboration requests
  - **Services**: Find service providers
  - **Tags**: Search posts by tags
- Real-time search with autocomplete suggestions
- Full-text search across users, posts, and metadata
- Search history tracking

### Messaging & Communication

- Direct messaging system with one-on-one chats
- Group chat support (max 8 participants)
- Real-time message delivery via Socket.IO
- Message history and persistence
- Unread message tracking
- Media sharing (images, videos, audio files)
- Voice message support
- Chat-based collaboration flow (see section 6 for details)

### Connections & Networking

- LinkedIn-style connection system (mutual connections)
- Follow/unfollow functionality
- Connection requests with pending/accepted/rejected status
- View who follows whom
- Block users functionality

### Collaboration System

- Collaboration request posts
- Filter by genre, location, and paid opportunities
- Tag relevant musicians in requests
- Past collaborations tracking on profiles
- Request resolution and archiving system (see section 6 for details)

### Notifications

- Real-time notification system
- WebSocket-compatible notifications
- Notification types: likes, comments, tags, connection requests, messages

### Media Management

- Image and video upload
- Media storage via Supabase Storage
- Thumbnail generation for videos
- Media association with posts

**Note**: Primary responsible developer information should be added for each feature where relevant.

---

## 5. Known Issues or Missing Features

Enter any known issues or missing features here.

---

## 6. Extra Features or Innovations Beyond Requirements

### Combined Services Tab

We made a design decision to combine the Services tab so it displays both collaborations and services in one unified view. This creates a smoother navigation experience, as in the original design, when navigating to "collabs", the tab would replace "home", making it impossible to navigate back to the home feed from that view. By combining services and collaborations, we maintain consistent navigation while providing access to both types of content.

### Enhanced Chat-Based Collaboration Flow

We have enhanced and clarified the collaboration flow based on requests. When a user (OP) creates a collaboration request, other users can open a chat directly based on that request. Within this chat, users can discuss and plan whether they want to proceed with the collaboration. If they decide to move forward, the OP can click "resolve", which:

- Adds a "resolved" tag to the request post
- Archives the request so it's no longer visible in the main feed
- The resolved request can still be found on profiles/posts where users can view their own posts
- This creates a clear workflow from discovery → discussion → resolution for collaboration requests

This innovation makes the collaboration process more streamlined and provides a clear path from finding an opportunity to executing it.

---

## 7. Design Decisions Supplementing or Deviating from Figma Design

### Combined Services Tab Navigation

**Decision**: Combined the Services tab to show both collaborations and services together, rather than having separate tabs that replace the home tab.

**Justification**: In the original Figma design, navigating to "collabs" would replace the "home" tab, creating a navigation dead-end where users couldn't return to the home feed. By combining services and collaborations into a single tab, we maintain consistent navigation structure and ensure users can always access the home feed.

### Enhanced Chat-Based Request Resolution Flow

**Decision**: Implemented a more explicit flow for creating chats based on collaboration requests, with a "resolve" action that archives resolved requests.

**Justification**: The original design didn't clearly show how users would transition from viewing a request to discussing it and then marking it as completed. Our implementation adds:

- Direct chat creation from request posts
- Clear discussion phase within the chat
- Explicit "resolve" action for the OP
- Automatic archiving of resolved requests
- Visibility of resolved requests only on user's own profile/posts

This creates a more intuitive and complete collaboration workflow that guides users through the entire process from discovery to completion.

---

## 8. Link to Primary Project Board

## https://app.clickup.com/90151900334/v/l/7-90151900334-1

## 9. Working Links to GitHub Examples

### Example GitHub Issue

Andreas' issue, solution and PR

### Example Pull Request

Andreas' issue, solution and PR

---

## 10. Database Structure Diagram and Data Modeling Description

### Database Overview

LineUp uses PostgreSQL (via Supabase) with 18 tables organized into logical groups:

**Core Tables:**

- `profiles` - Extends Supabase Auth with user profile data (username, name, avatar, bio, location, theme_color, etc.)
- `posts` - All post types (Notes, Requests, Stories) with title, description, author, location, metadata
- `metadata` - Consolidated tags, genres, and artists
- `media` - Uploaded images and videos with URLs and thumbnails

**User Profile Tables:**

- `user_looking_for` - What users are seeking (connect, promote, find-band, find-services)
- `user_metadata` - Links users to genres and artists
- `user_social_media` - Social media profile links
- `faq_questions` - Pre-defined questions users can answer
- `user_faq` - User answers to FAQ questions

**Junction Tables:**

- `post_media` - Links posts to media with display order
- `post_metadata` - Links posts to tags/genres
- `post_tagged_users` - Links posts to mentioned users (max 4)

**Social & Collaboration Tables:**

- `connection_requests` - LinkedIn-style connection system (pending/accepted/rejected)
- `user_collaborations` - Past work relationships (bidirectional)
- `user_reviews` - 5-star rating system

**Engagement Tables:**

- `likes` - Post likes
- `bookmarks` - Saved posts
- `comments` - Post comments with replies support

**Messaging & Notifications:**

- `conversations` - Direct and group conversations (max 8 participants)
- `conversation_participants` - Junction table for conversation members
- `messages` - Individual messages with replies, media, read receipts
- `message_read_receipts` - Read status tracking
- `notifications` - Polymorphic notification system (WebSocket-ready)

**Search System:**

- `recent_searches` - User search history
- Full-text search vectors (TSVECTOR) on profiles, posts, and metadata

### Key Data Modeling Decisions

1. **Unified Metadata Table**: Instead of separate tables for tags, genres, and artists, we use a single `metadata` table with a `type` enum. This simplifies queries and allows for consistent search functionality.

2. **Bidirectional Collaborations**: The `user_collaborations` table stores bidirectional relationships, meaning if User A collaborates with User B, both users appear in each other's collaboration lists. This builds trust and credibility.

3. **Polymorphic Notifications**: The notifications table uses a polymorphic design to support different notification types (likes, comments, tags, connections, messages) in a single table.

4. **Full-Text Search Integration**: We use PostgreSQL's TSVECTOR for full-text search, with generated columns and GIN indexes for performance. This allows for fast, relevant search across users, posts, and metadata.

5. **Connection System**: We implemented a LinkedIn-style connection system where both users must accept a connection request, creating mutual connections rather than one-way follows.

6. **Media Storage**: Media files are stored in Supabase Storage, with URLs stored in the database. This separation allows for efficient media management and CDN integration.

### Database Diagram

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
│  ├─ Contact: phone_country_code, phone_number          │
│  ├─ Preferences: theme_color, spotify_playlist_url      │
│  └─ Security: blocked_users[]                          │
│                                                         │
│  posts (Notes, Requests, Stories)                       │
│  ├─ type: 'note' | 'request' | 'story'                  │
│  ├─ content: title, description                         │
│  └─ metadata: location, paid_opportunity, expires_at   │
│                                                         │
│  metadata (tags, genres, artists)                      │
│  └─ type: 'tag' | 'genre' | 'artist'                    │
│                                                         │
│  media (images, videos)                                │
│  └─ type: 'image' | 'video'                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  USER PROFILE TABLES                    │
├─────────────────────────────────────────────────────────┤
│  user_looking_for (what users seek)                     │
│  user_metadata (genres, artists)                       │
│  user_social_media (social links)                      │
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
│              SOCIAL & COLLABORATION                      │
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

### Data Modeling Considerations and Regrets

**Considerations:**

- We chose to use Supabase Auth's built-in `auth.users` table and extend it with our `profiles` table rather than creating a custom auth system. This reduces complexity and provides built-in security features.
- The unified metadata table approach simplifies queries but requires careful type checking in application code.
- Bidirectional collaborations require careful handling to ensure data consistency when adding or removing collaborations.

**Potential Regrets:**

- The notification system's polymorphic design, while flexible, may become complex as more notification types are added. A more structured approach with separate tables or a better type system might have been beneficial.
- The search system relies heavily on PostgreSQL full-text search, which works well but may need additional search infrastructure (like Elasticsearch) if the platform scales significantly.
- Media storage in Supabase Storage is convenient but may require migration to a CDN for better global performance as the user base grows.

---

## 11. Post-Mortem: Project Reflection

### What Worked Well

**Technical Choices:**

- **Supabase Integration**: Using Supabase for database, auth, and storage significantly reduced infrastructure complexity and allowed us to focus on building features rather than managing infrastructure.
- **TypeScript Throughout**: Having TypeScript on both frontend and backend provided excellent type safety and caught many errors during development.
- **Feature-Based Architecture**: Organizing code by domain/feature rather than by technical layer made the codebase more maintainable and easier to navigate.
- **TanStack Query**: Using React Query for server state management eliminated many common data fetching bugs and provided excellent caching and synchronization.
- **TSOA for API Documentation**: Automatic OpenAPI/Swagger generation from TypeScript types ensured our API documentation stayed in sync with the code.

**Collaboration:**

- Clear separation of backend and frontend allowed team members to work in parallel without conflicts.
- Feature-based organization made it easy to identify ownership and responsibility for different parts of the application.

**Project Management:**

- The vertical slice approach (building complete features end-to-end) ensured we always had working, testable features rather than incomplete implementations.

### What We Would Do Differently

**Technical Choices:**

- **Real-time Implementation**: While Socket.IO works, we might consider using Supabase Realtime subscriptions more extensively to reduce the number of different technologies in our stack.
- **Testing Strategy**: We would implement a more comprehensive testing strategy from the beginning, including unit tests, integration tests, and E2E tests. This would have caught issues earlier and made refactoring safer.
- **Error Handling**: We would establish a more consistent error handling pattern across the entire application earlier in the project.
- **State Management**: While Zustand works well, we might have benefited from a more structured approach to global state management, potentially using Redux Toolkit or a more opinionated state management solution.

**Collaboration:**

- **Code Reviews**: We would implement more rigorous code review processes earlier to catch issues and share knowledge across the team.
- **Documentation**: We would maintain more up-to-date documentation during development rather than documenting at the end, which would have helped with onboarding and knowledge sharing.
- **Communication**: More frequent stand-ups and clearer communication about architectural decisions would have helped align the team better.

**Project Management:**

- **Sprint Planning**: We would implement more structured sprint planning with clearer goals and deliverables.
- **Feature Flags**: Implementing feature flags earlier would have allowed us to deploy incomplete features and test them in production without exposing them to all users.
- **Performance Monitoring**: We would set up performance monitoring and error tracking (like Sentry) from the beginning to catch issues in production earlier.

**Database Design:**

- **Migration Strategy**: We would establish a more formal database migration strategy and review process to avoid schema changes that required significant refactoring.
- **Indexing Strategy**: While we have indexes, we would have benefited from a more systematic approach to identifying and creating indexes based on query patterns.

**General:**

- **CI/CD Pipeline**: Setting up a proper CI/CD pipeline earlier would have caught integration issues faster and made deployments more reliable.
- **Environment Management**: Better separation and management of development, staging, and production environments would have reduced deployment risks.

---

_LineUp - Where musicians connect, collaborate, and create._
