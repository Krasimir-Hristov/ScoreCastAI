'use client';

import { format, isToday, isYesterday } from 'date-fns';
import { Trophy } from 'lucide-react';

import type { MatchHistory, Prediction } from '@/types/database';
import { HistoryEntry } from '@/components/history/HistoryEntry';
import { PredictionEntry } from '@/components/history/PredictionEntry';

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
      <div className='glass-card flex flex-col items-center justify-center rounded-2xl border-dashed py-16 p-8 text-center'>
        <Trophy className='mb-4 h-10 w-10 text-accent/40' />
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
    <div className='max-w-2xl space-y-8'>
      {Object.entries(groups).map(([dateLabel, items]) => (
        <div key={dateLabel} className='space-y-4'>
          <h3 className='sticky top-0 z-10 border-b border-white/8 bg-background/70 pb-2 pt-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-xl'>
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
