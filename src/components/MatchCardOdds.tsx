import type { Odds } from '@/lib/odds';
import { bestThreeWayPrices } from '@/components/matchCard.utils';

interface MatchCardOddsProps {
  odds: Odds | null;
}

export function MatchCardOdds({ odds }: MatchCardOddsProps) {
  const prices = bestThreeWayPrices(odds);

  if (!prices) {
    return (
      <div className='pt-1 text-xs text-muted-foreground'>Odds unavailable</div>
    );
  }

  return (
    <div className='pt-1 text-xs text-muted-foreground'>
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
    </div>
  );
}
