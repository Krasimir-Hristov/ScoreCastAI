'use server';

import { getUserFavorites } from '@/actions/favorites';
import { getMatchList, type MatchListData } from '@/lib/proxy';

export interface FavoriteMatch {
  matchId: string;
  fixture: MatchListData['fixtures'][0];
  odds: MatchListData['odds'][0] | null;
}

/**
 * Get match data for all user favorites
 */
export async function getFavoritesWithData(): Promise<FavoriteMatch[]> {
  const [favoritesResult, matchDataResult] = await Promise.allSettled([
    getUserFavorites(),
    getMatchList(),
  ]);

  if (favoritesResult.status === 'rejected') {
    console.error('Failed to fetch favorites:', favoritesResult.reason);
    return [];
  }

  const favorites = favoritesResult.value;
  if (favorites.length === 0) return [];

  // If match fetching fails, return favorites without odds/fixture data (broken UI but better than crash)
  // Or simply return empty if we decide strict dependency.
  // Given the UI expects fixtures, we probably can't render much without match data.
  // But let's check if matchData succeeded.
  if (matchDataResult.status === 'rejected') {
    console.error('Failed to fetch match list:', matchDataResult.reason);
    return []; // Can't render favorites without match data
  }

  const matchData = matchDataResult.value;

  const results: FavoriteMatch[] = [];

  for (const favorite of favorites) {
    // Find the fixture for this favorite
    // match_id is stored as string in DB, but fixture.id is number from API
    const fixture = matchData.fixtures.find(
      (f) => String(f.fixture.id) === favorite.match_id,
    );

    if (!fixture) {
      // If fixture not found in today's list, skipping.
      // In a real app we might fetch specific match details separately
      // if it's not in the daily list.
      continue;
    }

    // Find the odds for this match
    // Matching by team names normalized to lower case.
    // Ideally use more sophisticated fuzzy matching or shared IDs if available.
    const matchOdds =
      matchData.odds.find((o) => {
        const fixtureHome = fixture.teams.home.name.toLowerCase();
        const fixtureAway = fixture.teams.away.name.toLowerCase();
        const oddsHome = o.home_team.toLowerCase();
        const oddsAway = o.away_team.toLowerCase();

        // Simple containment check as names might slightly differ (e.g. "Man City" vs "Manchester City")
        // Or exact match if possible. Let's try flexible matching.
        return (
          (oddsHome.includes(fixtureHome) || fixtureHome.includes(oddsHome)) &&
          (oddsAway.includes(fixtureAway) || fixtureAway.includes(oddsAway))
        );
      }) || null;

    results.push({
      matchId: favorite.match_id,
      fixture,
      odds: matchOdds,
    });
  }

  return results;
}
