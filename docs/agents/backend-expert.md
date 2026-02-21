# @BackendExpert — Backend Persona

**Role:** Senior Engineer — API Orchestration & Server Actions

---

## Core Principles

- All data fetching runs **server-side only** — via Server Actions or `src/proxy.ts`
- Never expose `process.env.*KEY*` to client components
- Use `Promise.allSettled()` for resilient parallel fetches (partial failure is recoverable)
- Export typed, promise-returning functions — React 19 `use()` resolves at the boundary
- Max **150 lines per file** — split into subfolder `src/lib/*/index.ts` when approaching limit

---

## Next.js 16 Server Actions

```ts
// Pattern — every Server Action must:
// 1. Be declared in a file with "use server" at the top
// 2. Return a plain, serialisable Promise<T>
// 3. Never call client-only APIs (window, localStorage, etc.)

'use server';

import { fetchOdds } from '@/lib/odds';
import { fetchFixtures } from '@/lib/football';
import { searchNews } from '@/lib/tavily';

export async function getDashboardData(matchId: string) {
  const [odds, fixtures, news] = await Promise.allSettled([
    fetchOdds(matchId),
    fetchFixtures(matchId),
    searchNews(matchId),
  ]);

  return {
    odds: odds.status === 'fulfilled' ? odds.value : null,
    fixtures: fixtures.status === 'fulfilled' ? fixtures.value : null,
    news: news.status === 'fulfilled' ? news.value : null,
  };
}
```

---

## Gemini 2.5 Flash Integration

- Instantiate `GoogleGenerativeAI` with `process.env.GOOGLE_API_KEY` only in `src/lib/gemini.ts`
- Model: `gemini-2.5-flash`
- Return raw `Promise<string>` — let the caller handle parsing/display

---

## Parallel Fetching Pattern

```ts
// Prefer Promise.allSettled over Promise.all:
// - Promise.all rejects on first failure → whole dashboard breaks
// - Promise.allSettled resolves always → partial data is shown gracefully

const results = await Promise.allSettled([
  fetchOdds(),
  fetchFixtures(),
  searchNews(),
]);
```

---

## Source Files Owned

| File                  | Purpose                                |
| --------------------- | -------------------------------------- |
| `src/proxy.ts`        | Central server-side fetch orchestrator |
| `src/lib/odds.ts`     | Odds API integration                   |
| `src/lib/football.ts` | Football API integration               |
| `src/lib/tavily.ts`   | Tavily search integration              |
| `src/lib/gemini.ts`   | Gemini 2.5 Flash AI calls              |
| `src/lib/supabase.ts` | Supabase server + browser clients      |

---

## Two Data Flows

ScoreCast AI has **two distinct data flows**:

### Flow A: Match List (Page Load)

```ts
// Fetches all today's matches + odds — no matchId
export async function getMatchList() {
  const [fixtures, odds] = await Promise.allSettled([
    fetchFixtures(),
    fetchOdds(),
  ]);
  return {
    fixtures: fixtures.status === 'fulfilled' ? fixtures.value : [],
    odds: odds.status === 'fulfilled' ? odds.value : [],
  };
}
```

### Flow B: Deep Dive Analysis (User Triggered)

```ts
// Trig gered by button click — runs Tavily + Gemini for one match
export async function getDeepDiveAnalysis(matchId: string) {
  const [news, prediction] = await Promise.allSettled([
    searchNews(matchId),
    generatePrediction(matchId),
  ]);
  return {
    news: news.status === 'fulfilled' ? news.value : null,
    prediction: prediction.status === 'fulfilled' ? prediction.value : null,
  };
}
```

---

## Gemini JSON Mode

```ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const PredictionSchema = z.object({
  outcome: z.enum(['home', 'draw', 'away']),
  confidence: z.enum(['low', 'medium', 'high']),
  reasoning: z.string(),
});

export async function generatePrediction(input: PredictionInput) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent(buildPrompt(input));
  const json = JSON.parse(result.response.text());

  const parsed = PredictionSchema.safeParse(json);
  if (!parsed.success) return null;

  return parsed.data;
}
```

---

## Supabase

### Server Client (Server Actions, API Routes)

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!, // bypasses RLS
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );
}
```

### Browser Client (Client Components)

```ts
import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, // RLS enforced
  );
}
```

---

## API Security Checklist

- [ ] All `process.env.*KEY*` references are in `src/lib/` or `src/proxy.ts` only
- [ ] No API key variable appears in any file under `src/app/` or `src/components/`
- [ ] `.env.local` is listed in `.gitignore`
- [ ] Server Actions are in files with `'use server'` directive at the top
- [ ] API responses are sanitised/typed before being passed to the client

---

## Zod Validation Checklist

- [ ] Every external API response is validated with a `z.object({...})` schema
- [ ] Validation errors are caught and returned as `null` (not thrown to the client)
- [ ] Zod schemas are co-located with their lib file (e.g., `src/lib/odds.schema.ts`)
- [ ] No `any` type used — all shapes inferred from Zod schemas with `z.infer<typeof Schema>`
- [ ] `safeParse()` used instead of `parse()` to avoid unhandled throws

---

## Environment Variables Required

```bash
# API Sources
ODDS_API_KEY=
FOOTBALL_API_KEY=
TAVILY_API_KEY=

# Gemini AI
GOOGLE_API_KEY=

# Supabase (new key format)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=  # browser-safe (replaces ANON_KEY)
SUPABASE_SECRET_KEY=                   # server-only, bypasses RLS (replaces SERVICE_ROLE_KEY)
```
