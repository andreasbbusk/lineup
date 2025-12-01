# High-level flow

## Guest arrives

Can access `/onboarding?step=0–2` (splash, concept slider, signup).

Cannot access any authenticated pages under (main) or onboarding steps 3–5. Access control is handled by the onboarding wrapper and future auth guards.​

---

## Signup step (step 2)

User fills username, email, password, confirm_password.

`signupSchema` (Zod) validates the form; `react-hook-form` + `zodResolver` show per-field errors.

Username is checked with a debounced `checkUsernameAvailability` call.

On submit, `signupWithAuth` calls the backend/Supabase to create the auth user and start a session.​

---

## State update after successful signup

`signupWithAuth` returns `{ user, session, profile? }`.

`set_auth` in app-store stores user, access_token, and a (possibly null) profile, and flips `is_authenticated = true`.​

Onboarding progress data in the store is updated with username and email, and `mark_account_created()` marks that credentials exist.

---

## Profile completion steps (steps 3–5)

After signup, the user is pushed to `/onboarding?step=3`.

Steps 3–5 (user type, basic info, looking for) are only available to authenticated users; each step writes partial data into `onboarding.data` in the store.

Final submission uses a Zod schema (e.g. `onboardingSubmissionSchema`) to validate the aggregated onboarding data, then calls `useUpdateProfile` to update the backend profile row.​

Once the backend marks `onboarding_completed = true`, the frontend resets onboarding state and routes to `/` (home).

---

## Auth state and app-store

### What app-store holds

The global Zustand store (`lib/stores/app-store.ts`) is responsible for:

#### Auth session

- `user`: the Supabase/identity user (id, email).
- `access_token`: JWT used by the HTTP client.
- `profile`: the LineUp profile entity (may be null right after signup).
- `is_authenticated`: boolean derived from whether user and access_token are set.​

#### Onboarding state

- `onboarding.step`: the furthest logical step the user has reached.
- `onboarding.data`: partial aggregated info (email, username, first/last name, phone, year_of_birth, location, user_type, looking_for, account_created).

#### Auth-related actions:

```ts
set_auth(user, access_token, profile);
clear_auth();
update_profile(profile);
```

#### Onboarding actions:

```ts
next_step();
prev_step();
go_to_step(step);
update_onboarding_data(partial);
reset_onboarding();
mark_account_created();
```

This store is persisted to localStorage so the app can restore session and onboarding progress across reloads.​

---

## Routing and guards

### URL-driven steps

The current onboarding step lives in the URL as `?step=N` and is read via `useOnboardingNavigation`:

```ts
const currentStep = parseInt(searchParams.get("step") || "0", 10);

const navigateToStep = (step: number) => {
  const clamped = Math.max(0, Math.min(step, 5));
  router.push(`/onboarding?step=${clamped}`, { scroll: false });
};
```

This keeps the flow deep-linkable and restorable after refresh while still allowing logic gates around which steps a user may see.​

---

## OnboardingWrapper logic

`OnboardingWrapper` is the central gatekeeper for `/onboarding`:

- Reads `is_authenticated` and `profile.onboarding_completed` from app-store.
- Reads step from the query string.
- Applies rules:

**Completed user (`auth + onboarding_completed = true`):**
- Any `/onboarding` access → redirect to `/`.

**Guest user (not authenticated):**
- Allowed steps: 0–2.
- Steps 3–5 → redirect to step 2 (signup).

**Authenticated but incomplete user:**
- Steps 0–2 → redirect to step 3 (skip splash/signup).
- Steps 3–5 → allowed.

After checks, renders the correct step component from the `STEP_COMPONENTS` map and wraps steps 2–5 in a centered layout with `OnboardingProgress`.​

---

## Login and re-entry behavior

### Logging in (future login page)

The login hook (`useLogin`) will also use `set_auth` and then decide where to send the user:

- If `profile.onboarding_completed` is true → `/` (home/feed).
- Otherwise → `/onboarding?step=3` to continue profile completion.

This mirrors the signup case, ensuring that partially onboarded accounts always land back in the profile completion funnel.​

---

## Preventing “back into onboarding”

Once `onboarding_completed` is true on the profile:

- `OnboardingWrapper` immediately redirects `/onboarding` → `/`.
- Login and signup pages can also guard against logged-in users by redirecting them to `/` or `/onboarding` depending on completion.
- That means manually typing `/onboarding?step=2` as a completed user is never respected; the wrapper will kick them back to the main app.

---

## Summary of roles

- **Supabase/Auth backend:** validates credentials, issues JWT, stores base auth user.​
- **Express API:** exposes endpoints for signup, login, profile update, etc.
- **TanStack Query:** not yet central in auth, but used for profile fetching, feed data, etc.
- **Zustand app-store:** source of truth for session and onboarding progress, shared by all features.​
- **Onboarding components:** UI steps that read/write onboarding state, call auth/profile APIs, and rely on OnboardingWrapper for routing rules.

Together, this creates a unified funnel: splash → signup → profile completion → main app, with clear guards so users only ever see steps that make sense for their current state.