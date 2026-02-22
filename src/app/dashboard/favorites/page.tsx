import { Suspense } from 'react';
import { Metadata } from 'next';
import { getFavoritesWithData } from '@/actions/favorites-data';
import { MatchCard } from '@/components/MatchCard';
import { Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Favorites - ScoreCast AI',
  description: 'Your favorite matches',
};

export default function FavoritesPage() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h1 className='flex items-center gap-2 text-2xl font-semibold tracking-tight'>
          <Star className='h-5 w-5 text-accent' />
          <span className='gradient-text'>Favorite</span>{' '}
          <span className='text-white/90'>Matches</span>
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
      <div className='glass-card flex flex-col items-center justify-center rounded-2xl border-dashed py-16'>
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
          className='h-56 animate-pulse rounded-2xl border border-white/10 bg-card/30'
        />
      ))}
    </div>
  );
}
