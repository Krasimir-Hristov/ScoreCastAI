'use client';

import type { Fixture } from '@/lib/football';
import type { Odds } from '@/lib/odds';
import { getLeagueInfo } from '@/lib/league-info';
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
}: {
  fixture: Fixture;
  odds: Odds | null;
}) {
  const kickoff = formatKickoff(fixture.fixture.date);
  const status = fixture.fixture.status.long;
  const prices = bestThreeWayPrices(odds);
  const leagueInfo = getLeagueInfo(fixture.league.name);

  return (
    <Card className='transition-colors hover:bg-accent/40'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-base'>{fixture.league.name}</CardTitle>
        <CardDescription>
          <span className='text-xs text-muted-foreground/75'>
            {leagueInfo.country}
          </span>
          <span className='mx-1 text-xs text-muted-foreground/75'>•</span>
          <span className='text-xs text-muted-foreground'>
            {kickoff} • {status}
          </span>
        </CardDescription>
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
          homeTeam={fixture.teams.home.name}
          awayTeam={fixture.teams.away.name}
          title={`${fixture.teams.home.name} vs ${fixture.teams.away.name}`}
          trigger={<Button size='sm'>Deep dive</Button>}
        />
      </CardFooter>
    </Card>
  );
}
