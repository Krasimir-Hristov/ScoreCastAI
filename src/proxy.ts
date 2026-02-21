/**
 * @file src/proxy.ts
 *
 * @description
 * **Executable Skill — @BackendExpert**
 *
 * Central server-side fetch orchestrator for ScoreCast AI.
 * This file is the single entry point for all external API calls.
 *
 * Responsibilities:
 * - Coordinate parallel requests to Odds API, Football API, and Tavily
 * - Call Gemini 2.5 Flash for AI-generated predictions
 * - Return a typed, serialisable Promise to be consumed via React 19 `use()`
 *
 * Security contract:
 * - NEVER import this file from a Client Component or `src/app/` page directly
 * - All `process.env.*KEY*` values are accessed only inside `src/lib/` modules
 * - This file must remain under 150 lines — split into sub-modules if needed
 *
 * @example
 * // In a Next.js 16 Server Component (page.tsx):
 * import { getDashboardData } from '@/proxy';
 *
 * export default function DashboardPage() {
 *   const dataPromise = getDashboardData('match-123'); // NOT awaited
 *   return (
 *     <Suspense fallback={<LoadingSkeleton />}>
 *       <MatchCard dataPromise={dataPromise} />
 *     </Suspense>
 *   );
 * }
 */

'use server';

// TODO (@BackendExpert): Import and wire up lib modules once implemented
// import { fetchOdds }    from '@/lib/odds';
// import { fetchFixtures } from '@/lib/football';
// import { searchNews }    from '@/lib/tavily';
// import { generatePrediction } from '@/lib/gemini';

export interface DashboardData {
  odds: unknown | null;
  fixtures: unknown | null;
  news: unknown | null;
  prediction: string | null;
}

/**
 * Fetches all dashboard data in parallel using Promise.allSettled.
 * Partial failures are handled gracefully — a failed source returns null.
 *
 * @param matchId - The unique identifier for the match to fetch data for.
 * @returns A promise resolving to a DashboardData object.
 */
export async function getDashboardData(
  matchId: string,
): Promise<DashboardData> {
  // TODO (@BackendExpert): Replace stubs with real lib calls
  const [odds, fixtures, news, prediction] = await Promise.allSettled([
    Promise.resolve(null), // fetchOdds(matchId)
    Promise.resolve(null), // fetchFixtures(matchId)
    Promise.resolve(null), // searchNews(matchId)
    Promise.resolve(null), // generatePrediction(matchId)
  ]);

  return {
    odds: odds.status === 'fulfilled' ? odds.value : null,
    fixtures: fixtures.status === 'fulfilled' ? fixtures.value : null,
    news: news.status === 'fulfilled' ? news.value : null,
    prediction: prediction.status === 'fulfilled' ? prediction.value : null,
  };
}
