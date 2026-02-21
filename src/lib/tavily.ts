/**
 * @file src/lib/tavily.ts
 *
 * @description
 * **Executable Skill — @BackendExpert**
 *
 * Tavily AI contextual search integration for ScoreCast AI.
 * Performs targeted web searches for match-specific news (injuries, lineup changes, etc.).
 *
 * Security contract:
 * - `TAVILY_API_KEY` is accessed ONLY here via `process.env.TAVILY_API_KEY`
 * - This file must NEVER be imported by any Client Component
 * - Keep under 150 lines
 *
 * Dependencies:
 * - zod (validation)
 *
 * @example
 * import { searchNews } from '@/lib/tavily';
 * const news = await searchNews('Real Madrid vs Barcelona');
 */

import { z } from 'zod';

// TODO (@BackendExpert): Define proper Zod schema based on Tavily API response
const NewsSchema = z.object({
  title: z.string(),
  snippet: z.string(),
  url: z.string(),
});

export type NewsItem = z.infer<typeof NewsSchema>;

/**
 * Searches for news related to a specific match.
 *
 * @param query - The search query (e.g., team names, match ID).
 * @returns A promise resolving to an array of news items.
 */
export async function searchNews(query: string): Promise<NewsItem[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    console.error('[tavily] TAVILY_API_KEY is not set.');
    return [];
  }

  // TODO (@BackendExpert): Replace stub with real Tavily API call
  // const response = await fetch('https://api.tavily.com/search', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ api_key: apiKey, query }),
  // });
  // const json = await response.json();
  // const parsed = z.array(NewsSchema).safeParse(json.results);
  // return parsed.success ? parsed.data : [];

  // Stub — remove once API is wired up
  return [];
}
