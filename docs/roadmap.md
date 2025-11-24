# LineUp MVP Development Roadmap

**Version:** 1.0

**Last Updated:** November 24, 2025

## Overview

This roadmap follows a vertical slice approach - each phase delivers a working feature end-to-end that users can use. Build complete features (backend + frontend + testing) before moving to the next.

## Phase 1: Foundation & Core Loop

**Goal:** Users can sign up, create a profile, post content, and view feed

**Deliverable:** Basic working app with authentication, profiles, and posts

### Setup & Infrastructure

- Set up Node/Express server
- Configure Supabase connection
- Set up Next.js project structure
- Configure Supabase Auth client
- Set up TanStack Query + Zustand stores
- Database migration: Run existing schema + story_views table

### Authentication & Onboarding

**Backend**

- Auth middleware setup
- Endpoints:
  - GET /api/metadata - Get tags/genres/locations

**Frontend**

- Login page
- Signup page
- Onboarding flow (multi-step):
  - Splash screen
  - Concept slider
  - User type selection
  - Basic info form
  - Interests selector
  - Genres selector

**Testing**

- Test signup → onboarding → completion flow
- Add loading states and error handling

### Profile System

**Backend**

- Endpoints:
  - GET /api/users/:username - View profile
  - PATCH /api/users/:username - Update profile

**Frontend**

- Profile page:
  - Profile header (avatar, stats, actions)
  - Profile tabs (posts, reviews, collaborations)
- Profile edit page:
  - Basic info modal
  - Interests modal
  - Genres modal
  - Social links modal
  - FAQ modal
- User card component (for lists/search)

**Testing**

- Test profile viewing (own + others)
- Test profile editing
- Test profile navigation

### Post Creation & Viewing

**Backend**

- Endpoints:
  - POST /api/posts - Create note/request
  - GET /api/posts - List posts
  - GET /api/posts/:id - Get single post
  - POST /api/upload - Upload media

**Frontend**

- Create page:
  - Tab navigation (Note/Request)
  - Note form (title, description, tags)
  - Request form (title, description, genres, location, paid toggle)
  - Tag selector modal
  - User tagging modal
  - Media uploader
  - Media preview
- Post components:
  - Post card (for feed)
  - Post detail page
  - Media grid
  - Tagged users display
- Draft auto-save (Zustand + IndexedDB)

**Testing**

- Test create note → publish flow
- Test create request → publish flow
- Test media upload
- Test draft saving/recovery

### Feed & Basic Engagement

**Backend**

- Endpoints:
  - GET /api/feed - Home feed (stories, recommendations, posts)
  - POST /api/posts/:postId/engage - Like/bookmark/comment

**Frontend**

- Home page:
  - Story container (horizontal scroll) - empty state for now
  - Recommendations section
  - Feed with infinite scroll
  - Post engagement bar (like, comment, bookmark)
- Engagement components:
  - Like button with animation
  - Bookmark button
  - Comment form
- Empty states

**Testing**

- Test feed loading and infinite scroll
- Test engagement actions (optimistic updates)
- Test like/bookmark/comment flows

### Search

**Backend**

- Endpoints:
  - GET /api/search - Search users/posts/tags

**Frontend**

- Search page:
  - Search bar with debounce
  - Search tabs (For You, People, Collaborations, Tags)
  - Search results with filters
  - Search user card
  - Search post card
- Search filters modal

**Testing**

- Test search across all tabs
- Test debouncing
- Test filters

### Navigation & Layout

**Frontend**

- Root layout
- Main layout with:
  - Header (logo, search, notifications badge, profile)
  - Bottom navigation (Home, Search, Create, Messages, Profile)
  - Sidebar (desktop)
- Loading states
- Error boundaries
- 404 page

## Phase 2: Social & Connections

**Goal:** Users can connect and interact with each other

**Deliverable:** Full social networking features with notifications

### Connections System

**Backend**

- Endpoints:
  - POST /api/connections - Send/accept/reject/cancel/remove
  - GET /api/users/metadata - Get connections/pending lists
  - POST /api/users/:username/block - Block/unblock users

