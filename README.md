# LineUp - Projekt Dokumentation

## 1. Link(s) til den deployede løsning

Indsæt links til deployet backend og frontend her.

---

## 2. Login-information til testbrugere

Indsæt login-information til testbrugere her (hvis relevant).

---

## 3. Teknisk beskrivelse af arkitektur og teknologivalg

### Arkitekturoverblik

LineUp er bygget som en full-stack applikation med en klar separation mellem backend og frontend, og følger et RESTful API arkitekturmønster.

### Backend Arkitektur

**Technology Stack:**

- **Runtime**: Node.js med Express.js 5.1.0
- **Language**: TypeScript 5.9.3
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth (JWT-baseret)
- **Storage**: Supabase Storage til media files
- **API Dokumentation**: TSOA (TypeScript OpenAPI) for automatisk generering af Swagger/OpenAPI
- **Real-time**: Socket.IO til live opdateringer (nye posts, stories, engagement ændringer)

**Arkitekturmønster:**

- RESTful API med Express.js
- Entiry-based struktur organiseret efter domæne (auth, posts, users, messages, osv.)
- Middleware-baseret authentication og CORS håndtering
- Service layer mønster med controllers, services, DTOs og mappers
- 20 API endpoints (6 offentlige, 14 autentificerede)

**Nøglebeslutninger for design:**

- TypeScript for typesikkerhed på tværs af hele backenden
- TSOA for automatisk rute-generering og API dokumentation
- Supabase til database, auth og storage for at reducere infrastruktur-kompleksitet
- Entiry-based organisering for vedligeholdelse og skalerbarhed

### Frontend Arkitektur

**Technology Stack:**

- **Framework**: Next.js 16 med App Router
- **Language**: TypeScript 5
- **State Management**:
  - TanStack Query (React Query) til server-afledt data
  - Zustand til client/session state
- **Styling**: Tailwind CSS 4 med custom CSS til brand-specifikke komponenter
- **Validering**: Zod schemaer til formularer og API kontrakter
- **UI Komponenter**: Radix UI primitiver
- **Animation**: Framer Motion
- **Backend Integration**: Dedikeret HTTP client singleton til API kommunikation

**Arkitekturmønster:**

- Feature-baseret struktur organiseret efter domæne (auth, profiles, chats, feed, osv.)
- Client-only data fetching via TanStack Query (ingen Next.js Server Actions)
- Striks "separation of concerns":
  - `components/ui/` - Rene, genbrugelige UI primitiver
  - `components/shared/` - Komponenter på tværs af features
  - `lib/features/*/components/` - Smarte, feature-specifikke komponenter
- TypeScript typer spejler backend entiteter med brug af `snake_case` for konsistens

**Nøglebeslutninger for design:**

- Next.js App Router for moderne React mønstre
- Client-only data fetching for at maksimere potentialet for genbrug af kode i React Native
- Feature-baseret organisering for bedre vedligeholdelse
- TanStack Query for effektiv server state management
- Zod for runtime validering og type inference

### Database Arkitektur

**Database**: PostgreSQL (Supabase)

**Schema Overblik:**

- **18 Database Tabeller** organiseret i:
  - Core tabeller (profiles, posts, metadata, media)
  - User profile tabeller (user_metadata, user_social_media, user_looking_for, user_faq)
  - Junction tabeller (post_media, post_metadata, post_tagged_users)
  - Social & collaboration tabeller (connection_requests, user_collaborations, user_reviews)
  - Engagement tabeller (likes, bookmarks, comments)
  - Messaging & notifications (conversations, messages, notifications)
  - Search system (recent_searches med full-text search vectors)

**Nøglefunktioner:**

- Full-text search ved brug af PostgreSQL TSVECTOR
- Row Level Security (RLS) policies for databeskyttelse
- Triggers til automatiske timestamp opdateringer og notifikationer
- ENUM typer for datakonsistens (post_type, metadata_type, media_type, osv.)
- Omfattende indeksering for performance optimering

---

## 4. Liste og beskrivelse af implementerede features

### Authentication & Onboarding

- Multi-step onboarding flow med splash screen, koncept-introduktion, oprettelse, valg af brugertype, indsamling af basisinformation og valg af mål
- Supabase Auth integration med JWT-baseret authentication
- Login og oprettelses-sider

