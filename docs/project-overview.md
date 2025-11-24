# LineUp - Project Overview

## What is LineUp?

LineUp is a social networking platform designed specifically for musicians to connect, collaborate, and share their musical journey. Think of it as a professional network for the music community, where artists can find band members, promote their work, discover collaboration opportunities, and build meaningful connections within the music industry.

---

## Core Purpose

LineUp helps musicians:

- **Connect** with fellow musicians in their area or genre (build genuine relationships)
- **Communicate** directly through real-time messaging (voice messages, media sharing, group chats)
- **Promote** their music and projects (gain visibility and recognition)
- **Find bands** to play with or join
- **Discover services** for their musical needs (producers, studios, rehearsal spaces, session musicians, etc.)
- **Share** their musical journey through posts, stories, and media
- **Collaborate** on projects and build their network (with trustworthy partners)

---

## Key Features

### 1. **Social Feed**

A personalized feed showing posts from musicians you follow, featuring:

- **Notes**: Share thoughts, questions, tutorials, and music-related content
- **Requests**: Post collaboration opportunities, band searches, or service needs
- **Stories**: Share temporary content (24-hour lifespan)
- Real-time updates via Socket.IO
- Engagement features: likes, bookmarks, comments

### 2. **Collaboration Requests**

A dedicated system for finding and posting collaboration opportunities:

- Filter by genre, location, and paid opportunities
- Tag relevant musicians
- Include media and detailed descriptions
- Simple, streamlined posting process (no overwhelming admin work)

**Note:** Collaboration Requests are posts seeking collaborators. Once musicians work together, they can add each other as "Past Collaborations" on their profiles to build credibility and showcase their working relationships.

### 3. **User Profiles**

Comprehensive musician profiles showcasing:

