/**
 * @file src/lib/proxy.ts
 *
 * @description
 * **Executable Skill — @BackendExpert**
 *
 * Central server-side fetch orchestrator for ScoreCast AI.
 * This file provides distinct data flows:
 *
 * Flow A: `getMatchList()` — fetches all today's matches + odds (no matchId)
 * Flow B: `getDeepDiveNews(homeTeam, awayTeam)` — fetches Tavily news
 * Flow C: `generateMatchPrediction(homeTeam, awayTeam, news)` — runs Gemini prediction
 *
 * Security contract:
 * - NEVER import this file from a Client Component
 * - All `process.env.*KEY*` values are accessed only inside `src/lib/` modules
 * - This file must remain under 150 lines
 */

'use server';

import { fetchOdds } from '@/lib/odds';
import { fetchFixtures } from '@/lib/football';
import { searchMatchContext } from '@/lib/tavily';
import { generatePrediction } from '@/lib/gemini';
import type { Odds } from '@/lib/odds';
import type { Fixture } from '@/lib/football';
import type { NewsItem } from '@/lib/tavily';
import type { PredictionOutput } from '@/lib/gemini';

export interface MatchListData {
  fixtures: Fixture[];
  odds: Odds[];
}

const ALLOWED_LEAGUES = new Set([
  'UEFA Champions League',
  'UEFA Europa League',
  'UEFA Europa Conference League',
  'UEFA Conference League',
  'Premier League',
  'La Liga',
  'Primera Division',
  'Bundesliga',
  'Bundesliga 1',
  'Serie A',
  'Ligue 1',
  'Eredivisie',
  'Primeira Liga',
  'UEFA Nations League',
  'Euro Championship',
  'UEFA European Championship',
]);

/**
 * Flow A: Fetches all today's matches + odds.
 * Used on dashboard page load — no matchId required.
 */
export async function getMatchList(): Promise<MatchListData> {
  const [fixturesResult, oddsResult] = await Promise.allSettled([
    fetchFixtures(),
    fetchOdds(),
  ]);

  const allFixtures =
    fixturesResult.status === 'fulfilled' ? fixturesResult.value : [];

  const filteredFixtures = allFixtures.filter((f) =>
    ALLOWED_LEAGUES.has(f.league.name),
  );

  return {
    fixtures: filteredFixtures,
    odds: oddsResult.status === 'fulfilled' ? oddsResult.value : [],
  };
}

/**
 * Flow B: Deep Dive News for a specific match.
 * Triggered automatically when modal opens.
 */
export async function getDeepDiveNews(
  homeTeam: string,
  awayTeam: string,
): Promise<NewsItem[]> {
  return searchMatchContext(homeTeam, awayTeam);
}

/**
 * Flow C: Deep Dive Prediction for a specific match.
 * Triggered by user button click — runs Gemini inference.
 */
export async function generateMatchPrediction(
  homeTeam: string,
  awayTeam: string,
  news: NewsItem[],
): Promise<PredictionOutput | null> {
  const newsSnippets: string[] = news
    .map((n: NewsItem) => n.title || n.description || '')
    .filter((text): text is string => Boolean(text))
    .slice(0, 5);

  return generatePrediction({
    homeTeam,
    awayTeam,
    recentNews: newsSnippets,
  });
}
