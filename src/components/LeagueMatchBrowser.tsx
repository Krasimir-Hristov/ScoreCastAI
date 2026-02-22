'use client';

import { use, useMemo, useState } from 'react';

import type { MatchListData } from '@/lib/proxy';
import type { Odds } from '@/lib/odds';
import type { Fixture } from '@/lib/football';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MatchCard } from '@/components/MatchCard';

type LeagueOption = { id: number; name: string };

function teamKey(home: string, away: string) {
  return `${home.toLowerCase()}__${away.toLowerCase()}`;
}

function bestOddsForFixture(
  fixture: Fixture,
  oddsMap: Map<string, Odds>,
): Odds | null {
  const home = fixture.teams.home.name;
  const away = fixture.teams.away.name;
  return (
    oddsMap.get(teamKey(home, away)) ?? oddsMap.get(teamKey(away, home)) ?? null
  );
}

export function LeagueMatchBrowser({
  dataPromise,
}: {
  dataPromise: Promise<MatchListData>;
}) {
  const data = use(dataPromise);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | 'all'>(
    'all',
  );

  const oddsMap = useMemo(() => {
    const map = new Map<string, Odds>();
    for (const o of data.odds) {
      map.set(teamKey(o.home_team, o.away_team), o);
    }
    return map;
  }, [data.odds]);

  const leagues = useMemo(() => {
    const map = new Map<number, string>();
    for (const f of data.fixtures) {
      map.set(f.league.id, f.league.name);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }) satisfies LeagueOption)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data.fixtures]);

  const fixtures = useMemo(() => {
    const filtered =
      selectedLeagueId === 'all'
        ? data.fixtures
        : data.fixtures.filter((f) => f.league.id === selectedLeagueId);

    return [...filtered].sort((a, b) => {
      const ad = new Date(a.fixture.date).getTime();
      const bd = new Date(b.fixture.date).getTime();
      return ad - bd;
    });
  }, [data.fixtures, selectedLeagueId]);

  const selectedLabel =
    selectedLeagueId === 'all'
      ? 'All leagues'
      : (leagues.find((l) => l.id === selectedLeagueId)?.name ?? 'League');

  return (
    <section className='space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Today’s matches
          </h1>
          <p className='text-sm text-muted-foreground'>
            Pick a league to narrow down the list.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <div className='text-sm text-muted-foreground'>
            {fixtures.length} match{fixtures.length === 1 ? '' : 'es'}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm'>
                League: {selectedLabel} <span aria-hidden='true'>▾</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='max-h-72 overflow-auto'>
              <DropdownMenuItem onSelect={() => setSelectedLeagueId('all')}>
                All leagues
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {leagues.map((l) => (
                <DropdownMenuItem
                  key={l.id}
                  onSelect={() => setSelectedLeagueId(l.id)}
                >
                  {l.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {fixtures.length === 0 ? (
        <div className='rounded-xl border bg-card p-6 text-sm text-muted-foreground'>
          No matches found for this league.
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {fixtures.map((fixture) => (
            <MatchCard
              key={fixture.fixture.id}
              fixture={fixture}
              odds={bestOddsForFixture(fixture, oddsMap)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
