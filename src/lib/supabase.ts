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
 * - `SUPABASE_SECRET_KEY` is ONLY used in server-side contexts (bypasses RLS)
 * - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is safe for browser (enforces RLS)
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

/**
 * Creates a Supabase server client for use in Server Components and Server Actions.
 * Uses `SUPABASE_SECRET_KEY` which bypasses Row Level Security.
 *
 * @returns A Supabase server client instance.
 */
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
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookies can only be set in Server Actions or Route Handlers
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
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
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, // RLS enforced
  );
}
