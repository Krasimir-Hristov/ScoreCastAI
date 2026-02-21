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

// TODO (@BackendExpert): Define proper Zod schema based on Odds API response
const OddsSchema = z.object({
  matchId: z.string(),
  homeOdds: z.number(),
  drawOdds: z.number(),
  awayOdds: z.number(),
});

export type Odds = z.infer<typeof OddsSchema>;

/**
 * Fetches betting odds for all today's matches.
 *
 * @returns A promise resolving to an array of odds objects.
 */
export async function fetchOdds(): Promise<Odds[]> {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    console.error('[odds] ODDS_API_KEY is not set.');
    return [];
  }

  // TODO (@BackendExpert): Replace stub with real Odds API call
  // const response = await fetch(`https://api.the-odds-api.com/v4/...`, {
  //   headers: { 'x-api-key': apiKey },
  // });
  // const json = await response.json();
  // const parsed = z.array(OddsSchema).safeParse(json);
  // return parsed.success ? parsed.data : [];

  // Stub — remove once API is wired up
  return [];
}
