# ScoreCast AI — Implementation Plan

> **How to use this plan:**
>
> - Steps are numbered sequentially
> - Each step has a clear owner (agent), input, output, and verification
> - Work through phases in order — each phase unlocks the next
> - Mark steps as ✅ Done / ⏳ In Progress / ❌ Blocked as you go

---

## Status Legend

| Symbol | Meaning     |
| ------ | ----------- |
| ⬜     | Not started |
| ⏳     | In progress |
| ✅     | Complete    |
| ❌     | Blocked     |

---

## Phase 1 — Backend API Integration

Agent: @BackendExpert

> **Goal:** Implement all 4 external API integrations and wire them into the central proxy orchestrator.
> **Unlocks:** Phase 4 (Dashboard needs real data from proxy)

| #   | [ ] | File                  | Agent          | Description                                                                                                      |
| --- | --- | --------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | [x] | `src/lib/odds.ts`     | @BackendExpert | Implement Odds API — real fetch, Zod schema, `fetchOdds(sport, regions)`                                         |
| 2   | [x] | `src/lib/football.ts` | @BackendExpert | Implement Football API — real fetch, Zod schema, `fetchFixtures(date)`                                           |
| 3   | [x] | `src/lib/tavily.ts`   | @BackendExpert | Implement Tavily search — real fetch, Zod schema, `searchNews(query)`                                            |
| 4   | [x] | `src/lib/gemini.ts`   | @BackendExpert | Implement Gemini 2.5 Flash — JSON mode, `PredictionOutputSchema`, `generatePrediction(matchData, newsContext)`   |
| 5   | [x] | `src/lib/proxy.ts`    | @BackendExpert | Wire all lib imports, implement `getMatchList()` and `getDeepDiveAnalysis(matchId)` using `Promise.allSettled()` |

**Phase 1 complete when:** `src/lib/proxy.ts` exports typed data from all 4 APIs without throwing on partial failure.

---

## Phase 2 — Database Schema & Migrations

Agent: @SupabaseExpert

> **Goal:** Create all Supabase tables, enable RLS, and generate TypeScript types.
> **Unlocks:** Phase 3 (Auth needs schema), Phase 5 (User features need tables)
> **Can run in parallel with:** Phase 3

| #   | [x] | File                                        | Agent           | Description                                                                                                         |
| --- | --- | ------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------- |
| 6   | [x] | `supabase/migrations/001_create_tables.sql` | @SupabaseExpert | Create `predictions` table — `id`, `user_id`, `match_id`, `prediction_data` (JSONB), `created_at`                   |
| 7   | [x] | `supabase/migrations/001_create_tables.sql` | @SupabaseExpert | Create `favorites` table — `id`, `user_id`, `match_id`, `created_at` — unique constraint on (`user_id`, `match_id`) |
| 8   | [x] | `supabase/migrations/001_create_tables.sql` | @SupabaseExpert | Create `match_history` table — `id`, `user_id`, `match_id`, `viewed_at`                                             |
| 9   | [x] | `supabase/migrations/001_create_tables.sql` | @SupabaseExpert | Enable RLS on all 3 tables — add SELECT / INSERT / DELETE policies using `auth.uid() = user_id`                     |
| 10  | [x] | `src/types/database.ts`                     | @SupabaseExpert | Generate TypeScript types via Supabase CLI — `npx supabase gen types typescript ...`                                |

**Phase 2 complete when:** All 3 tables exist in Supabase with RLS enabled, and types file is generated.

---

## Phase 3 — Authentication

Agent: @AuthExpert

> **Goal:** Implement login, register, sign out, and Data Access Layer for route protection.
> **Unlocks:** Phase 5 (User features require auth)
> **Can run in parallel with:** Phase 2

| #   | [ ] | File                               | Agent           | Description                                                                                                                         |
| --- | --- | ---------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 11  | [x] | `src/lib/dal.ts`                   | @AuthExpert     | Create `verifySession()` wrapped in `cache()` — reads Supabase session, returns `{ isAuth, userId, user }` or redirects to `/login` |
| 12  | [x] | `src/actions/auth.ts`              | @AuthExpert     | Server Actions: `signUp(formData)`, `signIn(formData)`, `signOut()` — Zod validation, Supabase auth calls, redirect on success      |
| 13  | [x] | `src/app/(auth)/login/page.tsx`    | @FrontendExpert | Login form — email + password, `useActionState(signIn)`, display errors, link to register                                           |
| 14  | [x] | `src/app/(auth)/register/page.tsx` | @FrontendExpert | Register form — email + password, `useActionState(signUp)`, display errors, email confirmation notice                               |
| 15  | [x] | `src/app/auth/callback/route.ts`   | @AuthExpert     | Email confirmation callback — exchange code for session, redirect to `/dashboard`                                                   |

**Phase 3 complete when:** User can sign up, receive confirmation email, sign in, and `verifySession()` correctly redirects unauthenticated users.

---

## Phase 4 — Dashboard UI (MVP)

Agent: @FrontendExpert

