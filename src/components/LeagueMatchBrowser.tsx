'use client';

import { use, useMemo, useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';

import type { MatchListData } from '@/lib/proxy';
import type { Odds } from '@/lib/odds';
import type { Favorite } from '@/actions/favorites';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MatchCard } from '@/components/MatchCard';
import {
  bestOddsForFixture,
  teamKey,
  type LeagueOption,
} from '@/components/leagueMatchBrowser.utils';

export function LeagueMatchBrowser({
  dataPromise,
  favoritesPromise,
}: {
  dataPromise: Promise<MatchListData>;
  favoritesPromise: Promise<Favorite[]>;
}) {
  const data = use(dataPromise);
  const favorites = use(favoritesPromise);

  const favoriteMatchIds = useMemo(() => {
    return new Set(favorites.map((f) => f.match_id));
  }, [favorites]);

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
    // Deduplicate by name and include country from API league data
    const nameSet = new Set<string>();
    const result: LeagueOption[] = [];
    for (const f of data.fixtures) {
      if (!nameSet.has(f.league.name)) {
        nameSet.add(f.league.name);
        result.push({
          id: f.league.id,
          name: f.league.name,
          country: f.league.country ?? 'International',
        });
      }
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
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

  const selectedLeague = leagues.find((l) => l.id === selectedLeagueId);
  const selectedLabel =
    selectedLeagueId === 'all'
      ? 'All leagues'
      : selectedLeague
        ? `${selectedLeague.name} (${selectedLeague.country})`
        : 'League';

  return (
    <section className='space-y-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            <span className='gradient-text'>Today’s</span>{' '}
            <span className='text-white/90'>matches</span>
          </h1>
          <p className='text-sm text-muted-foreground'>
            Pick a league to narrow down the list.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <div className='rounded-full border border-white/10 bg-card/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            {fixtures.length} match{fixtures.length === 1 ? '' : 'es'}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='gap-2 border-white/12 bg-card/20 hover:bg-card/40'
              >
                <Filter className='h-4 w-4 text-muted-foreground' />
                League: {selectedLabel}
                <ChevronDown className='h-4 w-4 text-muted-foreground' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='glass-panel max-h-72 overflow-auto border-white/10'>
              <DropdownMenuItem onSelect={() => setSelectedLeagueId('all')}>
                All leagues
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {leagues.map((l) => (
                <DropdownMenuItem
                  key={l.id}
                  onSelect={() => setSelectedLeagueId(l.id)}
                  className='flex flex-col items-start gap-0.5'
                >
                  <span className='font-medium'>{l.name}</span>
                  <span className='text-xs text-muted-foreground'>
                    {l.country}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {fixtures.length === 0 ? (
        <div className='glass-card rounded-2xl p-6 text-sm text-muted-foreground'>
          No matches found for this league.
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {fixtures.map((fixture) => (
            <MatchCard
              key={fixture.fixture.id}
              fixture={fixture}
              odds={bestOddsForFixture(fixture, oddsMap)}
              isFavorite={favoriteMatchIds.has(String(fixture.fixture.id))}
            />
          ))}
        </div>
      )}
    </section>
  );
}
