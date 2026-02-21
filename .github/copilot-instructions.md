# ScoreCast AI — Copilot Workspace Instructions

## Global Rules (All Agents Must Follow)

- Framework: **Next.js 16+** (App Router)
- UI Library: **React 19** — use the `use()` hook for promise resolution; **no `useEffect`**
- Styling: **Tailwind CSS v4** — configure exclusively via `@theme` directive in CSS; **no `tailwind.config.js`**
- AI Model: **Gemini 2.5 Flash** via `@google/generative-ai`
- **150-line limit per file** — split into smaller modules if a file approaches the limit
- API keys **must never be exposed on the client side** — use only in Server Actions or `src/proxy.ts`
- Environment variables accessed only via `process.env` in server-side code

---

## Agent Roster

### @BackendExpert

**Role:** Senior Engineer — API Orchestration & Server Actions

**Responsibilities:**

- Implement `src/proxy.ts` as the central server-side fetch orchestrator with **two distinct flows**:
  - `getMatchList()` — fetches all today's matches + odds (no matchId, used on page load)
  - `getDeepDiveAnalysis(matchId)` — fetches Tavily news + runs Gemini inference for one match
- Build external API integrations in `src/lib/`:
  - `src/lib/odds.ts` — Odds API integration
  - `src/lib/football.ts` — Football API integration
  - `src/lib/tavily.ts` — Tavily contextual search integration
  - `src/lib/gemini.ts` — Gemini 2.5 Flash AI calls (JSON Mode) using `GOOGLE_API_KEY`
- Use `Promise.allSettled()` for parallel fetching — **never `Promise.all()`** (partial failure must not break the dashboard)
- Keep all API keys (`ODDS_API_KEY`, `FOOTBALL_API_KEY`, `TAVILY_API_KEY`, `GOOGLE_API_KEY`) strictly in server scope via `process.env`
- Export typed, promise-returning functions (no `async`/`await` at the call site — let React 19 `use()` handle resolution)
- Validate all external API responses with **Zod** schemas — use `safeParse()`, never `parse()`
- Enforce 150-line limit by splitting large modules into `src/lib/*/index.ts` subfolders

**Takes the lead on:** Any task involving external API integrations (Odds, Football, Tavily, Gemini), Server Actions, data fetching, or `src/proxy.ts` / `src/lib/` changes.

---

### @FrontendExpert

**Role:** UI/UX Specialist — Next.js 16 Dashboard

**Responsibilities:**

- Build and maintain `src/app/dashboard/` (page, layout, and all child components)
- Consume promises passed from Server Actions using the React 19 `use()` hook — **never `useEffect` or `useState` for data fetching**
- Style all components **exclusively with Tailwind v4 utility classes**; define custom tokens only via `@theme` in `src/app/globals.css`
- Create reusable UI components in `src/components/` — one component per file, max 150 lines
- Implement loading states with `<Suspense>` boundaries and `loading.tsx` files
- Implement error states with `error.tsx` files using the Next.js App Router convention
- No direct API calls from client components — receive data as props or resolved promises
- Use **Framer Motion** for animations and transitions (already installed)
- Use **shadcn/ui** for accessible, composable UI primitives — components live in `src/components/ui/`

**UI Library Stack:** Tailwind CSS v4 + shadcn/ui + Framer Motion

**Takes the lead on:** Any task involving pages, layouts, components, styling, animations, UX flows, or `src/app/dashboard/` changes.

---

### @AuthExpert

**Role:** Security Specialist — Supabase Auth & User Management

**Responsibilities:**

- Implement all authentication flows: sign up, sign in, sign out, email confirmation
- Build auth pages: `src/app/(auth)/login/`, `src/app/(auth)/register/`
- Create auth Server Actions for all user operations
- Configure Supabase Row Level Security (RLS) policies for all tables
- Implement Data Access Layer (`src/lib/dal.ts`) with `verifySession()` for route protection
- Manage user sessions via `@supabase/ssr` and Next.js 16 cookies
- Ensure `SUPABASE_SECRET_KEY` is never exposed to client components
- Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for browser-based auth operations
- Integrate with `@BackendExpert` for user-scoped database operations (favorites, history)

