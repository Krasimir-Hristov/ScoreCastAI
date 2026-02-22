import { Suspense } from 'react';

import { getMatchList } from '@/lib/proxy';
import { getUserFavorites } from '@/actions/favorites';
import { LeagueMatchBrowser } from '@/components/LeagueMatchBrowser';

function DashboardFallback() {
  return (
    <div className='space-y-4'>
      <div className='h-8 w-56 animate-pulse rounded-md bg-muted' />
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className='h-56 animate-pulse rounded-xl border bg-card'
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const matchListPromise = getMatchList();
  const favoritesPromise = getUserFavorites();

  return (
    <Suspense fallback={<DashboardFallback />}>
      <LeagueMatchBrowser
        dataPromise={matchListPromise}
        favoritesPromise={favoritesPromise}
      />
    </Suspense>
  );
}