### User Profiles

- Omfattende profilsystem med avatar, bio, lokation, tilpasning af temafarve
- Visning af profiler (egen profil og andre brugeres profiler)
- Redigering af profil med modaler til basisinfo, interesser, genrer, sociale links og FAQ
- Visning af tidligere samarbejder (tovejs relationer)
- Brugeranmeldelser og ratingsystem
- Spotify playlist integration
- Links til sociale medier
- "Looking for" præferencer (connect, promote, find-band, find-services)

### Social Feed

- Personaliseret feed der viser posts fra musikere man følger
- Understøttelse af tre post-typer:
  - **Notes**: Del tanker, spørgsmål, tutorials og musik-relateret indhold
  - **Requests**: Slå samarbejdsmuligheder op, søg efter bands eller servicebehov
  - **Stories**: Midlertidigt indhold med 24-timers levetid (ikke fuldt implementeret i MVP)
- Real-time opdateringer via Socket.IO
- Engagement features: likes, bookmarks, kommentarer

### Content Creation

- Oprettelses-side med tab-navigation (Note/Request)
- Rich text posts med medie-understøttelse (billeder/videoer)
- Tagging system til Notes
- Bruger-tagging (nævn op til 4 personer du følger)
- Genre-valg til Requests
- Automatisk gem af kladder (draft auto-save)
- Medie-upload med billedkomprimering

### Search & Discovery

- Omfattende søgesystem med tab-navigation:
  - **For You**: Personaliserede resultater der kombinerer personer og samarbejdsforespørgsler
  - **People**: Søg efter musikere på navn, brugernavn eller rolle
  - **Collaborations**: Søg efter samarbejdsforespørgsler
  - **Services**: Find serviceudbydere
  - **Tags**: Søg efter posts via tags
- Real-time søgning med autocomplete forslag
- Full-text search på tværs af brugere, posts og metadata
- Sporing af søgehistorik

### Messaging & Communication

- Direct messaging system med en-til-en chats
- Group chat understøttelse (maks 8 deltagere)
- Real-time levering af beskeder via Socket.IO
- Beskedhistorik og persistens
- Sporing af ulæste beskeder
- Mediedeling (billeder, videoer, lydfiler)
- Voice message understøttelse
- Chat-baseret samarbejdsflow (se sektion 6 for detaljer)

### Connections & Networking

- LinkedIn-stil forbindelsessystem (gensidige forbindelser)
- Follow/unfollow funktionalitet
- Forbindelsesanmodninger med status (pending/accepted/rejected)
- Se hvem der følger hvem
- Blokering af brugere

### Collaboration System

- Samarbejdsforespørgsler (posts)
- Filtrering på genre, lokation og betalte muligheder
- Tag relevante musikere i forespørgsler
- Sporing af tidligere samarbejder på profiler
- System til løsning og arkivering af forespørgsler (se sektion 6 for detaljer)

### Notifications

- Real-time notifikationssystem
- WebSocket-kompatible notifikationer
- Notifikationstyper: likes, comments, tags, connection requests, messages

### Media Management

- Upload af billeder og videoer
- Medie-lagring via Supabase Storage
- Generering af thumbnails til videoer
- Tilknytning af medier til posts

**Note**: Information om primær ansvarlig udvikler bør tilføjes for hver feature hvor relevant.

---

## 5. Kendte fejl eller manglende features

### Manglende Features (Ikke en del af MVP scope)

- **Hent alle kunstnere fra Spotify** (Fetch all artists from Spotify)
- **Stories**: Midlertidigt indhold med 24-timers levetid er ikke fuldt implementeret (nævnt i Sektion 4)
- **Pro/Upgrade System**: "Get Pro lineUp" feature er ikke implementeret
- **Insights/Analytics**: Brugeranalyse og insights side er ikke implementeret
- **Invite Friends**: System til at invitere venner er ikke implementeret
- **App Store Rating**: "Rate the app" funktionalitet er ikke implementeret
- **Detaljeret Indstillingsside**: Avanceret indstillingsside er ikke implementeret
- **Hjælpeside**: Hjælp/support side er ikke implementeret
- **Rapporter Bruger**: Funktionalitet til at rapportere brugere er ikke implementeret
- **Spotify Playlist Integration**: Selvom Spotify playlist URL gemmes, kan den fulde integration og visning kræve justeringer

