'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

import { addFavorite, removeFavorite } from '@/actions/favorites';
import { Button } from '@/components/ui/button';

export function FavoriteButton({
  matchId,
  initialFavorite = false,
}: {
  matchId: string;
  initialFavorite?: boolean;
}) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = async () => {
    setIsLoading(true);
    const nextState = !isFavorite;
    setIsFavorite(nextState);

    try {
      const result = nextState
        ? await addFavorite(matchId)
        : await removeFavorite(matchId);

      if (!result) throw new Error('Auth required');
      toast.success(
        nextState ? 'Added to favorites' : 'Removed from favorites',
      );
    } catch {
      setIsFavorite(!nextState);
      toast.error('Sign in to manage favorites');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      className='-mr-2 -mt-2 h-8 w-8 rounded-xl border border-white/10 bg-card/20 text-muted-foreground hover:bg-card/40 hover:text-accent'
      onClick={toggleFavorite}
      disabled={isLoading}
    >
      <Star
        className={
          'h-4 w-4 transition-all ' +
          (isFavorite ? 'fill-accent text-accent' : '')
        }
      />
      <span className='sr-only'>Toggle favorite</span>
    </Button>
  );
}
