import { Suspense } from 'react';
import { Metadata } from 'next';
import { getFavoritesWithData } from '@/actions/favorites-data';
import { MatchCard } from '@/components/MatchCard';

export const metadata: Metadata = {
  title: 'Favorites - ScoreCast AI',
  description: 'Your favorite matches',
};

export default function FavoritesPage() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Favorite Matches
        </h1>
        <p className='text-sm text-muted-foreground'>
          Matches you&apos;ve starred for quick access
        </p>
      </div>

      <Suspense fallback={<FavoritesSkeleton />}>
        <FavoritesContent />
      </Suspense>
    </div>
  );
}

async function FavoritesContent() {
  const favorites = await getFavoritesWithData();

  if (favorites.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-16'>
        <div className='text-center'>
          <p className='text-lg font-medium'>No favorites yet</p>
          <p className='mt-2 text-sm text-muted-foreground'>
            Star matches from the dashboard to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {favorites.map((fav) => (
        <MatchCard
          key={fav.matchId}
          fixture={fav.fixture}
          odds={fav.odds}
          isFavorite={true}
        />
      ))}
    </div>
  );
}

function FavoritesSkeleton() {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className='h-56 animate-pulse rounded-xl border bg-card'
        />
      ))}
    </div>
  );
}