**Frontend**

- Connection button component (shows correct state)
- Connection request modal
- Connections list page
- Pending requests list
- Blocked users list
- Update search to show connection status
- Update profile header with connection actions

**Testing**

- Test send request flow
- Test accept/reject flows
- Test cancel request
- Test remove connection
- Test blocking

### Notifications System

**Backend**

- Set up Socket.IO server
- Implement notification triggers (database functions)
- Endpoints:
  - GET /api/notifications - Get notifications
  - PATCH /api/notifications/:id - Mark read/unread
- WebSocket events:
  - New connection request
  - Connection accepted
  - Post liked
  - Post commented
  - Tagged in post
  - New follower (if implemented)

**Frontend**

- Notification components:
  - Notification badge (header)
  - Notification dropdown
  - Notification list page
  - Notification item component
- Socket.IO client setup
- Real-time notification updates
- Toast notifications for actions

**Testing**

- Test notifications for all trigger types
- Test real-time updates
- Test notification badge count
- Test mark as read

### Comments System

**Backend**

- Endpoints:
  - GET /api/posts/:id/comments - List comments
  - PATCH /api/posts/:postId/comments/:commentId - Edit comment
  - DELETE /api/posts/:postId/comments/:commentId - Delete comment

**Frontend**

- Comments section (expandable)
- Comment item component
- Comment form
- Comment editing inline
- Comment deletion with confirmation
- Comment notifications

**Testing**

- Test comment creation
- Test comment editing
- Test comment deletion
- Test comment pagination

### Bookmarks

**Backend**

- Endpoints:
  - GET /api/bookmarks - List bookmarked posts

**Frontend**

- Bookmarks page
- Bookmark indicator on posts
- Empty state for bookmarks

**Testing**

- Test bookmark/unbookmark flow
- Test bookmarks page

## Phase 3: Messaging & Stories

**Goal:** Users can message each other and share stories

**Deliverable:** Complete communication features

### Basic Messaging

**Backend**

- Endpoints:
  - POST /api/conversations - Start conversation (DM or group)
  - GET /api/conversations - List conversations
  - GET /api/conversations/:id/messages - Get messages
  - POST /api/conversations/:id/messages - Send message
- Real-time messaging via Socket.IO
- Read receipts logic
- Typing indicators logic

**Frontend**

- Messages page:
  - Conversations list
  - Conversation item (with last message, unread count)
- Chat page:
  - Chat header
  - Message list (infinite scroll up)
  - Message bubble component
  - Message input
  - Typing indicator
- Real-time message updates
- Read receipts display
- Message timestamps

**Testing**

- Test send/receive messages
- Test real-time updates
- Test read receipts
- Test typing indicators
- Test multiple conversations

### Advanced Messaging

**Backend**

- Endpoints:
  - PATCH /api/conversations/:id - Update name/mute/pin
  - PATCH /api/conversations/:id/messages/:messageId - Edit message
  - DELETE /api/conversations/:id/messages/:messageId - Delete message
  - POST /api/conversations/:id/participants - Add to group
  - DELETE /api/conversations/:id/participants/:userId - Remove from group
  - DELETE /api/conversations/:id - Delete/leave conversation

**Frontend**

- Message editing (text only, 15-min window)
- Message deletion (with placeholder)
- Group chat features:
  - Create group modal
  - Add participants modal
  - Group settings modal
  - Participant list
  - Leave group confirmation
- Conversation settings:
  - Mute toggle
  - Pin toggle
  - Delete conversation
- Media sharing in messages:
  - Image picker
  - Video picker
  - Media preview
- Voice message:
  - Voice recorder component
  - Voice playback

**Testing**

- Test message editing
- Test message deletion
- Test group creation
- Test add/remove participants
- Test conversation settings
- Test media messages
- Test voice messages

### Stories

**Backend**

- Endpoints:
  - POST /api/posts/:storyId/view - Mark story viewed
  - GET /api/posts/:storyId/viewers - Get viewers
- Story expiration logic (24h cleanup)
- Update feed endpoint to include stories

**Frontend**

