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

| File                                 | Purpose                                |
| ------------------------------------ | -------------------------------------- |
| `src/app/(auth)/login/page.tsx`      | Login page UI                          |
| `src/app/(auth)/login/actions.ts`    | Sign-in Server Action                  |
| `src/app/(auth)/register/page.tsx`   | Registration page UI                   |
| `src/app/(auth)/register/actions.ts` | Sign-up Server Action                  |
| `src/app/(auth)/logout/actions.ts`   | Sign-out Server Action                 |
| `src/app/auth/callback/route.ts`     | OAuth/Email confirmation callback      |
| `src/middleware.ts`                  | Auth middleware (optional route guard) |

---

## Auth Security Checklist

- [ ] All auth pages are inside `(auth)` route group (no layout inheritance from dashboard)
- [ ] `SUPABASE_SECRET_KEY` never appears in `src/app/` or `src/components/`
- [ ] Email confirmation is enabled in Supabase dashboard (Settings > Auth > Email)
- [ ] Password strength requirements configured (min 8 chars, uppercase, number, symbol)
- [ ] Rate limiting enabled on auth endpoints (Supabase dashboard > Auth > Rate Limits)
- [ ] All protected routes check `getUser()` in Server Component before rendering
- [ ] `onAuthStateChange` subscription is cleaned up in `useEffect` return
- [ ] RLS policies are tested for both authenticated and anonymous users

---

## Middleware Pattern (Optional Route Guard)

```ts
// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users trying to access protected routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from auth pages
  if (
    user &&
    (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/register'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Integration with @BackendExpert

When a user is authenticated, their `user_id` (from `auth.uid()`) is automatically available in:

- RLS policies (`auth.uid()`)
- Server Actions (`const { data: { user } } = await supabase.auth.getUser()`)
- Database triggers (`auth.uid()` in PostgreSQL functions)

**Example: Saving a prediction with user context**

```ts
// src/app/dashboard/actions.ts
'use server';

import { createSupabaseServer } from '@/lib/supabase';

export async function savePrediction(matchId: string, prediction: any) {
  const supabase = createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.from('predictions').insert({
    user_id: user.id, // RLS policy enforces this matches auth.uid()
    match_id: matchId,
    prediction_data: prediction,
  });

  if (error) throw error;
  return data;
}
```
