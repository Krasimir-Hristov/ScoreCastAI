/**
 * @file src/proxy.ts
 *
 * @description
 * **Executable Skill — @BackendExpert**
 *
 * Central server-side fetch orchestrator for ScoreCast AI.
 * This file provides two distinct data flows:
 *
 * Flow A: `getMatchList()` — fetches all today's matches + odds (no matchId)
 * Flow B: `getDeepDiveAnalysis(matchId)` — fetches Tavily news + Gemini prediction for one match
 *
 * Security contract:
 * - NEVER import this file from a Client Component
 * - All `process.env.*KEY*` values are accessed only inside `src/lib/` modules
 * - This file must remain under 150 lines
 *
 * @example
 * // Flow A — Server Component (dashboard page load)
 * import { getMatchList } from '@/proxy';
 * const matchesPromise = getMatchList();
 *
 * // Flow B — Client Component (Deep Dive button)
 * import { getDeepDiveAnalysis } from '@/proxy';
 * const analysisPromise = getDeepDiveAnalysis('match-123');
 */

'use server';

// TODO (@BackendExpert): Import and wire up lib modules once implemented
// import { fetchOdds }         from '@/lib/odds';
// import { fetchFixtures }     from '@/lib/football';
// import { searchNews }        from '@/lib/tavily';
// import { generatePrediction } from '@/lib/gemini';

export interface MatchListData {
  fixtures: unknown[];
  odds: unknown[];
}

export interface DeepDiveData {
  news: unknown | null;
  prediction: unknown | null;
}

/**
 * Flow A: Fetches all today's matches + odds.
 * Used on dashboard page load — no matchId required.
 *
 * @returns A promise resolving to fixtures + odds arrays.
 */
export async function getMatchList(): Promise<MatchListData> {
  // TODO (@BackendExpert): Replace stubs with real lib calls
  const [fixtures, odds] = await Promise.allSettled([
    Promise.resolve([]), // fetchFixtures()
    Promise.resolve([]), // fetchOdds()
  ]);

  return {
    fixtures: fixtures.status === 'fulfilled' ? fixtures.value : [],
    odds: odds.status === 'fulfilled' ? odds.value : [],
  };
}

/**
 * Flow B: Deep Dive Analysis for a specific match.
 * Triggered by user button click — fetches Tavily news + runs Gemini inference.
 *
 * @param matchId - The unique identifier for the match.
 * @returns A promise resolving to news + prediction.
 */
export async function getDeepDiveAnalysis(
  matchId: string,
): Promise<DeepDiveData> {
  // TODO (@BackendExpert): Replace stubs with real lib calls
  const [news, prediction] = await Promise.allSettled([
    Promise.resolve(null), // searchNews(matchId)
    Promise.resolve(null), // generatePrediction(matchId)
  ]);

  return {
    news: news.status === 'fulfilled' ? news.value : null,
    prediction: prediction.status === 'fulfilled' ? prediction.value : null,
  };
}