- Story creation (reuse post creation, type='story')
- Story container (horizontal scroll in feed):
  - Story item with avatar ring
  - Active story indicator
  - Story count badge
- Story viewer (fullscreen):
  - Auto-advance (5 seconds per story)
  - Manual navigation (tap sides)
  - Progress bars
  - Story info overlay
  - Close button
  - View count (for own stories)
- Story viewers modal (analytics)
- Story notifications

**Testing**

- Test story creation
- Test story viewing
- Test story navigation
- Test story expiration
- Test viewers list

## Phase 4: Portfolio & Polish

**Goal:** Complete profile features and polish the app

**Deliverable:** Production-ready MVP

### Reviews System

**Backend**

- Endpoints:
  - GET /api/users/:username/reviews - List reviews
  - POST /api/users/:username/reviews - Write review
  - PATCH /api/reviews/:id - Edit review
  - DELETE /api/reviews/:id - Delete review

**Frontend**

- Reviews tab on profile
- Review list component
- Write review modal:
  - Star rating component
  - Review text area
  - Link to collaboration (optional)
- Review item component
- Edit review modal
- Delete review confirmation

**Testing**

- Test review creation
- Test review editing
- Test review deletion
- Test review display on profile

### Collaborations System

**Backend**

- Endpoints:
  - GET /api/users/:username/collaborations - List collaborations
  - POST /api/collaborations - Create collaboration
  - PATCH /api/collaborations/:id - Update collaboration
  - DELETE /api/collaborations/:id - Delete collaboration

**Frontend**

- Collaborations tab on profile
- Collaboration card component
- Add collaboration modal:
  - Title input
  - Description textarea
  - Participant selector
  - Date pickers (start/end)
  - Media upload
- Edit collaboration modal
- Delete collaboration confirmation

**Testing**

- Test collaboration creation
- Test collaboration editing
- Test collaboration deletion
- Test collaboration display

### Content Management

**Backend**

- Endpoints:
  - PATCH /api/posts/:id - Edit post
  - DELETE /api/posts/:id - Delete post
  - DELETE /api/media/:id - Delete media
  - DELETE /api/notifications/:id - Delete notification

**Frontend**

- Post editing:
  - Edit post modal/page
  - Update tags/media/content
- Post deletion:
  - Delete confirmation modal
  - Remove from cache
- Media management:
  - Delete unused media
- Notification management:
  - Delete single notification
  - Mark all as read button

**Testing**

- Test post editing
- Test post deletion
- Test media deletion
- Test notification management

### Optimization & Polish

**Backend**

- Database query optimization
- Add database indexes (if missing)
- API response time monitoring
- Error logging setup

**Frontend**

- Code splitting optimization
- Image optimization (Next.js Image)
- Bundle size analysis
- Add skeleton loaders everywhere
- Add empty states everywhere
- Add error states everywhere
- Improve animations/transitions
- Accessibility audit (ARIA labels, keyboard navigation)
- Mobile responsiveness check
- Cross-browser testing

**Testing**

- End-to-end testing (Playwright/Cypress)
- Performance testing (Lighthouse)
- Load testing (database queries)
- Security audit (SQL injection, XSS, CSRF)

### Deployment

**Infrastructure**

- Set up production environment
- Configure environment variables
- Deploy backend (Render/Railway/Fly.io)
- Deploy frontend (Vercel)
- Configure CDN for media (Supabase Storage)
- Set up monitoring (Sentry)
- Set up analytics (Plausible/PostHog)
- Configure CI/CD pipeline

**Final Checks**

- Test all features in production
- Verify all API endpoints work
- Test real-time features in production
- Verify media uploads work
- Check mobile responsiveness
- Final bug fixes

## Development Principles

- **Vertical Slices:** Build complete features end-to-end before moving to next
- **Ship Often:** Deploy to staging frequently for testing
- **Test As You Go:** Don't leave testing for the end
- **Mobile-First:** Design and build for mobile, enhance for desktop
- **Performance Matters:** Monitor bundle size and query performance from day 1
- **User Feedback:** Gather feedback early and iterate
