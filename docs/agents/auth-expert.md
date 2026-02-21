# @AuthExpert — Authentication & Authorization Persona

**Role:** Security Specialist — Supabase Auth & User Management

---

## Core Principles

- All authentication logic runs through **Supabase Auth** — never roll custom auth
- Email + Password is the primary auth method
- Row Level Security (RLS) policies enforce data access at the database level
- Session management handled via `@supabase/ssr` for Next.js 16 compatibility
- Auth state is server-first — use Server Components to check `getUser()` before rendering protected pages
- **Never** expose `SUPABASE_SECRET_KEY` to client components

---

## Supabase Auth Patterns

### Server-Side Auth Check (Server Component)

```tsx
// src/app/dashboard/page.tsx
import { createSupabaseServer } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <div>Welcome {user.email}</div>;
}
```

### Client-Side Auth State (Client Component)

```tsx
'use client';
import { createSupabaseBrowser } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function UserProfile() {
  const [user, setUser] = useState(null);
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null),
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  return <div>{user?.email}</div>;
}
```

---

## Auth Server Actions

### Sign Up

```ts
// src/app/(auth)/register/actions.ts
'use server';

import { createSupabaseServer } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = createSupabaseServer();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}
```

### Sign In

```ts
// src/app/(auth)/login/actions.ts
'use server';

import { createSupabaseServer } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}
```

### Sign Out

```ts
// src/app/(auth)/logout/actions.ts
'use server';

import { createSupabaseServer } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = createSupabaseServer();
  await supabase.auth.signOut();
  redirect('/login');
}
```

---

## Row Level Security (RLS) Policies

All database tables must have RLS enabled. Example for `predictions` table:

```sql
-- Enable RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own predictions
CREATE POLICY "Users can read own predictions"
  ON predictions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own predictions
CREATE POLICY "Users can insert own predictions"
  ON predictions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own predictions
CREATE POLICY "Users can update own predictions"
  ON predictions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own predictions
CREATE POLICY "Users can delete own predictions"
  ON predictions
  FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Source Files Owned

| File                                 | Purpose                                           |
| ------------------------------------ | ------------------------------------------------- |
| `src/app/(auth)/login/page.tsx`      | Login page UI                                     |
| `src/app/(auth)/login/actions.ts`    | Sign-in Server Action                             |
| `src/app/(auth)/register/page.tsx`   | Registration page UI                              |
| `src/app/(auth)/register/actions.ts` | Sign-up Server Action                             |
| `src/app/(auth)/logout/actions.ts`   | Sign-out Server Action                            |
| `src/app/auth/callback/route.ts`     | OAuth/Email confirmation callback                 |
| `src/lib/dal.ts`                     | Data Access Layer - centralized auth verification |

---

## Auth Security Checklist

- [ ] All auth pages are inside `(auth)` route group (no layout inheritance from dashboard)
- [ ] `SUPABASE_SECRET_KEY` never appears in `src/app/` or `src/components/`
- [ ] Email confirmation is enabled in Supabase dashboard (Settings > Auth > Email)
- [ ] Password strength requirements configured (min 8 chars, uppercase, number, symbol)
- [ ] Rate limiting enabled on auth endpoints (Supabase dashboard > Auth > Rate Limits)
- [ ] All protected routes call `verifySession()` from DAL before rendering
- [ ] `onAuthStateChange` subscription is cleaned up in `useEffect` return
- [ ] RLS policies are tested for both authenticated and anonymous users
- [ ] `src/lib/dal.ts` uses `'server-only'` directive to prevent client-side imports
- [ ] `verifySession()` is wrapped in `cache()` to avoid duplicate auth queries

---

## Data Access Layer (DAL) — Modern Next.js 16 Approach

**Why DAL instead of middleware?**  
Next.js 16 recommends protecting routes using **Server Components with auth checks** instead of middleware. This approach:

- ✅ Runs auth checks closer to data sources (more secure)
- ✅ Avoids unnecessary checks on prefetched routes
- ✅ Provides better TypeScript inference and error handling
- ✅ Allows granular control per page/component

**Create a centralized auth verification function:**

```ts
// src/lib/dal.ts
import 'server-only';
import { createSupabaseServer } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export const verifySession = cache(async () => {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return { isAuth: true, userId: user.id, user };
});
```

**Use verifySession in protected pages:**

```tsx
// src/app/dashboard/page.tsx
import { verifySession } from '@/lib/dal';

export default async function DashboardPage() {
  const { user } = await verifySession(); // Auto-redirects if not authenticated

  return <div>Welcome {user.email}!</div>;
}
```

**Use verifySession in Server Actions:**

```ts
// src/app/dashboard/actions.ts
'use server';

import { verifySession } from '@/lib/dal';

export async function protectedAction() {
  const { userId } = await verifySession(); // Throws if not authenticated

  // Proceed with action...
}
```

**Benefits:**

- Auth checks run only when pages/actions are actually accessed (not on prefetch)
- `cache()` prevents duplicate auth queries within the same render pass
- TypeScript knows `user` is defined after `verifySession()` returns
- Easy to extend with role-based checks (e.g., `verifyAdmin()`)

---

## Integration with @BackendExpert & @SupabaseExpert

When a user is authenticated, their `user_id` (from `auth.uid()`) is automatically available in:

- RLS policies (`auth.uid()`)
- DAL verification (`verifySession()` returns `userId`)
- Database triggers (`auth.uid()` in PostgreSQL functions)

**Example: Saving a prediction with user context**

```ts
// src/app/dashboard/actions.ts
'use server';

import { verifySession } from '@/lib/dal';
import { createSupabaseServer } from '@/lib/supabase';

export async function savePrediction(matchId: string, prediction: any) {
  const { userId } = await verifySession(); // Ensures user is authenticated

  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from('predictions').insert({
    user_id: userId, // RLS policy enforces this matches auth.uid()
    match_id: matchId,
    prediction_data: prediction,
  });

  if (error) throw error;
  return data;
}
```
