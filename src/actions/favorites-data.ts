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
  const [favorites, matchData] = await Promise.all([
    getUserFavorites(),
    getMatchList(),
  ]);

  if (favorites.length === 0) return [];

  const favoriteMatchIds = new Set(favorites.map((f) => f.match_id));

  const favoritesWithData: FavoriteMatch[] = [];

  for (const fixture of matchData.fixtures) {
    const matchId = String(fixture.fixture.id);
    if (favoriteMatchIds.has(matchId)) {
      const matchOdds =
        matchData.odds.find((o) => String(o.id) === matchId) || null;
      favoritesWithData.push({
        matchId,
        fixture,
        odds: matchOdds,
      });
    }
  }

  return favoritesWithData;
}
