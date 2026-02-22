'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
import {
  bestThreeWayPrices,
  formatKickoff,
} from '@/components/matchCard.utils';

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
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <Card className='glass-card group relative overflow-hidden transition-colors'>
        <div className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
          <div className='absolute -top-24 -left-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl' />
          <div className='absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-accent/10 blur-3xl' />
        </div>

        <CardHeader className='relative pb-2 pt-4 px-4'>
          <div className='flex items-start justify-between gap-2'>
            <div className='space-y-1'>
              <CardTitle className='text-xs font-semibold uppercase tracking-widest text-white/85'>
                {fixture.league.name}
              </CardTitle>
              <CardDescription className='flex flex-wrap items-center gap-x-1.5'>
                <span className='text-[11px] text-muted-foreground/80'>
                  {fixture.league.country}
                </span>
                <span className='text-[11px] text-muted-foreground/80'>•</span>
                <span className='text-[11px] text-muted-foreground/80'>
                  {kickoff}
                </span>
                <span className='text-[11px] text-muted-foreground/80'>•</span>
                <span className='rounded-full border border-white/10 bg-card/30 px-2 py-0.5 text-[11px] font-medium text-white/80'>
                  {fixture.fixture.status.long}
                </span>
              </CardDescription>
            </div>
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
          </div>
        </CardHeader>

        <CardContent className='relative space-y-3'>
          <div className='grid gap-1'>
            <div className='text-base font-semibold text-white/90'>
              {fixture.teams.home.name}
            </div>
            <div className='text-[11px] text-muted-foreground'>vs</div>
            <div className='text-base font-semibold text-white/90'>
              {fixture.teams.away.name}
            </div>
          </div>

          <div className='pt-1 text-xs text-muted-foreground'>
            {prices ? (
              <div className='flex flex-wrap gap-2'>
                <span className='rounded-lg border border-white/8 bg-card/30 px-2 py-1'>
                  H: <span className='text-white/90'>{prices.home ?? '—'}</span>
                </span>
                <span className='rounded-lg border border-white/8 bg-card/30 px-2 py-1'>
                  D: <span className='text-white/90'>{prices.draw ?? '—'}</span>
                </span>
                <span className='rounded-lg border border-white/8 bg-card/30 px-2 py-1'>
                  A: <span className='text-white/90'>{prices.away ?? '—'}</span>
                </span>
              </div>
            ) : (
              <span>Odds unavailable</span>
            )}
          </div>
        </CardContent>

        <CardFooter className='relative justify-between'>
          <DeepDiveModal
            matchId={matchId}
            homeTeam={fixture.teams.home.name}
            awayTeam={fixture.teams.away.name}
            matchStatus={fixture.fixture.status.long}
            title={`${fixture.teams.home.name} vs ${fixture.teams.away.name}`}
            trigger={
              <Button
                size='sm'
                className='bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-sm shadow-black/40 hover:from-primary/90 hover:to-primary'
              >
                Deep dive
              </Button>
            }
          />
        </CardFooter>
      </Card>
    </motion.div>
  );
}
