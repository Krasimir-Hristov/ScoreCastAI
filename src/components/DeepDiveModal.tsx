'use client';

import { Suspense, use, useState } from 'react';
import { motion } from 'framer-motion';

import { getDeepDiveNews, generateMatchPrediction } from '@/lib/proxy';
import type { NewsItem } from '@/lib/tavily';
import type { PredictionOutput } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MatchPredictionCard } from '@/components/MatchPredictionCard';

function DeepDiveNews({
  promise,
  homeTeam,
  awayTeam,
}: {
  promise: Promise<NewsItem[]>;
  homeTeam: string;
  awayTeam: string;
}) {
  const news = use(promise);
  const [predictionPromise, setPredictionPromise] =
    useState<Promise<PredictionOutput | null> | null>(null);

  return (
    <div className='space-y-5'>
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <div className='text-sm font-semibold'>Latest news</div>
          {!predictionPromise && (
            <Button
              size='sm'
              onClick={() =>
                setPredictionPromise(
                  generateMatchPrediction(homeTeam, awayTeam, news),
                )
              }
            >
              Get AI Prediction
            </Button>
          )}
        </div>

        {predictionPromise && (
          <Suspense
            fallback={
              <div className='rounded-xl border bg-card p-4 text-sm text-muted-foreground'>
                Generating AI prediction...
              </div>
            }
          >
            <MatchPredictionCard promise={predictionPromise} />
          </Suspense>
        )}

        {news?.length ? (
          <ul className='space-y-2'>
            {news.slice(0, 5).map((n) => (
              <li key={n.url} className='rounded-xl border bg-card p-3'>
                <a
                  className='text-sm font-medium underline-offset-4 hover:underline'
                  href={n.url}
                  target='_blank'
                  rel='noreferrer'
                >
                  {n.title}
                </a>
                {n.description ? (
                  <div className='mt-1 text-xs text-muted-foreground'>
                    {n.description}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className='text-sm text-muted-foreground'>No news found.</div>
        )}
      </div>
    </div>
  );
}

export function DeepDiveModal({
  homeTeam,
  awayTeam,
  title,
  trigger,
}: {
  homeTeam: string;
  awayTeam: string;
  title: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [newsPromise, setNewsPromise] = useState<Promise<NewsItem[]> | null>(
    null,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && !newsPromise) {
          setNewsPromise(getDeepDiveNews(homeTeam, awayTeam));
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className='max-h-[85vh] overflow-y-auto'>
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
              <Suspense
                fallback={
                  <div className='rounded-xl border bg-card p-4 text-sm text-muted-foreground'>
                    Fetching latest news...
                  </div>
                }
              >
                <DeepDiveNews
                  promise={newsPromise}
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                />
              </Suspense>
            ) : (
              <div className='rounded-xl border bg-card p-4 text-sm text-muted-foreground'>
                Ready.
              </div>
            )}
          </div>

          <DialogFooter className='mt-4'>
            <DialogClose asChild>
              <Button variant='outline'>Close</Button>
            </DialogClose>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
