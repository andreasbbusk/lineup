# Frontend Architecture – LineUp

## Tech Stack

**Framework**: Next.js 15 (App Router) with React and TypeScript.

**Styling**: Tailwind CSS plus custom CSS for brand-specific components.

**State Management**:
- **TanStack Query** for all server-derived data (feeds, posts, profiles, messages).
- **Zustand** for client/session state via a single global app-store plus rare feature-specific stores.

**Validation & Types**: Zod schemas for all forms and API contracts, with `z.infer`-based TypeScript types.

**Backend Integration**: Dedicated Node/Express API backed by Supabase (Auth + Postgres), accessed through a singleton HTTP client in `lib/api/client.ts`.

> This stack is chosen to maximize future React Native reuse while staying idiomatic for a web-first Next.js app.

---

## Architectural Principles

### Feature-based Structure
Code is organized by domain (auth, profiles, chats, etc.) under `lib/features/*` instead of by technical layer. Each feature owns its hooks, API module, schemas, types, and smart components.

### Client-only Data Fetching
All data fetching happens in client components via TanStack Query; Next.js server features (Server Actions, `route.ts` API routes) are **not used**, keeping logic portable to React Native.

### Strict Separation of Concerns
- **`components/ui/`** – Pure, reusable UI primitives with no business logic.
- **`components/shared/`** – Cross-feature components (e.g., navbar) that compose multiple features.
- **`lib/features/*/components/`** – Smart, feature-specific components that use hooks, stores, and mutations.

### Backend Parity
Frontend types mirror backend entities (Supabase tables, DTOs) using `snake_case` to avoid mapping layers and keep contracts explicit.

---

## Project Structure

### Core High-level Directories

```
app/                           # Next.js routing and pages
├── (auth)/                    # Authentication routes
└── (main)/                    # Main app routes

components/
├── ui/                        # Buttons, inputs, layout primitives, icons
└── shared/                    # Navbar, layout shells, cross-feature widgets

lib/
├── api/                       # Singleton HTTP client, shared API helpers
├── features/                  # Domain modules (auth, profiles, chats, etc.)
├── query/                     # TanStack Query client and provider
├── stores/                    # Global Zustand app-store
└── supabase/                  # Supabase client configuration
```

### Feature Structure

Each feature follows a consistent internal layout:

```
lib/features/<feature>/
├── components/      # Smart React components for this domain
├── hooks/           # React hooks (queries, mutations, local feature logic)
├── api.ts           # Thin API wrapper(s) for this domain
├── schemas.ts       # Zod schemas
├── types.ts         # TS types for this feature
├── constants.ts     # Feature-specific constants (optional)
└── index.ts         # Public exports
```

> This makes each feature portable and self-contained; moving logic to React Native means mostly copying `lib/features` and re-implementing only the UI.

---

## State Management Strategy

### 1. Server State – TanStack Query

