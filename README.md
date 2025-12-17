# LineUp - Projekt Dokumentation

*Where musicians connect, collaborate, and create.*

## Table of Contents

- [1. Link(s) til den deployede løsning](#1-links-til-den-deployede-løsning)
- [2. Login-information til testbrugere](#2-login-information-til-testbrugere)
- [3. Teknisk beskrivelse af arkitektur og teknologivalg](#3-teknisk-beskrivelse-af-arkitektur-og-teknologivalg)
  - [3.1 Arkitekturoverblik](#31-arkitekturoverblik)
  - [3.2 Backend Arkitektur](#32-backend-arkitektur)
  - [3.3 Frontend Arkitektur](#33-frontend-arkitektur)
  - [3.4 Real-time og performance](#34-real-time-og-performance)
- [4. Liste og beskrivelse af implementerede features](#4-liste-og-beskrivelse-af-implementerede-features)
- [5. Kendte fejl eller manglende features](#5-kendte-fejl-eller-manglende-features)
- [6. Ekstra features eller innovationer udover kravene](#6-ekstra-features-eller-innovationer-udover-kravene)
  - [6.1 Udvidet chat funktionalitet](#61-udvidet-chat-funktionalitet)
  - [6.2 Forbedret Collaboration Flow](#62-forbedret-collaboration-flow)
  - [6.3 ConnectionsModal - Modal-baseret Forbindelsesvisning](#63-connectionsmodal---modal-baseret-forbindelsesvisning)
- [7. Designbeslutninger der supplerer eller afviger fra Figma Design](#7-designbeslutninger-der-supplerer-eller-afviger-fra-figma-design)
- [8. Link til primært Project Board](#8-link-til-primært-project-board)
- [9. Fungerende links til GitHub Eksempler](#9-fungerende-links-til-github-eksempler)
- [10. Database Struktur Diagram og Data Modeling Beskrivelse](#10-database-struktur-diagram-og-data-modeling-beskrivelse)
- [11. Post-Mortem: Projekt Refleksion](#11-post-mortem-projekt-refleksion)

---

## 1. Link(s) til den deployede løsning

- **Frontend:** https://lineup-vert.vercel.app
- **Backend:** https://lineup-o1es.onrender.com
- **API-documentation:** https://lineup-o1es.onrender.com/docs/

## 2. Login-information til testbrugere

- **Brugernavn/email:** testagain123@gmail.com
- **Password:** Test123

## 3. Teknisk beskrivelse af arkitektur og teknologivalg

### 3.1 Arkitekturoverblik

LineUp er bygget som en full-stack applikation med en klar separation mellem backend og frontend, og følger et RESTful API arkitekturmønster.

### 3.2 Backend Arkitektur

LineUp's backend er bygget med Node.js og Express.js og bruger TypeScript for type-sikkerhed. Serveren kommunikerer med en PostgreSQL database på Supabase, som også håndterer authentication via JWT-tokens og file storage i buckets.

#### Tech-stack

TSOA bruges til automatisk generering af API routes og Swagger dokumentation direkte fra TypeScript controllers og models. Request/response validering sker automatisk gennem TSOA's validering baseret på TypeScript typer og decorators på DTO'er. Authentication håndteres gennem en custom `expressAuthentication` funktion som TSOA kalder automatisk på beskyttede endpoints - denne validerer JWT tokens og understøtter både required og optional authentication.

Scheduled jobs med `node-cron` kører dagligt (kl. 02:00) for at slette læste notifikationer der er ældre end 30 dage. Backend bruger ikke Supabase Realtime direkte - i stedet subscriber frontend til database events for live opdateringer af beskeder.

#### Arkitektur og mappestruktur

Backend følger en entity-baseret arkitektur hvor koden er organiseret efter forretningsdomæner i stedet for tekniske lag. Der er 16 entities:

- `auth`
- `bookmarks`
- `collaborations`
- `comments`
- `connections`
- `conversations`
- `feed`
- `messages`
- `metadata`
- `notifications`
- `posts`
- `reviews`
- `search`
- `services`
- `upload`
- `users`

Hver entity følger en konsistent struktur:

- **Controllers:** Håndterer HTTP requests og responses, defineret med TSOA decorators
- **Services:** Indeholder forretningslogik og database queries
- **DTOs:** Data Transfer Objects til request/response validering
- **Mappers:** Konverterer mellem database modeller og API responses

Backend eksponerer 80 API endpoints fordelt på 18 offentlige (login, signup, offentlige profiler) og 62 autentificerede endpoints.

**Mappestruktur (src/):**

- `entities/`: De 16 feature-baserede entities med deres controllers, services og DTOs
- `middleware/`: Authentication middleware der validerer JWT tokens
- `config/`: Supabase client konfiguration
- `types/`: Fælles TypeScript typer inklusiv auto-genererede Supabase typer
- `utils/`: Hjælpefunktioner til error handling og validering
- `docs/`: Auto-genereret Swagger/OpenAPI dokumentation
- `routes/`: Auto-genereret Express routes fra TSOA
- `jobs/`: Scheduled tasks med node-cron

Denne opdeling sikrer at hver entity er selvstændig og kan udvikles uafhængigt, mens fælles logik som authentication, CORS og error handling sikrer konsistens på tværs af hele API'et.

### 3.3 Frontend Arkitektur

LineUp's frontend er bygget med Next.js App Router og TypeScript. Al data hentes client-side for at gøre koden genanvendelig hvis projektet senere skal udvides til React Native. Arkitekturen har en klar opdeling mellem fælles komponenter og feature-specifik logik.

#### Tech-stack

State management er opdelt i to lag. TanStack Query håndterer al server data med caching, background refetching og optimistic updates.

Zustand bruges til client-side state som brugerens session, onboarding flow, chat actions og service filters. Onboarding data gemmes i localStorage via persist middleware.

UI-komponenter er delvist bygget med Radix UI primitives for accessibility og stylet med Tailwind CSS kombineret med custom CSS til brand-specifikke designelementer.

Applikationen bruger OKLCH color system (grundet Tailwind) og Helvetica Now Display. Formularer håndteres gennem React Hook Form med Zod schemas til både runtime validering og TypeScript type inference. Animationer implementeres med Framer Motion hvor det er nødvendigt.

Backend-integration sker via `openapi-fetch` client med middleware der automatisk tilføjer Supabase auth tokens til alle requests. TypeScript typer genereres automatisk fra backend's API dokumentation, så frontend og backend altid er synkroniseret. En centraliseret error handler håndterer API fejl, herunder automatisk logout hvis sessionen er udløbet (401 responses).

#### Arkitektur og mappestruktur

Frontenden er organiseret med klar opdeling mellem fælles funktionalitet og feature-specifik logik:

**Routing:** App Router bruger route groups hvor `(auth)` indeholder login og onboarding, mens `(main)` indeholder hovedapplikationen. En AuthGuard komponent sikrer at kun autentificerede brugere får adgang til de beskyttede sider.

**Fælles funktionalitet (app/modules/)** samler al logik der bruges på tværs af applikationen:

- `api/`: API client setup og feature-uafhængige API funktioner
- `components/`: Genanvendelige UI komponenter
- `hooks/`: React hooks til generel brug. Yderligere inddeling i queries og mutations fra Tanstack Query
- `stores/`: Global state som bruger-session og onboarding flow
- `supabase/`: Supabase client
- `types/`: TypeScript types genereret fra backend API
- `utils/`: Hjælpefunktioner

**Feature-specifik logik (modules/features/)** består af 7 separate domæner:

- `auth`
- `chats`
- `notifications`
- `posts`
- `profiles`
- `search`
- `services`

Hver feature indeholder baseret på use case. Igen baseret på hvad der nødvendigt for givne feature:

- `components/`: UI komponenter kun brugt her
- `hooks/`: React hooks til feature brug. Yderligere inddeling i queries og mutations fra Tanstack Query
- `stores/`: Feature-specifik state
- `utils/`: Util funktioner
- `api.ts`: API calls kun for denne feature
- `schemas.ts`: Validering af formularer
- `types.ts`: TypeScript typer

Denne struktur gør at features kan udvikles uafhængigt af hinanden, mens fælles funktionalitet sikrer konsistens.

### 3.4 Real-time og performance

Beskeder opdateres live gennem Supabase Realtime, hvor hver samtale har sin egen kanal der lytter efter nye, redigerede og slettede beskeder. Når en besked kommer ind, opdateres den automatisk i appens cache.

Performance forbedres gennem Next.js' automatiske code-splitting, så hver side kun loader den JavaScript der er nødvendig for netop den side.

Billeder komprimeres i brugerens client før upload (maks 2MB for posts, 500KB for profilbilleder), draft-indhold gemmes lokalt i browseren, og data fra serveren caches i 5 minutter (afhænger af specifikke features) for at reducere unødvendige server-kald.

## 4. Liste og beskrivelse af implementerede features

### Authentication & Onboarding (Andreas)

- Multi-step onboarding flow med splash screen, koncept-introduktion, oprettelse, valg af brugertype og indsamling af basisinformation
- Supabase Auth integration med JWT-baseret authentication
- Login og oprettelses-sider

### User Profiles (Andrea)

**About tab:**
- Omfattende profilsystem med avatar, bio, lokation, tilpasning af temafarve
- Visning af profiler (egen profil og andre brugeres profiler)
- Redigering af profil med modaler til basisinfo, interesser, genrer, sociale links og FAQ
- Visning af tidligere samarbejder
- Brugeranmeldelser og ratingsystem (ikke fuldt implementeret)
- Spotify playlist integration
- Links til sociale medier
- "Looking for" præferencer (connect, promote, find-band, find-services)

**Posts tab:**
- Se egne notes og request
- Mulighed for gennemførelse af requests
- Slet og redigering af egne posts

### Social Feed (Andrea)

- Posts fra andre musikere
- Understøttelse af tre post-typer:
  - **Notes:** Del tanker, spørgsmål, tutorials og musik-relateret indhold
  - **Requests:** Slå samarbejdsmuligheder op, søg efter bands eller servicebehov
  - **Stories:** Midlertidigt indhold med 24-timers levetid (ikke fuldt implementeret i MVP)
- Engagement features: likes, bookmarks, kommentarer

### Content Creation (Christian)

- Oprettelses-side med tab-navigation (Note/Request/Story)
- Medie-understøttelse med billedkomprimering
- Tagging system til Notes (halvt implementeret)
- Bruger-tagging (nævn 1 person du følger)
- Genre-valg til Requests
- Automatisk gem af kladder (draft auto-save)

### Search & Discovery (Andreas)

Omfattende søgesystem med tab-navigation:
- **For You:** Personaliserede resultater der kombinerer personer og samarbejdsforespørgsler
- **People:** Søg efter musikere på navn, brugernavn eller rolle
- **Collaborations:** Søg efter samarbejdsforespørgsler
- **Services:** Find serviceudbydere
- **Tags:** Søg efter posts via tags
- Real-time søgning
- Full-text search på tværs af brugere, posts og metadata
- Sporing af søgehistorik

### Messaging & Communication (Andreas)

- Direct messaging system med en-til-en chats
- Group chat understøttelse (maks 8 deltagere)
- Real-time levering af beskeder via supabase realtime
- Beskedhistorik og persistens
- Sporing af ulæste beskeder
- Mediedeling (billeder, videoer, lydfiler)
- Voice message (ikke implementeret)
- Chat-baseret samarbejdsflow (se sektion 6 for detaljer)

### Services & Collaborations (Andreas)

- Samlet visning af collaboration requests og service-udbydere i ét unified view
- Filtersystem efter genre, lokation og andre muligheder
- Zustand-baseret filter state management med persistence
- Search bar til søgning i requests og services
- Aktive filter display med mulighed for at fjerne individuelle filtre
- Collaboration request cards med genre tags, lokation og paid opportunity indikation
- Service provider cards med profil information
- Tag relevante musikere i collaboration requests
- Direkte chat-oprettelse fra collaboration requests
- Request resolution system (se sektion 6 for detaljer)

### Connections & Networking (Nikolaj)

- LinkedIn-stil forbindelsessystem (gensidige forbindelser)
- Follow/unfollow funktionalitet
- Forbindelsesanmodninger med status (pending/accepted/rejected)
- Se hvem der følger hvem
- Blokering af brugere (Kun i message delen for nu)

### Collaboration System (Christian)

- Samarbejdsforespørgsler (posts med typen requests)
- Filtrering på genre, lokation og betalte muligheder
- Tag relevante musikere i forespørgsler
- Sporing af tidligere samarbejder på profiler (ikke fuldt implementeret)
- System til løsning og arkivering af forespørgsler (se sektion 6 for detaljer)

### Notifications (Nikolaj)

- Real-time notifikationssystem
- Notifikationstyper: likes, comments, tags, connection requests

### Media Management (Christian)

- Upload af billeder og videoer
- Medie-lagring via Supabase Storage buckets
- Generering af thumbnails til videoer
- Tilknytning af medier til posts

## 5. Kendte fejl eller manglende features

### Manglende Features (Ikke en del af MVP scope)

- Hent alle kunstnere fra Spotify (Fetch all artists from Spotify)
- **Stories:** Midlertidigt indhold med 24-timers levetid er ikke fuldt implementeret (nævnt i Sektion 4)
- **Pro/Upgrade System:** "Get Pro lineUp" feature er ikke implementeret
- **Insights/Analytics:** Brugeranalyse og insights side er ikke implementeret
- **Invite Friends:** System til at invitere venner er ikke implementeret
- **App Store Rating:** "Rate the app" funktionalitet er ikke implementeret
- **Detaljeret Indstillingsside:** Avanceret indstillingsside er ikke implementeret
- **Hjælpeside:** Hjælp/support side er ikke implementeret
- **Rapporter Bruger:** Funktionalitet til at rapportere brugere er ikke implementeret
- **Spotify Playlist Integration:** Selvom Spotify playlist URL gemmes, er visningen statisk med en pladeholder billede i stedet for embeded i koden
- **Manglende notifikationer:** Mangler notifikationer i headeren for messages og reply på comments

### Kendte Fejl

- Givetvis mange ukendte fejl, men ingen kendte
- Når man modtager en connection og klikker på notifikationen, sker der noget mystisk, som gør at den stadig står som pending i ens profil
- Vores glass effect opfører sig forskelligt imellem mobil view og desktop view

## 6. Ekstra features eller innovationer udover kravene

### 6.1 Udvidet chat funktionalitet

Vi har implementeret flere chat features som ikke var specificeret i Figma-designet, men lagt op til, for at gøre messaging-oplevelsen mere komplet og brugervenlig.

#### New Chat Interface

Figma-designet viste ikke hvordan brugere skulle oprette nye chats eller gruppechats. Vi har derfor implementeret en dedikeret "New Chat" side hvor brugere kan:

- Søge efter brugere (både connections og generelle users)
- Vælge mellem one-to-one chat eller gruppechat
- Se preview af valgte deltagere før chattet oprettes

#### Group Chat Settings

For at kunne administrere gruppechats har vi tilføjet en settings-side hvor brugere kan:

- Redigere gruppechat navn
- Se alle deltagere
- Tilføje nye medlemmer
- Fjerne medlemmer (kun chat creator)
- Forlade gruppe chatten

#### Swipe Gestures på Conversations

For at forbedre mobile brugeroplevelsen har vi implementeret swipe gestures på conversation rows:

- Swipe til højre: Marker som ulæst/læst
- Swipe til venstre: Slet samtale
- Visual feedback under swipe for at guide brugeren

Disse tilføjelser sikrer at chat funktionaliteten giver en mere funktionel og fuldendt oplevelse.

### 6.2 Forbedret Collaboration Flow

Vi har forbedret og tydeliggjort samarbejdsflowet baseret på forespørgsler (requests). Når en bruger (OP) opretter en samarbejdsforespørgsel, kan andre brugere åbne en chat direkte baseret på den forespørgsel. I denne chat kan brugerne diskutere og planlægge, om de ønsker at gå videre med samarbejdet. Hvis de beslutter sig for at fortsætte, kan OP gå på sin profil under "posts", og resolve posten.

#### Post Collaborators Implementation

For ikke at skulle lave en stor data migration til slut i projektet, besluttede vi at de personer man kan vælge i "past collaborators" på profilen, er de personer der har klikket "start chat" på et af dine post requests. Idéen er at i en 100% endelig version ville man kunne resolve et post request og vælge en bruger den er resolved med. Det er så disse brugere som ville blive vist under past collaborators.

Når en post resolves:

- Tilføjes et "resolved" tag til request-posten
- Arkiveres forespørgslen så den ikke længere er synlig i hovedfeedet
- Den løste forespørgsel kan stadig findes på profiler/posts hvor brugere kan se deres egne posts

Dette skaber et klart workflow fra opdagelse → diskussion → løsning for samarbejdsforespørgsler og gør samarbejdsprocessen mere strømlinet.

### 6.3 ConnectionsModal - Modal-baseret Forbindelsesvisning

Vi har implementeret en modal-baseret løsning til visning og administration af forbindelser, der åbnes direkte fra profilheaderen ved at klikke på connections-tælleren. I stedet for at navigere til en separat side, forbliver brugeren i konteksten af profilen.

Modal'en tilpasser sig dynamisk baseret på om brugeren ser sin egen profil eller en anden brugers profil. For egen profil vises ventende forbindelsesanmodninger øverst med Accept/Reject-knapper, så brugere hurtigt kan håndtere nye anmodninger. Accepterede forbindelser vises nedenfor med mulighed for at fjerne forbindelser. For andre brugers profiler vises kun accepterede forbindelser uden mulighed for at se ventende anmodninger eller udføre handlinger, hvilket beskytter privatlivet samtidig med at der gives et overblik over brugerens netværk.

Denne innovation reducerer navigation overhead og gør det muligt at administrere forbindelser.

## 7. Designbeslutninger der supplerer eller afviger fra Figma Design

### Kombineret Services Tab Navigation

Vi traf en designbeslutning om at kombinere Services-fanen, så den viser både samarbejder (collaborations) og services i én samlet visning. Dette skaber en mere flydende navigationsoplevelse, da fanen i det oprindelige design ville erstatte "home" når man navigerede til "collabs", hvilket gjorde det umuligt at navigere tilbage til home feedet fra den visning. Ved at kombinere services og collaborations bevarer vi en konsistent navigation samtidig med at vi giver adgang til begge typer indhold.

**Begrundelse:** I det oprindelige Figma design ville navigation til "collabs" erstatte "home"-fanen, hvilket skabte en blindgyde for navigation, hvor brugere ikke kunne vende tilbage til home feedet. Ved at kombinere services og collaborations i en enkelt fane opretholder vi en konsistent navigationsstruktur og sikrer, at brugere altid kan tilgå home feedet.

## 8. Link til primært Project Board

https://sharing.clickup.com/90151900334/l/h/6-901517756216-1/7b089d364dcb316

## 9. Fungerende links til GitHub Eksempler

### Eksempel på ClickUp Task

https://sharing.clickup.com/90151900334/t/h/86c6zu7pa/ZU7M6CLINZ52TRT

### Eksempel på Pull Request

https://github.com/andreasbbusk/lineup/pull/57

## 10. Database Struktur Diagram og Data Modeling Beskrivelse

Vi har bygget LineUp's database med 27 tabeller i PostgreSQL via Supabase. Strukturen er delt op i seks hovedområder: brugerprofiler, posts og media, sociale forbindelser, beskeder, notifikationer, og søgning.

### Database Struktur

#### Core Data (5 tabeller)

- `profiles` - Brugerprofiler med username, avatar, bio, location, theme_color
- `posts` - Alle post-typer (note, request, story) med status tracking
- `metadata` - Samlet tabel for tags, genrer, interests og kunstnere
- `media` - Media storage references med thumbnails
- `services` - Ikke-musiker services (venues, studios, equipment rental osv.)

#### User Profile Extensions (5 tabeller)

- `user_looking_for` - Hvad brugere søger (connect, promote, find-band, find-services)
- `user_metadata` - Linker brugere til genrer og kunstnere
- `user_social_media` - Links til sociale medier (Instagram, TikTok, SoundCloud osv.)
- `faq_questions` - Prædefinerede FAQ spørgsmål
- `user_faq` - Brugeres svar på FAQ spørgsmål

#### Junction Tables (3 tabeller)

- `post_media` - Forbinder posts med media (med display_order)
- `post_metadata` - Forbinder posts med tags og genrer
- `post_tagged_users` - Forbinder posts med taggede brugere (maks 1 per post)

#### Social & Collaboration (4 tabeller)

- `connection_requests` - LinkedIn-stil forbindelsessystem
- `connections` - VIEW af accepterede forbindelser
- `user_collaborations` - Tovejs arbejdsrelationer
- `user_reviews` - 5-stjernet rating system
- `story_views` - Tracking af hvem der har set stories

#### Engagement (3 tabeller)

- `likes` - Post og kommentar likes (polymorphic)
- `bookmarks` - Gemte posts
- `comments` - Med nested replies via parent_id

#### Messaging & Notifications (7 tabeller)

- `conversations` - Direct og gruppe chats
- `conversation_participants` - Deltagelsesinformation med unread tracking
- `messages` - Med replies, edits, deletes, media support
- `message_read_receipts` - Læsekvitteringer
- `notifications` - Polymorphic notifikationssystem
- `recent_searches` - Brugerens søgehistorik

### Hvad Fungerer Godt

#### Unified Metadata-tabel

I stedet for separate tabeller til tags, genrer, interests og kunstnere valgte vi én samlet metadata tabel med en type enum kolonne. Dette forenkler databasestrukturen betydeligt - vi skal kun vedligeholde én tabel, queries bliver simplere (kun én tabel at søge i), og søgefunktionalitet er konsistent på tværs af alle metadata-typer. Derudover er det nemt at tilføje nye typer senere uden at skulle lave migrationer for nye tabeller. Alle metadata får automatisk samme full-text search funktionalitet via én genereret search_vector kolonne.

#### Polymorphic Patterns

**Notifications:** Vi bruger et polymorphic pattern hvor notifikationstabellen har entity_type (f.eks. "posts", "comments") og entity_id som refererer til den relevante entitet. Dette betyder at én notifikationstabel kan håndtere alle typer notifikationer - likes, comments, forbindelser, reviews osv. Vi har 8 forskellige notifikationstyper implementeret uden at skulle vedligeholde separate tabeller for hver type. Når vi vil tilføje en ny notifikationstype, skal vi bare tilføje den til type enum'en - ingen nye tabeller eller joins nødvendige.

**Likes:** Samme princip bruges til likes - én tabel med nullable post_id og comment_id felter. Kun ét af felterne er udfyldt ad gangen, hvilket giver os likes på både posts og comments uden at skulle duplikere logik eller vedligeholde to separate like-tabeller.

#### Messaging System

Vores beskedsystem understøtter både direkte chats og gruppechats med fuld real-time funktionalitet via Supabase Realtime subscriptions. Systemet håndterer redigering og sletning af beskeder gennem is_edited og is_deleted flags, så vi bevarer besked-historik. Læsekvitteringer trackes i en separat message_read_receipts junction tabel, hvilket gør det nemt at se hvem der har læst hvad. Hver deltager har et last_read_message_id så vi kan beregne unread counts effektivt. UI'en bruger optimistic updates, så beskeder vises øjeblikkeligt når du sender dem, mens serveren håndterer persistering i baggrunden.

**Halvt implementeret:** Database-strukturen har reply_to_message_id felt og backend accepterer det, men UI komponenten til at reply på beskeder er ikke bygget endnu - frontend sender altid null. Ligeledes har messages-tabellen et media_ids array felt til at uploade billeder/videoer, men upload-flowet i UI er ikke færdigt implementeret.

#### PostgreSQL Full-Text Search

Vi bruger PostgreSQL's indbyggede full-text search i stedet for en ekstern service. Vi har genererede tsvector kolonner på profiles, posts, metadata og services tabeller med weighted search - brugernavne og titler vægtes højere (A) end beskrivelser (B) og bio-tekst (C). Dette betyder søgeresultater rangeres efter relevans automatisk. GIN indexes på alle search vectors gør søgningen hurtig, selv med mange records. Fordelen er at det er simpelt at vedligeholde (ingen ekstra services), og search vectors opdateres automatisk når data ændres via generated columns.

### Overvejelser og Læringer

#### Features vi ikke fik brugt

**user_metadata** - Vi designede en tabel til at forbinde brugere med deres genrer og kunstnere for at kunne vise disse på profiler og bruge dem til recommendations. Tabellen eksisterer i databasen med korrekte foreign keys til både profiles og metadata, men vi har aldrig bygget onboarding-flowet eller profile-edit UI'en til at udfylde dette. Det betyder alle brugere har 0 metadata-links, og featuren står ubrugt. Vi overvejede om det var fordi konceptet var forvirrende for brugerne, eller bare fordi det aldrig blev prioriteret i UI-udviklingen.

**user_collaborations** - Vi implementerede et tovejs system til at markere tidligere samarbejdspartnere, hvor hvis du tilføjer mig som samarbejdspartner, vises vi begge på hinandens profiler (bidirectional relationship). Det endte dog under implementering med at blive lidt vandet, da vi endte med at håndtere det i post-tabellen, som en post, med typen "request". Dette har gjort det svært at køre fuldt bidiretional i de posts som skulle være collaboration (request) posts, da vi i post tabellen ikke har de rigtige attributter (user_id OG collaborator_id) Dette ville vi som sagt have løst med user_collaborations, men problemet med det table er, at der her mangler info om selve collaboration'en. En tænkelig løsning ville være at forkaste user_collaboration tablet, og istedet lave et reelt collaboration table med de manglende attributer og andet relevant information fra post tablet.

Ideen er ikke helt færdigbagt, da dette også ville efterlade os med mange duplikeret attributter mellem post og collaboration. Istedet for at bruge mere tid på det valgte vi at emulere et bidirectional relationship i collaborations ved at man bare kan tagge folk man har collaborated med i sin profil.

#### Vi ville genoverveje

**Blocked users som array** - Vi gemmer blokerede brugere som en PostgreSQL array (blocked_users: uuid[]) direkte på profiles tabellen. Dette virkede simpelt i starten, men arrays i SQL er besværlige at arbejde med - de er svære at query effektivt (ingen index support), man kan ikke lave foreign key constraints til at sikre data-integritet, og det er umuligt at lave reverse lookups (se "hvem har blokeret mig"). En separat user_blocks junction tabel med (blocker_id, blocked_id) ville give bedre query performance og mere fleksibilitet, men ville kræve en migration af eksisterende blocked_users data. Plus så har vi ikke implementeret blocked features andre stedet end i messages indtil videre.

**Media mangler owner reference** - Vi har en user_metadata som egentlig skulle gemme ting som media uploads for en user. I kampens hede er det ikke blevet koblet på ved upload af media-filer. Man kunne genoverveje om man ville have mindre komplekse tables, for at undgå at miste funktionalitet i svinget. Vi har derfor ikke kunne arbejde med media som er koblet til en specifik bruger, da den eneste forældre et media har, hvis nogen, er det post, som det tilhører.

### Database Diagram

https://dbdocs.io/andreasbuskmikkelsen/LineUp?view=table_structure

## 11. Post-Mortem: Projekt Refleksion

### Hvad gik godt

#### Tekniske Valg:

- **Supabase Integration:** Brug af Supabase til database, auth og storage reducerede infrastrukturens kompleksitet betydeligt og gav os mulighed for at fokusere på at bygge features frem for at administrere infrastruktur.
- **TypeScript Overalt:** At have TypeScript på både frontend og backend gav fremragende typesikkerhed og fangede mange fejl under udviklingen.
- **TanStack Query:** Brug af Tanstack Query til server state management simplificerede data fetching og gav fremragende caching og synkronisering.
- **TSOA til API Dokumentation:** Automatisk OpenAPI/Swagger generering fra TypeScript typer sikrede, at vores API dokumentation forblev synkroniseret med koden.
- **Entity-Baseret Arkitektur:** Organisering af kode efter entities i backenden frem for teknisk lag gjorde kodebasen mere vedligeholdelsesvenlig og nemmere at navigere i.

#### Samarbejde:

- Klar adskillelse af backend og frontend tillod teammedlemmer i teorien at arbejde parallelt med minimale konflikter.
- Feature-baseret organisering gjorde det nemt at identificere ejerskab og ansvar for forskellige dele af applikationen.
- Mødte ofte ind fysisk for at kunne bedre koordinere i person. Simplificerede mange kommunikationsveje.

#### Projektledelse:

- Når vi opdager bugs eller issues, opretter man det i ClickUp og assigner den person det giver mest mening for
- I slutningen af hver dag, tager vi altid en status, og baseret på det, giver os selv lektier for
- Inden vi går hjem hver dag, går vi igennem ClickUp, og rydder op i alle tasks, og rykker dem rundt som de burde.

### Hvad vi ville gøre anderledes

#### Tekniske Valg:

- **Test Strategi:** Vi ville implementere en mere omfattende teststrategi fra begyndelsen. Dette ville have fanget problemer tidligere og gjort refaktorering mere sikker.
- **Fejlhåndtering:** Vi ville etablere et mere konsistent fejlhåndteringsmønster på tværs af hele applikationen tidligere i projektet.
- **Arkitektur:** Den originale intention var at spejle entity tilgangen fra backenden i frontenden. Problematikken lå i at god del logik skulle anvendes flere forskellige steder, hvilket gjorde det sværere at identificere hvad der tilhørte hvad, og hvor det kunne findes.

#### Samarbejde:

- **Code Reviews:** Vi ville implementere flere code reviews tidligere for at fange problemer og dele viden på tværs.
- **Dokumentation:** Vi ville vedligeholde mere opdateret dokumentation under udviklingen frem for at dokumentere til sidst, hvilket ville have hjulpet med onboarding og vidensdeling.

#### Database:

- **Migrationsstrategi:** Vi ville etablere en mere formel database migrationsstrategi og review proces for at undgå schema ændringer, der krævede betydelig refaktorering.

---

**LineUp - Where musicians connect, collaborate, and create.**