- Personal information (location, genres, interests)
- **Past Collaborations**: Display of musicians the user has previously worked with, showing collaborator avatars and names (bidirectional relationships - both users appear in each other's collaboration lists)
  - Builds trust and credibility by showcasing real working relationships
  - Helps other musicians identify reliable partners
  - Optional descriptions can be added to collaborations
  - Fetched and displayed on profile pages for transparency
- Post history (Notes and Requests)
- Media portfolio
- Connection stats (followers, posts count)
- "Looking for" preferences (connect, promote, find-band, find-services)
- Spotify connection with users spotify playlist
- Artists the user enjoys
- Social media
- Personal reviews (build professional recognition)
- FAQ section where followers can ask questions (foster personal connections)
- **Theme Color**: Users can choose a personalized theme color that applies to their profile header, accent colors, buttons, and other profile-specific UI elements (allows for personal branding and visual identity)
  - **Profile Header**: Theme color used as background or accent in the profile header card
  - **Action Buttons**: "Connect", "Message", and other primary action buttons use the theme color
  - **Accent Elements**: Highlights, borders, and decorative elements throughout the profile
  - **Tab Indicators**: Active tab states and navigation indicators
  - **Profile-Specific UI**: Any profile-specific UI elements that benefit from color personalization

### 4. **Content Creation**

Easy-to-use creation tools for:

- Rich text posts with media (images/videos)
- Tagging system for Notes (e.g., #tutorial, #music-theory)
- Genre selection for Requests
- User tagging (mention up to 4 people you follow)
- Draft auto-save functionality

### 5. **Search & Discovery**

A comprehensive search system with tabbed navigation for finding exactly what you need:

**Search Interface:**

- Real-time search bar with autocomplete suggestions
- Quick cancel option to exit search
- Tabbed navigation for filtered results

**Search Tabs:**

- **For You**: Personalized results combining people and collaboration requests based on your interests and network
- **People**: Search for musicians by name, username, or role (e.g., "guitarist", "vocalist")
  - User cards with avatar, name, role/title
  - Quick "Connect" button for easy networking
- **Collaborations**: Search collaboration requests
  - Preview cards with author, title, description, location, and timestamp
  - Quick access to full request details
- **Services**: Find service providers (studios, producers, rehearsal spaces, etc.)
- **Tags**: Search posts by tags (e.g., #tutorial, #music-theory, #guitarist)

**Key Features:**

- Smart search suggestions based on your network ("Someone you know")
- Filter and sort results by relevance, date, location
- Quick actions (Connect, View Profile, Read More)
- Seamless navigation between search results and full content

### 6. **Messaging & Communication**

Direct messaging system for seamless communication between musicians:

**Messages List:**

- View all conversations in one place
- Tab navigation: **Chats** (one-on-one) and **Groups** (group conversations)
- Conversation previews showing:
  - User avatar and name
  - Last message preview (truncated)
  - Timestamp of last message
- Unread message indicators (badge count)
- Search conversations
- Quick access to start new conversations

**Individual Chat Interface:**

- Real-time messaging with instant delivery
- Message bubbles with distinct styling for sent (dark) vs received (light) messages
- Date separators for message organization
- "Unread messages" divider for easy navigation
- Chat header with:
  - User profile information (avatar, name)
  - Back navigation
  - More options menu

**Message Input:**

- Text input field for typing messages
- **Plus button**: Attach media, files, or other content
- **Microphone button**: Send voice messages
- Send button for text messages
- Support for emojis and rich text

**Key Features:**

- Real-time message delivery via Socket.IO
- Message history and persistence
- Unread message tracking
- Group chat support for collaboration discussions
- Media sharing (images, videos, audio files)
- Voice message support for quick communication

### 7. **Discovery & Networking**

Powerful discovery features:

- Follow/unfollow musicians
- Search and filter by genre, location, interests
- **View Past Collaborations**: See who musicians have worked with before (helps identify trustworthy partners and build professional credibility)
- See who follows whom
- Genre-based matching for collaboration requests (fair exposure for all)
- Discover rehearsal spaces, studios, and service providers
- **Track Working Relationships**: Users can add past collaborators to their profile, creating a visible network of professional relationships

---

## User Journey

### Onboarding

New users go through a multi-step onboarding process to set up their profile:

1. Splash screen and concept introduction
2. Sign up (create account with email and password)
3. Type of user selection (musician)
4. Basic information (name, phone, birth year, location)
5. Goals selection (what they're looking for - connect, promote, find-band, find-services)
6. Profile completion

**Note:** Interests and genres are NOT collected during onboarding. They can be added later via the profile edit page.

### Daily Use

- **Home Feed**: Browse posts from followed musicians (stay connected with your network)
- **Search**: Find people, collaborations, services, and content through the comprehensive search page
- **Create**: Share Notes or post Collaboration Requests (simple, streamlined process)
- **Messages**: Communicate directly with musicians through real-time chat (build personal connections)
- **Discover**: Find new musicians and opportunities (trustworthy partners through collaboration history)
- **Profile**: Manage profile and view others' profiles (build professional credibility and personal branding with theme colors)
- **Engage**: Like, bookmark, and comment on posts (foster community connections)

---

## Technical Architecture

### Backend

- **Database**: PostgreSQL (Supabase)
- **API**: RESTful API with Express.js
- **Authentication**: Supabase Auth (JWT-based)
- **Storage**: Supabase Storage for media files
- **Real-time**: Socket.IO for live updates

### Frontend

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **State Management**: Zustand (client state), TanStack Query (server state)
- **Styling**: Tailwind CSS
- **Validation**: Zod

### Key Statistics

- **20 API Endpoints** (6 public, 14 authenticated)
- **18 Database Tables** (2 core, 4 supporting, 7 junction, 3 relationship, 2 future)
- **Real-time Events**: Post updates, new stories, engagement changes

---

## Target Audience

LineUp is designed for:

- **Musicians** of all skill levels and genres
- **Bands** looking for members or collaborations
- **Producers** and music professionals seeking talent
- **Songwriters** looking for collaborators
- **Session musicians** offering their services
- **Music enthusiasts** wanting to connect with the community

---

## Core Values

1. **Community First**: Building genuine connections within the music community
2. **Collaboration**: Making it easy to find and work with other musicians
3. **Discovery**: Helping musicians find opportunities and talent
4. **Authenticity**: Real profiles, real connections, real opportunities
5. **Accessibility**: Open to musicians at all stages of their journey
6. **Inclusivity**: Creating safe, welcoming spaces that break down industry barriers
7. **Trust**: Building reliable networks through transparency, reviews, and collaboration history

---

## What Makes LineUp Different?

- **Music-Focused**: Built specifically for musicians, not a general social network
- **Collaboration-Centric**: Features designed around finding and creating musical partnerships
- **Comprehensive Search**: Tabbed search interface for people, collaborations, services, and tags all in one place
- **Genre-Aware**: Smart matching based on musical genres and interests (ensures fair exposure)
- **Location-Based**: Connect with musicians in your area
- **Professional Network**: Track past collaborations and build your musical resume (builds credibility through visible working relationships)
- **Rich Content**: Support for media, tags, and detailed post descriptions
- **Trust-Building**: Past collaboration history (bidirectional relationships showing who musicians have worked with) and reviews help find reliable partners
- **Simple & Streamlined**: Easy-to-use tools that reduce admin work and make collaboration feel natural
- **Inclusive Community**: Designed to break down barriers and create supportive networks
- **Real-Time Communication**: Direct messaging with voice messages and media sharing for seamless collaboration
- **Personal Branding**: Customizable theme colors allow users to express their visual identity and create a unique profile experience

---

_LineUp - Where musicians connect, collaborate, and create._
