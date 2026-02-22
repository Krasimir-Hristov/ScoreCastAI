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

// Allowed leagues and countries for match filtering
const ALLOWED_LEAGUES = [
  // UEFA Competitions (no country filter needed)
  { name: 'UEFA Champions League', country: null },
  { name: 'Champions League', country: null },
  { name: 'UEFA Europa League', country: null },
  { name: 'Europa League', country: null },
  { name: 'UEFA Europa Conference League', country: null },
  { name: 'UEFA Conference League', country: null },
  { name: 'Conference League', country: null },
  { name: 'UEFA Nations League', country: null },
  { name: 'UEFA European Championship', country: null },
  { name: 'Euro Championship', country: null },
  { name: 'European Championship', country: null },

  // Top National Leagues (with country filter)
  { name: 'Premier League', country: 'England' },
  { name: 'La Liga', country: 'Spain' },
  { name: 'Primera Division', country: 'Spain' },
  { name: 'Bundesliga', country: 'Germany' },
  { name: 'Serie A', country: 'Italy' },
  { name: 'Ligue 1', country: 'France' },
  { name: 'Eredivisie', country: 'Netherlands' },
  { name: 'Primeira Liga', country: 'Portugal' },
];

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

  const filteredFixtures = allFixtures.filter((fixture) => {
    return ALLOWED_LEAGUES.some((allowed) => {
      const nameMatches = fixture.league.name === allowed.name;
      const countryMatches =
        allowed.country === null || fixture.league.country === allowed.country;
      return nameMatches && countryMatches;
    });
  });

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