All data that originates from the backend (feeds, posts, messages, other users' profiles, notifications) is managed via TanStack Query hooks placed under `lib/features/*/hooks`.

- Hooks such as `useProfile`, `useFeed`, `useMessages` wrap API calls from `api.ts`, define query keys, and configure caching, stale times, and pagination.
- Mutations (`useUpdateProfile`, `useCreatePost`, etc.) encapsulate writes and selectively invalidate or update caches.

> This keeps server state normalized, cache-aware, and consistent across both web and future native clients.

### 2. Client/Session State – Zustand app-store

A single global store in `lib/stores/app-store.ts` holds:

- **Auth session**: `user`, `access_token`, `profile`, `is_authenticated`.
- **Onboarding wizard state**: `onboarding.step`, `onboarding.data`.
- **Future global UI flags** (e.g., theme, sidebar).

The store uses `persist` with localStorage to survive reloads.

**Important**: The store **never holds server collections** like feeds or chats; those live exclusively in TanStack Query.

**Guideline**: If the state belongs to the backend and can be refetched, it goes to TanStack Query; if it's purely client/session/UI state, it goes to Zustand.

### 3. Feature-Specific Stores

For rare, complex cross-component feature state (e.g., an always-on audio player), a dedicated store can live in `lib/features/<feature>/store.ts`.

> These are avoided by default and introduced only when component-local state or URL params are insufficient.

---

## Data Fetching & API Layer

All network access flows through a single HTTP client in `lib/api/client.ts`, configured with base URL, auth headers, and error normalization.

Each feature exposes its own `api.ts` that wraps this client with domain-specific functions (`signupWithAuth`, `updateUserProfile`, `fetchFeed`, etc.).

**Components and pages never call `api.ts` directly**; they use feature hooks which encapsulate Query/Mutation behavior:

```typescript
// Good ✅
const { data, isLoading } = useProfile(username);

// Avoid ❌
const profile = await getUserProfile(username);
```

> This ensures all fetching is tracked, cached, and consistent.

---

## Authentication & Onboarding

**Auth** is handled via Supabase Auth; tokens and user identity are stored in `app-store`.

`features/auth` contains:
- Zod schemas for login/signup.
- Hooks like `useLogin` and `useSignup` that call backend endpoints and update `app-store`.
- Components like `LoginForm` and `SignupForm`.

**Onboarding** is implemented as a multi-step flow under `features/profiles/components/onboarding` with URL-driven steps (`/onboarding?step=0–5`).

### OnboardingWrapper Enforcement

`OnboardingWrapper` enforces edge-case rules:

- **Guests** can only access splash, concept slider, and signup (steps 0–2).
- **Authenticated, incomplete users** are forced into profile completion steps (3–5).
- **Completed users** are always redirected away from onboarding to the main app.

> This centralizes redirect and access logic in one place and keeps pages thin.

---

## Forms & Validation

All forms use `react-hook-form` with `zodResolver` wired to feature schemas.

Each step or form has a dedicated schema (`signupSchema`, `basicInfoSchema`, `onboardingSubmissionSchema`), which is also reused in mutations and tests.

The final onboarding submission validates the aggregated onboarding data with a single Zod schema before sending to the backend, ensuring frontend and backend contracts are aligned.

---

## Components & UI Layers

### UI Primitives (`components/ui/`)
- Stateless components like `Button`, `Input`, `Select`, `Modal`, etc.
- **No imports from `lib/features/*`**; they receive all behavior via props.

### Shared Components (`components/shared/`)
- Cross-feature headers, navigation, layout shells, or context-aware widgets.
- May import from multiple features (e.g., showing profile and notification count).

### Feature Components (`lib/features/*/components/`)
- Smart components that connect hooks, validation, and UI: `OnboardingSignupStep`, `ProfileEditForm`, etc.
- Typically the only components imported by `app/*` pages.

> This layering keeps the design system reusable while allowing feature components to evolve independently.

---

## Routing & Navigation

Routes are defined using the Next.js App Router under `app/(auth)` and `app/(main)` groups.

**Pages are responsible only for composition**; they delegate logic to feature components and guards (e.g., `OnboardingWrapper`, `useRequireAuth`).

Onboarding uses query-string steps (`?step=...`) managed by `useOnboardingNavigation`, making the flow deep-linkable and easy to resume after reload.

---

## Error Handling & UX

- API client normalizes errors so hooks and components can show consistent messages.
- Zod validation errors are surfaced near inputs using `ErrorMessage` components.
- Auth and onboarding flows include defensive redirects to handle invalid states (e.g., accessing step 5 without an account).

---

## React Native Readiness

All reusable business logic (API modules, Zod schemas, TanStack Query hooks, Zustand stores) is isolated under `lib/` and `lib/features`, making it straightforward to share with a React Native app by copying or extracting into a shared package.

**Web-only concerns** are limited to `app/` (routing/layout) and view components using HTML/DOM-specific APIs.

> This architecture makes the frontend maintainable today and minimizes friction when a React Native client is added later.

---

## Summary

This architecture emphasizes:

- **Feature modularity** for maintainability and portability.
- **Clear separation** between server state (TanStack Query) and client state (Zustand).
- **Type safety** with Zod schemas and TypeScript.
- **Future-proofing** for React Native reuse.
- **Developer experience** with consistent patterns and minimal boilerplate.

The result is a scalable, maintainable frontend that can evolve with the product while staying predictable and easy to reason about.