> **Goal:** Build the main dashboard showing today's matches with AI deep dive capability.
> **Unlocks:** Phase 5 (extends dashboard with user features)
> **Prerequisites:** Phase 1 complete

| #   | [x] | File                               | Agent           | Description                                                                                                                    |
| --- | --- | ---------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 16  | [x] | `app/page.tsx`                     | @FrontendExpert | Replace default Next.js page — redirect to `/dashboard` or landing page with CTA                                               |
| 17  | [x] | `src/app/dashboard/layout.tsx`     | @FrontendExpert | Dashboard shell — nav header with logo, dark mode toggle, `children` outlet                                                    |
| 18  | [x] | `src/app/dashboard/loading.tsx`    | @FrontendExpert | Loading skeleton — 3-5 MatchCard skeletons with Tailwind pulse animation                                                       |
| 19  | [x] | `src/app/dashboard/error.tsx`      | @FrontendExpert | Error boundary — friendly message, "Try Again" button calling `reset()`                                                        |
| 20  | [x] | `src/app/dashboard/page.tsx`       | @FrontendExpert | Main page — calls `getMatchList()`, React 19 `use()` hook, `<Suspense>` wrapper, maps to `<MatchCard>`                         |
| 21  | [x] | `src/components/MatchCard.tsx`     | @FrontendExpert | Match card — teams, date, odds, "Deep Dive" button — shadcn/ui Card, under 150 lines                                           |
| 22  | [x] | `src/components/DeepDiveModal.tsx` | @FrontendExpert | AI analysis modal — calls `getDeepDiveAnalysis(matchId)`, displays news + prediction, Framer Motion slide-in, shadcn/ui Dialog |

**Phase 4 complete when:** `/dashboard` loads real matches, "Deep Dive" opens modal with Gemini prediction.

---

## Phase 5 — User Features

Agent: @FrontendExpert + @SupabaseExpert

> **Goal:** Extend the dashboard with user-specific data — favorites, history, and saving predictions.
> **Prerequisites:** Phase 4 + Phase 2 + Phase 3 complete

| #   | [x] | File                                 | Agent           | Description                                                                                                                         |
| --- | --- | ------------------------------------ | --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 23  | [x] | `src/actions/favorites.ts`           | @SupabaseExpert | Server Action: `toggleFavorite(matchId)`, `addFavorite(matchId)`, `removeFavorite(matchId)` with optimistic UI support.             |
| 24  | [x] | `src/actions/history.ts`             | @SupabaseExpert | Server Action: `trackMatchView(matchId)`, `getUserHistory()`. Metadata (teams, date) added.                                         |
| 25  | [x] | `src/actions/predictions.ts`         | @SupabaseExpert | Server Action: `savePrediction(matchId, outcome, confidence, reasoning)`, `getUserPredictions()`.                                   |
| 26  | [x] | `src/components/MatchCard.tsx`       | @FrontendExpert | Update UI: Add heart icon button (toggle favorite), optimistic UI update using `useOptimistic` or local state.                      |
| 27  | [x] | `src/components/DeepDiveContent.tsx` | @FrontendExpert | Update UI: Add "Save Prediction" button inside the modal/card. Calls `savePrediction` on click.                                     |
| 28  | [x] | `src/app/dashboard/history/page.tsx` | @FrontendExpert | History Page: List of viewed matches and saved predictions. Fetch `getUserHistory` and `getUserPredictions` in parallel.            |
| 29  | [x] | `src/components/HistoryList.tsx`     | @FrontendExpert | History List Component: Unified timeline view of history and predictions. Groups by date (Today/Yesterday).                         |
| 30  | [x] | `src/types/database.ts`              | @SupabaseExpert | Schema Update: Added `home_team`, `away_team`, `match_date` to `predictions` and `match_history` tables for better history display. |

**Phase 5 complete when:** Users can toggle favorites, save predictions, see a toast notification, and view their history on a dedicated page.

---

## Phase 6 — Polish & QA

Agent: @QA_Auditor + @DesignerExpert

> **Goal:** Visual refinement, mobile responsiveness check, and code quality audit.
> **Prerequisites:** Phase 5 complete

| #   | [ ] | File                  | Agent           | Description                                                                                    |
| --- | --- | --------------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| 31  | [ ] | `src/app/globals.css` | @DesignerExpert | Global styles check — ensure Tailwind v4 theme is consistent, dark mode colors are accessible. |
| 32  | [ ] | `src/**/*`            | @QA_Auditor     | 150-line limit audit — scan all files, ensuring larger components are split.                   |
| 33  | [ ] | `src/**/*`            | @QA_Auditor     | React 19 audit — verify `use()` is used correctly, no `useEffect` for data fetching.           |
| 34  | [ ] | `src/**/*`            | @QA_Auditor     | Type safety audit — verify all `any` uses are resolved or justified (e.g. valid `ts-ignore`).  |

---

## Phase 5 — User Features (Predictions, Favorites, History)

Agent: @FrontendExpert + @SupabaseExpert

> **Goal:** Allow signed-in users to save predictions, favorite matches, and view history.
> **Prerequisites:** Phase 3 (Auth) + Phase 4 (Dashboard)