### Kendte Fejl

Ingen på nuværende tidspunkt. Alle kerne MVP-features er funktionelle.

---

## 6. Ekstra features eller innovationer udover kravene

### Kombineret Services Tab

Vi traf en designbeslutning om at kombinere Services-fanen, så den viser både samarbejder (collaborations) og services i én samlet visning. Dette skaber en mere flydende navigationsoplevelse, da fanen i det oprindelige design ville erstatte "home" når man navigerede til "collabs", hvilket gjorde det umuligt at navigere tilbage til home feedet fra den visning. Ved at kombinere services og collaborations bevarer vi en konsistent navigation samtidig med at vi giver adgang til begge typer indhold.

### Forbedret Chat-baseret Samarbejdsflow

Vi har forbedret og tydeliggjort samarbejdsflowet baseret på forespørgsler (requests). Når en bruger (OP) opretter en samarbejdsforespørgsel, kan andre brugere åbne en chat direkte baseret på den forespørgsel. I denne chat kan brugerne diskutere og planlægge, om de ønsker at gå videre med samarbejdet. Hvis de beslutter sig for at fortsætte, kan OP klikke på "resolve", hvilket:

- Tilføjer et "resolved" tag til request-posten
- Arkiverer forespørgslen så den ikke længere er synlig i hovedfeedet
- Den løste forespørgsel kan stadig findes på profiler/posts hvor brugere kan se deres egne posts
- Dette skaber et klart workflow fra opdagelse → diskussion → løsning for samarbejdsforespørgsler

Denne innovation gør samarbejdsprocessen mere strømlinet og giver en klar vej fra at finde en mulighed til at udføre den.

---

## 7. Designbeslutninger der supplerer eller afviger fra Figma Design

### Kombineret Services Tab Navigation

**Beslutning**: Kombinerede Services-fanen til at vise både collaborations og services sammen, i stedet for at have separate faner der erstatter home-fanen.

**Begrundelse**: I det oprindelige Figma design ville navigation til "collabs" erstatte "home"-fanen, hvilket skabte en blindgyde for navigation, hvor brugere ikke kunne vende tilbage til home feedet. Ved at kombinere services og collaborations i en enkelt fane opretholder vi en konsistent navigationsstruktur og sikrer, at brugere altid kan tilgå home feedet.

### Forbedret Chat-baseret Request Resolution Flow

**Beslutning**: Implementerede et mere eksplicit flow for oprettelse af chats baseret på samarbejdsforespørgsler, med en "resolve" handling der arkiverer løste forespørgsler.

**Begrundelse**: Det oprindelige design viste ikke klart, hvordan brugere ville overgå fra at se en forespørgsel til at diskutere den og derefter markere den som fuldført. Vores implementering tilføjer:

- Direkte oprettelse af chat fra request posts
- Klar diskussionsfase i chatten
- Eksplicit "resolve" handling for OP
- Automatisk arkivering af løste forespørgsler
- Synlighed af løste forespørgsler kun på brugerens egen profil/posts

Dette skaber et mere intuitivt og komplet samarbejds-workflow, der guider brugerne gennem hele processen fra opdagelse til færdiggørelse.

---

## 8. Link til primært Project Board

## https://app.clickup.com/90151900334/v/l/7-90151900334-1

## 9. Fungerende links til GitHub Eksempler

### Eksempel på GitHub Issue

Andreas' issue, løsning og PR

### Eksempel på Pull Request

Andreas' issue, løsning og PR

---

## 10. Database Struktur Diagram og Data Modeling Beskrivelse

### Database Overblik

LineUp bruger PostgreSQL (via Supabase) med 18 tabeller organiseret i logiske grupper:

**Core Tabeller:**

- `profiles` - Udvider Supabase Auth med brugerprofil-data (username, name, avatar, bio, location, theme_color, osv.)
- `posts` - Alle post-typer (Notes, Requests, Stories) med title, description, author, location, metadata
- `metadata` - Samlede tags, genrer og kunstnere
- `media` - Uploadede billeder og videoer med URL'er og thumbnails

**User Profile Tabeller:**

