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

// Zod schema for news items from Tavily API
const NewsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  url: z.string().url(),
  source: z.string().optional(),
  published_date: z.string().optional(),
});

export type NewsItem = z.infer<typeof NewsSchema>;

async function tavilySearch(
  apiKey: string,
  query: string,
): Promise<NewsItem[]> {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        include_domains: [
          'bbc.com',
          'espn.com',
          'skysports.com',
          'goal.com',
          'transfermarkt.com',
        ],
        max_results: 5,
      }),
    });
    if (!response.ok) {
      console.warn(
        `[tavily] API error: ${response.status} for query "${query}"`,
      );
      return [];
    }
    const json = await response.json();
    const parsed = z.array(NewsSchema).safeParse(json.results || []);
    return parsed.success ? parsed.data : [];
  } catch (error) {
    console.warn('[tavily] fetch error:', error);
    return [];
  }
}

/**
 * Single targeted search (e.g. "Arsenal vs Chelsea").
 */
export async function searchNews(query: string): Promise<NewsItem[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn('[tavily] TAVILY_API_KEY is not set.');
    return [];
  }
  return tavilySearch(apiKey, query);
}

/**
 * Comprehensive match context: match preview + home team injuries/suspensions
 * + away team injuries/suspensions — all in parallel, deduplicated by URL.
 */
export async function searchMatchContext(
  homeTeam: string,
  awayTeam: string,
): Promise<NewsItem[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn('[tavily] TAVILY_API_KEY is not set.');
    return [];
  }

  const results = await Promise.allSettled([
    tavilySearch(apiKey, `${homeTeam} vs ${awayTeam} match preview`),
    tavilySearch(apiKey, `${homeTeam} injury suspension lineup`),
    tavilySearch(apiKey, `${awayTeam} injury suspension lineup`),
  ]);

  const seen = new Set<string>();
  const items: NewsItem[] = [];
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const item of r.value) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        items.push(item);
      }
    }
  }
  return items;
}
