'use client';

import { Suspense, use, useState } from 'react';
import { motion } from 'framer-motion';

import { getDeepDiveAnalysis, type DeepDiveData } from '@/lib/proxy';
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

function DeepDiveResult({ promise }: { promise: Promise<DeepDiveData> }) {
  const data = use(promise);

  return (
    <div className='space-y-5'>
      <div className='space-y-2 rounded-xl border bg-card p-4'>
        <div className='text-sm font-semibold'>Prediction</div>
        {data.prediction ? (
          <div className='space-y-1 text-sm'>
            <div className='text-muted-foreground'>
              Outcome:{' '}
              <span className='text-foreground'>{data.prediction.outcome}</span>
              {' • '}
              Confidence:{' '}
              <span className='text-foreground'>
                {data.prediction.confidence}
              </span>
            </div>
            <div className='text-sm'>{data.prediction.reasoning}</div>
          </div>
        ) : (
          <div className='text-sm text-muted-foreground'>
            No prediction available.
          </div>
        )}
      </div>

      <div className='space-y-2'>
        <div className='text-sm font-semibold'>Latest news</div>
        {data.news?.length ? (
          <ul className='space-y-2'>
            {data.news.slice(0, 5).map((n) => (
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
  matchId,
  title,
  trigger,
}: {
  matchId: string;
  title: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [promise, setPromise] = useState<Promise<DeepDiveData> | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && !promise) setPromise(getDeepDiveAnalysis(matchId));
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
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
            {promise ? (
              <Suspense
                fallback={
                  <div className='rounded-xl border bg-card p-4 text-sm text-muted-foreground'>
                    Running deep dive…
                  </div>
                }
              >
                <DeepDiveResult promise={promise} />
              </Suspense>
            ) : (
              <div className='rounded-xl border bg-card p-4 text-sm text-muted-foreground'>
                Ready.
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Close</Button>
            </DialogClose>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
