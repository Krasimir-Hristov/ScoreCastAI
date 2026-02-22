import type { Odds } from '@/lib/odds';
import type { Fixture } from '@/lib/football';

export type LeagueOption = { id: number; name: string; country: string };

export function teamKey(home: string, away: string) {
  return `${home.toLowerCase()}__${away.toLowerCase()}`;
}

export function bestOddsForFixture(
  fixture: Fixture,
  oddsMap: Map<string, Odds>,
): Odds | null {
  const home = fixture.teams.home.name;
  const away = fixture.teams.away.name;
  return (
    oddsMap.get(teamKey(home, away)) ?? oddsMap.get(teamKey(away, home)) ?? null
  );
}
