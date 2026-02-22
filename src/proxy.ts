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

import { fetchOdds } from '@/lib/odds';
import { fetchFixtures } from '@/lib/football';
import { searchNews } from '@/lib/tavily';
import { generatePrediction } from '@/lib/gemini';
import type { Odds } from '@/lib/odds';
import type { Fixture } from '@/lib/football';
import type { NewsItem } from '@/lib/tavily';
import type { PredictionOutput } from '@/lib/gemini';

export interface MatchListData {
  fixtures: Fixture[];
  odds: Odds[];
}

export interface DeepDiveData {
  news: NewsItem[] | null;
  prediction: PredictionOutput | null;
}

/**
 * Flow A: Fetches all today's matches + odds.
 * Used on dashboard page load — no matchId required.
 *
 * @returns A promise resolving to fixtures + odds arrays.
 */
export async function getMatchList(): Promise<MatchListData> {
  const [fixturesResult, oddsResult] = await Promise.allSettled([
    fetchFixtures(),
    fetchOdds(),
  ]);

  return {
    fixtures: fixturesResult.status === 'fulfilled' ? fixturesResult.value : [],
    odds: oddsResult.status === 'fulfilled' ? oddsResult.value : [],
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
  // Extract match info from fixtures (would be keyed by matchId in real app)
  const fixtures = await fetchFixtures();
  const match = fixtures.find(
    (f: Fixture) =>
      String(f.fixture.id) === matchId || f.fixture.id === Number(matchId),
  );

  if (!match) {
    return { news: null, prediction: null };
  }

  const homeTeam = match.teams.home.name;
  const awayTeam = match.teams.away.name;

  // Fetch news first
  const newsResult = await Promise.allSettled([
    searchNews(`${homeTeam} vs ${awayTeam}`),
  ]);

  const news = newsResult[0].status === 'fulfilled' ? newsResult[0].value : [];
  const newsSnippets: string[] = news
    .map((n: NewsItem) => n.title || n.description || '')
    .filter((text): text is string => Boolean(text))
    .slice(0, 3);

  // Generate prediction with news context
  const predictionResult = await generatePrediction({
    homeTeam,
    awayTeam,
    recentNews: newsSnippets,
  });

  return {
    news: news.length > 0 ? news : null,
    prediction: predictionResult,
  };
}
