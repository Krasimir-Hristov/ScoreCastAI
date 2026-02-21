/**
 * @file src/lib/football.ts
 *
 * @description
 * **Executable Skill — @BackendExpert**
 *
 * Football API integration for ScoreCast AI.
 * Fetches today's matches, team stats, and historical results.
 *
 * Security contract:
 * - `FOOTBALL_API_KEY` is accessed ONLY here via `process.env.FOOTBALL_API_KEY`
 * - This file must NEVER be imported by any Client Component
 * - Keep under 150 lines
 *
 * Dependencies:
 * - zod (validation)
 *
 * @example
 * import { fetchFixtures } from '@/lib/football';
 * const fixtures = await fetchFixtures(); // all today's matches
 */

import { z } from 'zod';

// TODO (@BackendExpert): Define proper Zod schema based on Football API response
const FixtureSchema = z.object({
  id: z.string(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  kickoffTime: z.string(),
});

export type Fixture = z.infer<typeof FixtureSchema>;

/**
 * Fetches all today's football fixtures.
 *
 * @returns A promise resolving to an array of fixture objects.
 */
export async function fetchFixtures(): Promise<Fixture[]> {
  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    console.error('[football] FOOTBALL_API_KEY is not set.');
    return [];
  }

  // TODO (@BackendExpert): Replace stub with real Football API call
  // const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/...`, {
  //   headers: { 'x-rapidapi-key': apiKey },
  // });
  // const json = await response.json();
  // const parsed = z.array(FixtureSchema).safeParse(json);
  // return parsed.success ? parsed.data : [];

  // Stub — remove once API is wired up
  return [];
}
