/**
 * @file src/lib/league-info.ts
 *
 * @description
 * League metadata: country/confederation for each supported league.
 */

export const LEAGUE_INFO: Record<string, { country: string; federation: string }> =
  {
    'UEFA Champions League': {
      country: 'International',
      federation: 'UEFA',
    },
    'UEFA Europa League': {
      country: 'International',
      federation: 'UEFA',
    },
    'UEFA Europa Conference League': {
      country: 'International',
      federation: 'UEFA',
    },
    'UEFA Conference League': {
      country: 'International',
      federation: 'UEFA',
    },
    'Premier League': {
      country: 'England',
      federation: 'FA',
    },
    'La Liga': {
      country: 'Spain',
      federation: 'RFEF',
    },
    'Primera Division': {
      country: 'Spain',
      federation: 'RFEF',
    },
    'Bundesliga': {
      country: 'Germany',
      federation: 'DFB',
    },
    'Bundesliga 1': {
      country: 'Germany',
      federation: 'DFB',
    },
    'Serie A': {
      country: 'Italy',
      federation: 'FIGC',
    },
    'Ligue 1': {
      country: 'France',
      federation: 'FFF',
    },
    'Eredivisie': {
      country: 'Netherlands',
      federation: 'KNVB',
    },
    'Primeira Liga': {
      country: 'Portugal',
      federation: 'FPF',
    },
    'UEFA Nations League': {
      country: 'International',
      federation: 'UEFA',
    },
    'Euro Championship': {
      country: 'International',
      federation: 'UEFA',
    },
    'UEFA European Championship': {
      country: 'International',
      federation: 'UEFA',
    },
  };

export function getLeagueInfo(
  leagueName: string,
): { country: string; federation: string } {
  return (
    LEAGUE_INFO[leagueName] ?? {
      country: 'Unknown',
      federation: 'Unknown',
    }
  );
}
