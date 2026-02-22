'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

import type { Fixture } from '@/lib/football';
import type { Odds } from '@/lib/odds';
import { addFavorite, removeFavorite } from '@/actions/favorites';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DeepDiveModal } from '@/components/DeepDiveModal';

function formatKickoff(isoLike: string) {
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) return isoLike;
  // Use a fixed locale to avoid server/client locale differences
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date);
}

function bestThreeWayPrices(odds: Odds | null) {
  const market = odds?.bookmakers?.[0]?.markets?.find((m) => m.key === 'h2h');
  const outcomes = market?.outcomes ?? [];
  const byName = new Map(outcomes.map((o) => [o.name.toLowerCase(), o.price]));

  const home = byName.get(odds?.home_team.toLowerCase() ?? '');
  const away = byName.get(odds?.away_team.toLowerCase() ?? '');
  const draw = byName.get('draw');

  if (home == null && away == null && draw == null) return null;
  return { home, draw, away };
}

export function MatchCard({
  fixture,
  odds,
  isFavorite: initialFavorite = false,
}: {
  fixture: Fixture;
  odds: Odds | null;
  isFavorite?: boolean;
}) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const matchId = String(fixture.fixture.id);

  const toggleFavorite = async () => {
    setIsLoading(true);
    const nextState = !isFavorite;
    setIsFavorite(nextState); // Optimistic

    try {
      const result = nextState
        ? await addFavorite(matchId)
        : await removeFavorite(matchId);

      if (!result) throw new Error('Auth required');
      toast.success(
        nextState ? 'Added to favorites' : 'Removed from favorites',
      );
    } catch {
      setIsFavorite(!nextState); // Rollback
      toast.error('Sign in to manage favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const kickoff = formatKickoff(fixture.fixture.date);
  const prices = bestThreeWayPrices(odds);

  return (
    <Card className='transition-colors hover:bg-accent/40'>
      <CardHeader className='pb-2 pt-4 px-4'>
        <div className='flex items-start justify-between gap-2'>
          <div className='space-y-1'>
            <CardTitle className='text-base leading-tight'>
              {fixture.league.name}
            </CardTitle>
            <CardDescription className='flex flex-wrap items-center gap-x-1.5'>
              <span className='text-xs text-muted-foreground/75'>
                {fixture.league.country}
              </span>
              <span className='text-xs text-muted-foreground/75'>•</span>
              <span className='text-xs text-muted-foreground/75'>
                {kickoff}
              </span>
              <span className='text-xs text-muted-foreground/75'>•</span>
              <span className='text-xs font-medium text-foreground/80'>
                {fixture.fixture.status.long}
              </span>
            </CardDescription>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='-mr-2 -mt-2 h-8 w-8 text-muted-foreground hover:text-destructive'
            onClick={toggleFavorite}
            disabled={isLoading}
          >
            <Heart
              className={`h-4 w-4 transition-all ${
                isFavorite ? 'fill-destructive text-destructive' : ''
              }`}
            />
            <span className='sr-only'>Toggle favorite</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className='space-y-2'>
        <div className='text-sm font-medium'>{fixture.teams.home.name}</div>
        <div className='text-xs text-muted-foreground'>vs</div>
        <div className='text-sm font-medium'>{fixture.teams.away.name}</div>

        <div className='pt-3 text-xs text-muted-foreground'>
          {prices ? (
            <div className='flex flex-wrap gap-x-3 gap-y-1'>
              <span>H: {prices.home ?? '—'}</span>
              <span>D: {prices.draw ?? '—'}</span>
              <span>A: {prices.away ?? '—'}</span>
            </div>
          ) : (
            <span>Odds unavailable</span>
          )}
        </div>
      </CardContent>

      <CardFooter className='justify-between'>
        <DeepDiveModal
          matchId={matchId}
          homeTeam={fixture.teams.home.name}
          awayTeam={fixture.teams.away.name}
          matchStatus={fixture.fixture.status.long}
          title={`${fixture.teams.home.name} vs ${fixture.teams.away.name}`}
          trigger={<Button size='sm'>Deep dive</Button>}
        />
      </CardFooter>
    </Card>
  );
}
