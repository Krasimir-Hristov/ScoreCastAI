/**
 * @file src/lib/supabase.ts
 *
 * @description
 * **Executable Skill — @BackendExpert**
 *
 * Supabase client factory for ScoreCast AI.
 * Provides both server and browser clients for Postgres + Auth.
 *
 * Security contract:
 * - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is used for both server and browser (enforces RLS)
 * - No secret key is exposed — all queries respect Row Level Security
 * - Keep under 150 lines
 *
 * Dependencies:
 * - @supabase/ssr (Next.js SSR helpers)
 * - @supabase/supabase-js (Supabase client)
 *
 * @example
 * // Server Component or Server Action
 * import { createSupabaseServer } from '@/lib/supabase';
 * const supabase = createSupabaseServer();
 *
 * // Client Component
 * import { createSupabaseBrowser } from '@/lib/supabase';
 * const supabase = createSupabaseBrowser();
 */

import { createServerClient, createBrowserClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase server client for use in Server Components and Server Actions.
 * Uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` which enforces Row Level Security.
 *
 * @returns A Supabase server client instance.
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies();

  // QA: @SupabaseExpert - Non-null assertions (!) used without preceding null checks for environment variables.
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, // enforces RLS
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Cookies can only be set in Server Actions or Route Handlers
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Cookies can only be deleted in Server Actions or Route Handlers
          }
        },
      },
    },
  );
}

/**
 * Creates a Supabase browser client for use in Client Components.
 * Uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` which enforces Row Level Security.
 *
 * @returns A Supabase browser client instance.
 */
export function createSupabaseBrowser() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, // RLS enforced
  );
}