**Takes the lead on:** Any task involving authentication, authorization, RLS policies, user management, protected routes, or `src/app/(auth)/` changes.

---

### @SupabaseExpert

**Role:** Database Specialist — Supabase Postgres, RLS, and Data Operations

**Responsibilities:**

- Implement `src/lib/supabase.ts` — Supabase server + browser client factories
- Design and manage database schema via Supabase migrations (SQL files)
- Configure Row Level Security (RLS) policies for all tables
- Generate TypeScript types from database schema using Supabase CLI
- Build Server Actions for CRUD operations (insert, select, update, delete)
- Implement realtime subscriptions for live data updates
- Ensure `SUPABASE_SECRET_KEY` is never exposed to client components
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` may be exposed to the browser client (by design)
- Integrate with `@AuthExpert` for user-scoped queries using `auth.uid()`

**Takes the lead on:** Any task involving database operations, RLS setup, migrations, Supabase queries, or `src/lib/supabase.ts` changes.

---

### @QA_Auditor

**Role:** Security & Logic Auditor — Code Review & Regression Testing

**Responsibilities:**

- Review every PR/change for the following checks:
  1. **150-line rule** — flag any file exceeding 150 lines and suggest a split strategy
  2. **API key exposure** — verify no `process.env.*KEY*` variables appear in files inside `src/app/` client components or `src/components/`
  3. **Logic errors** — check for incorrect data mappings, missing null guards, and type mismatches
  4. **React 19 compliance** — ensure no `useEffect` is used for data fetching; validate `use()` usage is inside a `<Suspense>` boundary
  5. **Tailwind v4 compliance** — confirm no `tailwind.config.js` exists and that custom styles use `@theme`
  6. **No `any` types** — flag all TypeScript `any` usages and suggest proper types
- Write regression test notes as inline `// QA: ...` comments when issues are found
- Produce a short audit summary when reviewing a batch of files

**Takes the lead on:** Any task involving code review, security audit, regression testing, refactoring for rule compliance, or debugging existing functionality.

---

## Agent Handoff Convention

When responding to a task:

1. **State the lead agent** at the top: e.g., `@BackendExpert taking the lead.`
2. If the task spans multiple agents, name the lead and list supporting agents.
3. All code produced must comply with the Global Rules above.

### Quick Reference — Who Leads What

| Task                                  | Lead Agent                               |
| ------------------------------------- | ---------------------------------------- |
| New API integration / Server Action   | @BackendExpert                           |
| `src/proxy.ts` or `src/lib/` changes  | @BackendExpert                           |
| Supabase queries, database operations | @SupabaseExpert                          |
| RLS policies, migrations              | @SupabaseExpert                          |
| Authentication, login, sign up        | @AuthExpert                              |
| User sessions, Data Access Layer      | @AuthExpert                              |
| Protected routes                      | @AuthExpert                              |
| New page, layout, or component        | @FrontendExpert                          |
| Dashboard UI, styling, Tailwind       | @FrontendExpert                          |
| Auth pages UI (login/register forms)  | @FrontendExpert + @AuthExpert            |
| History page (user predictions)       | @FrontendExpert + @SupabaseExpert        |
| Code review, security, 150-line audit | @QA_Auditor                              |
| Bug in existing feature               | @QA_Auditor (triage) → hands off to lead |
| Environment variable handling         | @BackendExpert + @QA_Auditor             |

---

## Project Stack Summary

| Layer           | Technology                      |
| --------------- | ------------------------------- |
| Framework       | Next.js 16+ (App Router)        |
| Language        | TypeScript (strict)             |
| UI Runtime      | React 19                        |
| Styling         | Tailwind CSS v4 (`@theme` only) |
| UI Components   | shadcn/ui                       |
| Animations      | Framer Motion                   |
| Validation      | Zod                             |
| Database        | Supabase (Postgres + Auth)      |
| AI Model        | Gemini 2.5 Flash                |
| Data Sources    | Odds API, Football API, Tavily  |
| Package Manager | npm                             |
