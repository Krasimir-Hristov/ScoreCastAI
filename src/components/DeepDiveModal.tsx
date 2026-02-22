'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

import { getDeepDiveNews } from '@/lib/proxy';
import type { NewsItem } from '@/lib/tavily';
import { trackMatchView } from '@/actions/history-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DeepDiveContent } from '@/components/DeepDiveContent';

export function DeepDiveModal({
  matchId,
  homeTeam,
  awayTeam,
  matchStatus,
  title,
  trigger,
}: {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  matchStatus: string;
  title: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [newsPromise, setNewsPromise] = useState<Promise<NewsItem[]> | null>(
    null,
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      if (!newsPromise) {
        setNewsPromise(getDeepDiveNews(homeTeam, awayTeam));
      }
      trackMatchView(matchId, { homeTeam, awayTeam }).catch(() => {});
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-lg'>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Tavily news context + Gemini prediction.
            </DialogDescription>
          </DialogHeader>

          <div className='mt-4'>
            {newsPromise ? (
              <DeepDiveContent
                newsPromise={newsPromise}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                matchId={matchId}
                matchStatus={matchStatus}
              />
            ) : (
              <div className='rounded-xl border bg-card p-4 text-sm text-muted-foreground'>
                Loading...
              </div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
