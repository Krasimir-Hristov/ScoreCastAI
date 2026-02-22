/**
 * @file src/lib/odds.ts
 *
 * @description
 * **Executable Skill — @BackendExpert**
 *
 * Odds API integration for ScoreCast AI.
 * Fetches real-time betting odds from multiple bookmakers.
 *
 * Security contract:
 * - `ODDS_API_KEY` is accessed ONLY here via `process.env.ODDS_API_KEY`
 * - This file must NEVER be imported by any Client Component
 * - Keep under 150 lines
 *
 * Dependencies:
 * - zod (validation)
 *
 * @example
 * import { fetchOdds } from '@/lib/odds';
 * const odds = await fetchOdds(); // all today's matches
 */

import { z } from 'zod';

// Zod schema for odds response from The Odds API
const OddsSchema = z.object({
  id: z.string(),
  sport_key: z.string(),
  sport_title: z.string(),
  commence_time: z.string().datetime(),
  home_team: z.string(),
  away_team: z.string(),
  bookmakers: z
    .array(
      z.object({
        key: z.string(),
        markets: z.array(
          z.object({
            key: z.string(),
            outcomes: z.array(
              z.object({
                name: z.string(),
                price: z.number(),
              }),
            ),
          }),
        ),
      }),
    )
    .optional(),
});

export type Odds = z.infer<typeof OddsSchema>;

/**
 * Fetches betting odds for all today's matches.
 * Uses The Odds API for real-time odds data.
 *
 * @returns A promise resolving to an array of odds objects.
 */
export async function fetchOdds(): Promise<Odds[]> {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    console.error('[odds] ODDS_API_KEY is not set.');
    return [];
  }

  try {
    // QA: 🟢 INFO — Hardcoded to Premier League (soccer_epl)
    // QA: Future: Make sport_key configurable for multi-league support
    const response = await fetch(
      'https://api.the-odds-api.com/v4/sports/soccer_epl/odds',
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    if (!response.ok) {
      console.error(`[odds] API error: ${response.status}`);
      return [];
    }

    const json = await response.json();
    const parsed = z.array(OddsSchema).safeParse(json.data || []);

    return parsed.success ? parsed.data : [];
  } catch (error) {
    console.error('[odds] fetch error:', error);
    return [];
  }
}