- `user_looking_for` - Hvad brugere søger (connect, promote, find-band, find-services)
- `user_metadata` - Linker brugere til genrer og kunstnere
- `user_social_media` - Links til sociale medie profiler
- `faq_questions` - Prædefinerede spørgsmål brugere kan besvare
- `user_faq` - Brugeres svar på FAQ spørgsmål

**Junction Tabeller:**

- `post_media` - Linker posts til media med visningsrækkefølge (display_order)
- `post_metadata` - Linker posts til tags/genrer
- `post_tagged_users` - Linker posts til nævnte brugere (maks 4)

**Social & Collaboration Tabeller:**

- `connection_requests` - LinkedIn-stil forbindelsessystem (pending/accepted/rejected)
- `user_collaborations` - Tidligere arbejdsrelationer (tovejs/bidirectional)
- `user_reviews` - 5-stjernet ratingsystem

**Engagement Tabeller:**

- `likes` - Post likes
- `bookmarks` - Gemte posts
- `comments` - Post kommentarer med understøttelse af svar (replies)

**Messaging & Notifications:**

- `conversations` - Direkte og gruppe samtaler (maks 8 deltagere)
- `conversation_participants` - Junction tabel for samtale-medlemmer
- `messages` - Individuelle beskeder med svar, medier, læsekvitteringer
- `message_read_receipts` - Sporing af læsestatus
- `notifications` - Polymorphic notifikationssystem (WebSocket-klar)

**Search System:**

- `recent_searches` - Brugerens søgehistorik
- Full-text search vectors (TSVECTOR) på profiler, posts og metadata
- Søgefunktioner (for_you, people, collaborations)

### Nøglebeslutninger for Data Modeling

1. **Samlet Metadata Tabel**: I stedet for separate tabeller til tags, genrer og kunstnere, bruger vi en enkelt `metadata` tabel med en `type` enum. Dette forenkler forespørgsler og giver mulighed for konsistent søgefunktionalitet.

2. **Tovejs Samarbejder (Bidirectional Collaborations)**: Tabellen `user_collaborations` gemmer tovejs-relationer, hvilket betyder, at hvis Bruger A samarbejder med Bruger B, vises begge brugere i hinandens samarbejdslister. Dette opbygger tillid og troværdighed.

3. **Polymorphic Notifications**: Notifikationstabellen bruger et polymorfisk design til at understøtte forskellige notifikationstyper (likes, comments, tags, connections, messages) i en enkelt tabel.

4. **Full-Text Search Integration**: Vi bruger PostgreSQL's TSVECTOR til fritekstsøgning, med genererede kolonner og GIN-indekser for performance. Dette giver mulighed for hurtig, relevant søgning på tværs af brugere, posts og metadata.

5. **Forbindelsessystem**: Vi implementerede et LinkedIn-stil forbindelsessystem, hvor begge brugere skal acceptere en forbindelsesanmodning, hvilket skaber gensidige forbindelser frem for envejs-følgere.

6. **Media Storage**: Mediefiler gemmes i Supabase Storage, med URL'er gemt i databasen. Denne adskillelse giver mulighed for effektiv mediehåndtering og CDN-integration.

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

### Data Modeling Overvejelser og Fortrydelser

**Overvejelser:**

- Vi valgte at bruge Supabase Auth's indbyggede `auth.users` tabel og udvide den med vores `profiles` tabel i stedet for at lave et custom auth system. Dette reducerer kompleksitet og giver indbyggede sikkerhedsfeatures.
- Den samlede metadata-tabel tilgang forenkler forespørgsler men kræver omhyggelig type-tjek i applikationskoden.
- Tovejs-samarbejder kræver omhyggelig håndtering for at sikre datakonsistens ved tilføjelse eller fjernelse af samarbejder.

**Potentielle Fortrydelser:**

- Notifikationssystemets polymorfiske design, selvom det er fleksibelt, kan blive komplekst efterhånden som flere notifikationstyper tilføjes. En mere struktureret tilgang med separate tabeller eller et bedre typesystem kunne have været en fordel.
- Søgesystemet afhænger stærkt af PostgreSQL full-text search, hvilket fungerer godt, men kan kræve yderligere søgeinfrastruktur (som Elasticsearch) hvis platformen skalerer betydeligt.
- Medielagring i Supabase Storage er praktisk, men kan kræve migrering til et CDN for bedre global performance når brugerbasen vokser.

