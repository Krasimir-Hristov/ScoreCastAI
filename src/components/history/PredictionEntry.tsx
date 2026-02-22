'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import type { Prediction } from '@/types/database';
import { deletePrediction } from '@/actions/predictions';
import { Button } from '@/components/ui/button';
import { DeepDiveModal } from '@/components/DeepDiveModal';

export function PredictionEntry({ item }: { item: Prediction }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const home = item.home_team || 'Unknown';
  const away = item.away_team || 'Team';
  const outcome = item.prediction_data.outcome;
  const reason = item.prediction_data.reasoning;

  const badgeClass =
    outcome === 'home'
      ? 'border-primary/25 bg-primary/10 text-primary'
      : outcome === 'away'
        ? 'border-chart-3/25 bg-chart-3/10 text-chart-3'
        : 'border-accent/25 bg-accent/10 text-accent';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deletePrediction(item.id);
      if (success) {
        toast.success('Prediction deleted');
        router.refresh();
      } else {
        throw new Error('Delete failed');
      }
    } catch {
      toast.error('Failed to delete');
      setIsDeleting(false);
    }
  };

  return (
    <div className='relative flex gap-4 pb-4 last:pb-0'>
      <div className='absolute left-4.75 top-8 h-full w-px bg-linear-to-b from-accent/45 via-white/8 to-transparent last:hidden' />
      <div className='z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-accent/10'>
        <Trophy className='h-4 w-4 text-accent' />
      </div>
      <div className='glass-card flex-1 rounded-2xl p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <div className='font-medium'>
              {home} vs {away}
            </div>
            <time className='text-xs text-muted-foreground'>
              {format(new Date(item.created_at), 'h:mm a')}
            </time>
          </div>
          <div className='flex items-center gap-2'>
            <DeepDiveModal
              matchId={item.match_id}
              homeTeam={home}
              awayTeam={away}
              matchStatus='Unknown'
              title={`${home} vs ${away}`}
              trigger={
                <Button
                  variant='outline'
                  size='sm'
                  className='border-white/12 bg-card/20 hover:bg-card/40'
                >
                  View
                </Button>
              }
            />
            <Button
              variant='ghost'
              size='icon'
              className='h-9 w-9 rounded-xl border border-white/10 bg-card/20 text-destructive hover:bg-card/40 hover:text-destructive'
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>
        <div className='mt-2 flex items-start gap-2'>
          <div
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${badgeClass}`}
          >
            {outcome} Win
          </div>
          <p className='line-clamp-1 text-sm text-muted-foreground'>{reason}</p>
        </div>
      </div>
    </div>
  );
}
