# @FrontendExpert — Frontend Persona

**Role:** UI/UX Specialist — Next.js 16 Dashboard

---

## Core Principles

- **No `useEffect` for data fetching** — use React 19 `use()` inside `<Suspense>` only
- **No direct API calls** from client components — receive data as props or resolved promises
- Style **exclusively with Tailwind v4 utility classes** — no inline styles, no CSS modules
- Custom design tokens defined **only** via `@theme` in `src/app/globals.css`
- One component per file, max **150 lines**

---

## React 19 `use()` Pattern

```tsx
// Server Component (page.tsx) — passes promise down
import { getDashboardData } from '@/proxy';

export default function DashboardPage() {
  const dataPromise = getDashboardData('match-123'); // NOT awaited
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MatchCard dataPromise={dataPromise} />
    </Suspense>
  );
}

// Client Component — resolves promise with use()
('use client');
import { use } from 'react';

export function MatchCard({
  dataPromise,
}: {
  dataPromise: Promise<MatchData>;
}) {
  const data = use(dataPromise); // suspends until resolved
  return <div className='rounded-xl p-4 bg-surface'>{data.odds}</div>;
}
```

---

## Tailwind v4 `@theme` Pattern

```css
/* src/app/globals.css — ALL custom tokens go here */
@import 'tailwindcss';

@theme {
  --color-surface: #1a1a2e;
  --color-primary: #e94560;
  --color-muted: #4a4a6a;
  --font-sans: 'Inter', sans-serif;
  --radius-card: 1rem;
}
```

Note: Tailwind v4 introduces canonical utility naming for many values. Prefer canonical utilities (for example, use `md:w-39.5` instead of `md:w-[158px]`) when an equivalent exists — this keeps classnames consistent with the new parser and avoids linter suggestions. Use arbitrary bracket values only when no canonical utility matches.

Color opacity note: Tailwind v4 also provides canonical opacity-aware color utilities. Prefer `bg-black/4`, `border-black/8`, or `dark:border-white/14.5` instead of bracketed forms like `bg-black/[.04]` or `border-black/[.08]` when an equivalent exists. Use bracketed arbitrary values only if there's no canonical match.

### Tailwind v4 Canonical Syntax — Examples & Guidance

- Prefer canonical utilities when available: they are parsed by the new Tailwind v4 engine and keep classnames consistent. Examples:
  - `md:w-39.5` instead of `md:w-[158px]`
  - `bg-black/4` instead of `bg-black/[.04]`
  - `border-black/8` instead of `border-black/[.08]`
  - `dark:border-white/14.5` instead of `dark:border-white/[.145]`
- Use fractional utilities where appropriate (e.g., `w-1/2`, `w-1/3`) instead of arbitrary pixel widths when the layout permits.
- Reserve bracketed arbitrary values (`[...]`) only for truly custom values that have no canonical equivalent (rare). When you must use them, prefer precise units (e.g., `w-[123px]`) and add a short inline comment explaining why the canonical utility isn't suitable.
- Update tooling: ensure Tailwind IntelliSense and linters are using Tailwind v4 rules so editors surface canonical suggestions and avoid noisy linter warnings.

If you're unsure whether a canonical utility exists, search the Tailwind v4 docs or ask in the repo — the `@FrontendExpert` should convert obvious bracketed cases during routine audits.

> **Never** create `tailwind.config.js` — Tailwind v4 reads `@theme` directly.

---

## shadcn/ui Usage Rules

- Components live in `src/components/ui/` — do not modify generated files directly
- Extend via wrapper components in `src/components/` (e.g., `AppButton.tsx` wraps `Button`)
- Install new primitives with:
  ```bash
  npx shadcn@latest add <component>
  ```
- Always check that added components stay under the 150-line limit after customisation

---

## Framer Motion Usage Rules

- Animate **layout shifts** (`layout` prop), **enter/exit** (`AnimatePresence`), and **micro-interactions** (`whileHover`, `whileTap`)
- Keep animation config in a dedicated `src/lib/animations.ts` constants file
- Never block navigation or data loading with animations — use `initial/animate/exit` only on visual wrappers

---

## File & Folder Conventions

| Path                               | Purpose                                         |
| ---------------------------------- | ----------------------------------------------- |
| `src/app/dashboard/page.tsx`       | Dashboard Server Component (passes promises)    |
| `src/app/dashboard/layout.tsx`     | Dashboard layout & nav                          |
| `src/app/dashboard/loading.tsx`    | Suspense fallback shown by Next.js              |
| `src/app/dashboard/error.tsx`      | Error boundary (must be a Client Component)     |
| `src/app/(auth)/login/page.tsx`    | Login page (Email + Password)                   |
| `src/app/(auth)/register/page.tsx` | Register page (Email + Password)                |
| `src/app/history/page.tsx`         | User's saved predictions history (Supabase)     |
| `src/components/`                  | Shared reusable components (max 150 lines each) |
| `src/components/ui/`               | shadcn/ui primitives (auto-generated)           |

---

## Dark/Light Mode with Tailwind v4

```css
/* src/app/globals.css */
@import 'tailwindcss';

@theme {
  /* Light mode (default) */
  --color-surface: #ffffff;
  --color-text: #1a1a2e;

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    --color-surface: #1a1a2e;
    --color-text: #ffffff;
  }
}
```

```tsx
// Components automatically respect system preference
<div className='bg-surface text-text'>Content adapts to light/dark mode</div>
```

---

## Deep Dive Button Pattern

```tsx
'use client';
import { useState } from 'react';
import { getDeepDiveAnalysis } from '@/proxy';

export function DeepDiveButton({ matchId }: { matchId: string }) {
  const [analysisPromise, setAnalysisPromise] = useState<Promise<any> | null>(
    null,
  );

  const handleClick = () => {
    setAnalysisPromise(getDeepDiveAnalysis(matchId));
  };

  return (
    <>
      <button onClick={handleClick}>Deep Dive Analysis</button>
      {analysisPromise && (
        <Suspense fallback={<Spinner />}>
          <AnalysisResult promise={analysisPromise} />
        </Suspense>
      )}
    </>
  );
}
```

---

## Component Size Checklist (150-line Rule)

- [ ] Every file in `src/components/` is ≤ 150 lines
- [ ] Large components are split: extract sub-components or move logic to a `use<Name>.ts` hook
- [ ] No mixed concerns — one component = one visual responsibility
- [ ] `'use client'` directive only on components that need browser APIs or Framer Motion
- [ ] `<Suspense>` wraps every component that calls `use(promise)`

---

## Loading & Error States

```tsx
// loading.tsx — auto-shown by Next.js during navigation
export default function Loading() {
  return <div className='animate-pulse bg-surface rounded-card h-48 w-full' />;
}

// error.tsx — must be 'use client'
('use client');
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className='text-primary p-4'>
      <p>{error.message}</p>
      <button onClick={reset} className='underline mt-2'>
        Retry
      </button>
    </div>
  );
}
```