---

## 11. Post-Mortem: Projekt Refleksion

### Hvad gik godt

**Tekniske Valg:**

- **Supabase Integration**: Brug af Supabase til database, auth og storage reducerede infrastrukturens kompleksitet betydeligt og gav os mulighed for at fokusere på at bygge features frem for at administrere infrastruktur.
- **TypeScript Overalt**: At have TypeScript på både frontend og backend gav fremragende typesikkerhed og fangede mange fejl under udviklingen.
- **Feature-Baseret Arkitektur**: Organisering af kode efter domæne/feature frem for teknisk lag gjorde kodebasen mere vedligeholdelsesvenlig og nemmere at navigere i.
- **TanStack Query**: Brug af React Query til server state management eliminerede mange almindelige data fetching bugs og gav fremragende caching og synkronisering.
- **TSOA til API Dokumentation**: Automatisk OpenAPI/Swagger generering fra TypeScript typer sikrede, at vores API dokumentation forblev synkroniseret med koden.

**Samarbejde:**

- Klar adskillelse af backend og frontend tillod teammedlemmer at arbejde parallelt uden konflikter.
- Feature-baseret organisering gjorde det nemt at identificere ejerskab og ansvar for forskellige dele af applikationen.

**Projektledelse:**

- "Vertical slice" tilgangen (bygning af komplette features end-to-end) sikrede, at vi altid havde fungerende, testbare features frem for ufærdige implementeringer.

### Hvad vi ville gøre anderledes

**Tekniske Valg:**

- **Real-time Implementering**: Selvom Socket.IO fungerer, kunne vi overveje at bruge Supabase Realtime subscriptions mere omfattende for at reducere antallet af forskellige teknologier i vores stack.
- **Test Strategi**: Vi ville implementere en mere omfattende teststrategi fra begyndelsen, inklusiv unit tests, integration tests og E2E tests. Dette ville have fanget problemer tidligere og gjort refaktorering mere sikker.
- **Fejlhåndtering**: Vi ville etablere et mere konsistent fejlhåndteringsmønster på tværs af hele applikationen tidligere i projektet.
- **State Management**: Selvom Zustand fungerer godt, kunne vi have draget fordel af en mere struktureret tilgang til global state management, potentielt ved brug af Redux Toolkit eller en mere holdningspræget løsning.

**Samarbejde:**

- **Code Reviews**: Vi ville implementere mere rigorøse code review processer tidligere for at fange problemer og dele viden på tværs af teamet.
- **Dokumentation**: Vi ville vedligeholde mere opdateret dokumentation under udviklingen frem for at dokumentere til sidst, hvilket ville have hjulpet med onboarding og vidensdeling.
- **Kommunikation**: Hyppigere stand-ups og klarere kommunikation om arkitektoniske beslutninger ville have hjulpet med at aligne teamet bedre.

**Projektledelse:**

- **Sprint Planlægning**: Vi ville implementere mere struktureret sprint planlægning med klarere mål og leverancer.
- **Feature Flags**: Implementering af feature flags tidligere ville have tilladt os at deploye ufærdige features og teste dem i produktion uden at eksponere dem for alle brugere.
- **Performance Monitoring**: Vi ville opsætte performance overvågning og error tracking (som Sentry) fra begyndelsen for at fange problemer i produktion tidligere.

**Database Design:**

- **Migrationsstrategi**: Vi ville etablere en mere formel database migrationsstrategi og review proces for at undgå schema ændringer, der krævede betydelig refaktorering.
- **Indekseringsstrategi**: Selvom vi har indekser, ville vi have draget fordel af en mere systematisk tilgang til at identificere og oprette indekser baseret på forespørgselsmønstre.

**Generelt:**

- **CI/CD Pipeline**: Opsætning af en ordentlig CI/CD pipeline tidligere ville have fanget integrationsproblemer hurtigere og gjort deployments mere pålidelige.
- **Environment Management**: Bedre adskillelse og styring af development, staging og production miljøer ville have reduceret deployment risici.

---

_LineUp - Where musicians connect, collaborate, and create._
