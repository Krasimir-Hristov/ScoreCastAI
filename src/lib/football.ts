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

// Zod schema for fixture response from API Football
const FixtureSchema = z.object({
  fixture: z.object({
    id: z.number(),
    date: z.string(), // Removed .datetime() because API-Sports returns dates that Zod's strict datetime might reject
    status: z.object({
      long: z.string(),
    }),
  }),
  teams: z.object({
    home: z.object({
      id: z.number(),
      name: z.string(),
      logo: z.string().nullish(), // Changed to nullish to allow null values
    }),
    away: z.object({
      id: z.number(),
      name: z.string(),
      logo: z.string().nullish(), // Changed to nullish to allow null values
    }),
  }),
  league: z.object({
    id: z.number(),
    name: z.string(),
    logo: z.string().nullish(), // Changed to nullish to allow null values
  }),
});

export type Fixture = z.infer<typeof FixtureSchema>;

/**
 * Fetches football fixtures for a given date (default: today).
 *
 * @param date - Optional ISO date string (e.g., '2026-02-22')
 * @returns A promise resolving to an array of fixture objects.
 */
export async function fetchFixtures(date?: string): Promise<Fixture[]> {
  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    console.error('[football] FOOTBALL_API_KEY is not set.');
    return [];
  }

  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${targetDate}`,
      {
        headers: {
          'x-apisports-key': apiKey,
        },
      },
    );

    if (!response.ok) {
      console.error(`[football] API error: ${response.status}`);
      return [];
    }

    const json = await response.json();
    const parsed = z.array(FixtureSchema).safeParse(json.response);

    if (!parsed.success) {
      console.error(
        '[football] Zod parsing error:',
        JSON.stringify(parsed.error.format(), null, 2),
      );
    }

    return parsed.success ? parsed.data : [];
  } catch (error) {
    console.error('[football] fetch error:', error);
    return [];
  }
}