| #   | [ ] | File                                 | Agent                             | Description                                                                                                              |
| --- | --- | ------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 23  | [ ] | `src/actions/predictions.ts`         | @SupabaseExpert                   | Server Actions: `savePrediction(matchId, data)`, `getUserPredictions()`, `deletePrediction(id)` — uses `verifySession()` |
| 24  | [ ] | `src/actions/favorites.ts`           | @SupabaseExpert                   | Server Actions: `addFavorite(matchId)`, `removeFavorite(matchId)`, `getUserFavorites()` — uses `verifySession()`         |
| 25  | [ ] | `src/actions/history.ts`             | @SupabaseExpert                   | Server Actions: `trackMatchView(matchId)`, `getUserHistory()` — uses `verifySession()`                                   |
| 26  | [ ] | `src/components/MatchCard.tsx`       | @FrontendExpert                   | Add favorite heart button — auth-gated, calls `addFavorite()`/`removeFavorite()`, optimistic UI update                   |
| 27  | [ ] | `src/components/DeepDiveModal.tsx`   | @FrontendExpert                   | Add "Save My Prediction" button — auth-gated, calls `savePrediction()`, success toast notification                       |
| 28  | [ ] | `src/app/dashboard/history/page.tsx` | @FrontendExpert + @SupabaseExpert | History page — calls `getUserHistory()` + `getUserPredictions()`, timeline layout, protected by `verifySession()`        |

**Phase 5 complete when:** Signed-in users can favorite matches, save predictions, and view their history page.

---

## Phase 6 — Polish & Deployment

Agent: @FrontendExpert + @QA_Auditor

> **Goal:** Final QA pass, accessibility, responsive design, and production deployment.
> **Prerequisites:** All previous phases

| #   | [ ] | File                | Agent           | Description                                                                                           |
| --- | --- | ------------------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| 29  | [ ] | various             | @FrontendExpert | Install & wire up shadcn/ui components — `button`, `card`, `dialog`, `toast`, `skeleton`              |
| 30  | [ ] | `app/error.tsx`     | @FrontendExpert | Root error boundary — styled consistently with dashboard                                              |
| 31  | [ ] | `app/not-found.tsx` | @FrontendExpert | 404 page — friendly message with link back to dashboard                                               |
| 32  | [ ] | `app/layout.tsx`    | @FrontendExpert | Metadata & SEO — `generateMetadata()`, title, description, OG image, favicon                          |
| 33  | [ ] | all pages           | @FrontendExpert | Responsive design audit — test 375px / 768px / 1920px, fix layout issues                              |
| 34  | [ ] | entire codebase     | @QA_Auditor     | Full security audit — API keys server-only, RLS policies tested, no `any` types, all files <150 lines |
| 35  | [ ] | Vercel              | -               | Deploy — connect GitHub repo, configure env vars, verify production build                             |

**Phase 6 complete when:** Lighthouse scores >90 on all metrics, production URL live and tested end-to-end.

---

## File Count Summary

| Phase                   | New Files                                                                          | Modified Files                   |
| ----------------------- | ---------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 — Backend APIs  | 4 (`football`, `tavily`, `gemini`, `lib/proxy`)                                    | 1 (`odds.ts` ✅)                 |
| Phase 2 — Database      | 1 (`database.ts`), 1 (`001_create_tables.sql`)                                     | `supabase.ts`                    |
| Phase 3 — Auth          | 4 (`dal`, `auth actions`, `login`, `register`, `callback`)                         | —                                |
| Phase 4 — Dashboard     | 7 (`layout`, `loading`, `error`, `page`, `MatchCard`, `DeepDiveModal`, `app/page`) | —                                |
| Phase 5 — User Features | 4 (`predictions`, `favorites`, `history actions`, `history page`)                  | 2 (`MatchCard`, `DeepDiveModal`) |
| Phase 6 — Polish        | 3 (`error`, `not-found`, `metadata`)                                               | several                          |
| **Total**               | **~23 files**                                                                      | **~5 files**                     |

---

## Dependency Graph

```
Phase 1 (APIs)
    └─→ Phase 4 (Dashboard displays data)
            └─→ Phase 5 (User features extend dashboard)

Phase 2 (Database) ─┐
                    ├─→ Phase 5 (User features need tables)
Phase 3 (Auth)    ──┘

Phase 6 (Deploy) — requires all phases complete
```

---

## Quick Reference — Agent Ownership

| Agent           | Owns                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| @BackendExpert  | `src/lib/odds.ts`, `src/lib/football.ts`, `src/lib/tavily.ts`, `src/lib/gemini.ts`, `src/lib/proxy.ts` |
| @SupabaseExpert | Database migrations, `src/types/database.ts`, all `src/actions/*.ts` DB operations                     |
| @AuthExpert     | `src/lib/dal.ts`, `src/actions/auth.ts`, `src/app/auth/callback/route.ts`                              |
| @FrontendExpert | All `src/app/**/page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, all `src/components/*.tsx`        |
| @QA_Auditor     | Final audit — reviews all files for security, 150-line limit, TypeScript compliance                    |
