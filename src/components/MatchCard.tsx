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
import { MatchCardOdds } from './MatchCardOdds';

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
  // const prices = bestThreeWayPrices(odds); // Moved to MatchCardOdds
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

        <CardContent className='relative space-y-3 px-4 pb-4'>
          <div className='rounded-2xl border border-white/10 bg-linear-to-b from-primary/10 via-card/20 to-accent/10 p-4 text-center'>
            <div className='grid gap-3'>
              <div className='space-y-1'>
                <div className='mx-auto w-fit rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary'>
                  Home
                </div>
                <div className='text-lg font-semibold leading-tight text-white/95'>
                  {fixture.teams.home.name}
                </div>
              </div>

              <div className='mx-auto flex items-center justify-center gap-2 text-xs text-muted-foreground'>
                <span className='h-px w-10 bg-white/10' />
                <span className='rounded-full border border-white/10 bg-card/30 px-2 py-0.5 font-semibold uppercase tracking-wider text-white/70'>
                  vs
                </span>
                <span className='h-px w-10 bg-white/10' />
              </div>

              <div className='space-y-1'>
                <div className='mx-auto w-fit rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent'>
                  Away
                </div>
                <div className='text-lg font-semibold leading-tight text-white/95'>
                  {fixture.teams.away.name}
                </div>
              </div>
            </div>
          </div>

          <div className='pt-1 text-xs text-muted-foreground'>
            <MatchCardOdds odds={odds} />
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
