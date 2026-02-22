'use client';

import { useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Eye, Trophy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import type { MatchHistory, Prediction } from '@/types/database';
import { deleteHistoryEntry } from '@/actions/history-actions';
import { deletePrediction } from '@/actions/predictions';
import { Button } from '@/components/ui/button';
import { DeepDiveModal } from '@/components/DeepDiveModal';

interface HistoryListProps {
  historyItems: MatchHistory[];
  predictions: Prediction[];
}

type TimelineItem =
  | { type: 'history'; data: MatchHistory; date: Date }
  | { type: 'prediction'; data: Prediction; date: Date };

export function HistoryList({ historyItems, predictions }: HistoryListProps) {
  // Merge and sort
  const timeline: TimelineItem[] = [
    ...historyItems.map((h) => ({
      type: 'history' as const,
      data: h,
      date: new Date(h.viewed_at),
    })),
    ...predictions.map((p) => ({
      type: 'prediction' as const,
      data: p,
      date: new Date(p.created_at),
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (timeline.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-8 text-center border rounded-xl border-dashed py-16'>
        <Trophy className='mb-4 h-10 w-10 text-muted-foreground/30' />
        <p className='text-lg font-medium'>No history yet</p>
        <p className='text-sm text-muted-foreground'>
          Predictions and viewed matches will appear here.
        </p>
      </div>
    );
  }

  // Group by date
  const groups: { [key: string]: TimelineItem[] } = {};
  timeline.forEach((item) => {
    const key = isToday(item.date)
      ? 'Today'
      : isYesterday(item.date)
        ? 'Yesterday'
        : format(item.date, 'MMMM d, yyyy');
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  return (
    <div className='space-y-8 max-w-2xl'>
      {Object.entries(groups).map(([dateLabel, items]) => (
        <div key={dateLabel} className='space-y-4'>
          <h3 className='sticky top-0 bg-background/95 pb-2 text-sm font-medium text-muted-foreground backdrop-blur-sm'>
            {dateLabel}
          </h3>
          <div className='space-y-4 pl-2'>
            {items.map((item) => {
              if (item.type === 'history') {
                return <HistoryEntry key={item.data.id} item={item.data} />;
              }
              return <PredictionEntry key={item.data.id} item={item.data} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryEntry({ item }: { item: MatchHistory }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const home = item.home_team || 'Unknown';
  const away = item.away_team || 'Team';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteHistoryEntry(item.id);
      if (success) {
        toast.success('Removed from history');
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
      <div className='absolute left-4.75 top-8 h-full w-px bg-border last:hidden' />
      <div className='z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-muted'>
        <Eye className='h-4 w-4 text-muted-foreground' />
      </div>
      <div className='flex-1 rounded-lg border bg-card p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <div className='font-medium'>
              {home} vs {away}
            </div>
            <time className='text-xs text-muted-foreground'>
              {format(new Date(item.viewed_at), 'h:mm a')}
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
                <Button variant='outline' size='sm'>
                  View
                </Button>
              }
            />
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-destructive hover:text-destructive'
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PredictionEntry({ item }: { item: Prediction }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const home = item.home_team || 'Unknown';
  const away = item.away_team || 'Team';
  const outcome = item.prediction_data.outcome;
  const reason = item.prediction_data.reasoning;

  const outcomeColors = {
    home: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900',
    away: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    draw: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900',
  };

  const badgeClass = outcomeColors[outcome] || 'bg-muted text-muted-foreground';

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
      <div className='absolute left-4.75 top-8 h-full w-px bg-border last:hidden' />
      <div className='z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-primary/10'>
        <Trophy className='h-4 w-4 text-primary' />
      </div>
      <div className='flex-1 rounded-lg border bg-card p-4'>
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
                <Button variant='outline' size='sm'>
                  View
                </Button>
              }
            />
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-destructive hover:text-destructive'
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>
        <div className='mt-2 flex items-start gap-2'>
          <div
            className={`rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${badgeClass}`}
          >
            {outcome} Win
          </div>
          <p className='text-sm text-muted-foreground line-clamp-1'>{reason}</p>
        </div>
      </div>
    </div>
  );
}
