'use client';

import { use, useState, Suspense } from 'react';
import { ExternalLink, Newspaper, Sparkles } from 'lucide-react';

import { generateMatchPrediction } from '@/lib/proxy';
import type { NewsItem } from '@/lib/tavily';
import type { PredictionOutput } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { MatchPredictionCard } from '@/components/MatchPredictionCard';
import { SavePredictionButton } from '@/components/deepDive/SavePredictionButton';

interface DeepDiveContentProps {
  newsPromise: Promise<NewsItem[]>;
  homeTeam: string;
  awayTeam: string;
  matchId: string;
  matchStatus: string;
}

export function DeepDiveContent({
  newsPromise,
  homeTeam,
  awayTeam,
  matchId,
  matchStatus,
}: DeepDiveContentProps) {
  const news = use(newsPromise);
  const [predictionPromise, setPredictionPromise] =
    useState<Promise<PredictionOutput | null> | null>(null);

  const isMatchFinished =
    matchStatus.includes('Finished') ||
    matchStatus.includes('FT') ||
    matchStatus.includes('AET') ||
    matchStatus.includes('PEN');

  const handleGenerate = () => {
    setPredictionPromise(
      generateMatchPrediction(homeTeam, awayTeam, news || []),
    );
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='flex items-center gap-2 text-base font-semibold'>
          <span className='grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-card/40'>
            <Sparkles className='h-4 w-4 text-primary' />
          </span>
          <span>Match Analysis</span>
        </h3>
        {isMatchFinished ? (
          <div className='rounded-full border border-white/10 bg-card/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Event Finished
          </div>
        ) : (
          !predictionPromise && (
            <Button
              size='sm'
              onClick={handleGenerate}
              className='gap-2 bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-sm shadow-black/40 hover:from-primary/90 hover:to-primary'
            >
              <Sparkles className='h-4 w-4' />
              Generate AI Prediction
            </Button>
          )
        )}
      </div>

      {predictionPromise && (
        <Suspense
          fallback={
            <div className='h-32 w-full animate-pulse rounded-2xl border border-white/10 bg-card/30' />
          }
        >
          <div className='glass-card space-y-4 rounded-2xl p-4'>
            <MatchPredictionCard promise={predictionPromise} />
            <SavePredictionButton
              promise={predictionPromise}
              matchId={matchId}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          </div>
        </Suspense>
      )}

      <div className='space-y-3'>
        <h4 className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
          <Newspaper className='h-4 w-4 text-muted-foreground' />
          Latest News Context
        </h4>
        {news && news.length > 0 ? (
          <div className='grid gap-3'>
            {news.slice(0, 3).map((item) => (
              <a
                key={item.url}
                href={item.url}
                target='_blank'
                rel='noopener noreferrer'
                className='glass-card group block rounded-2xl p-3 transition-colors hover:border-white/14 hover:bg-card/80'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='text-sm font-medium leading-snug group-hover:underline'>
                    {item.title}
                  </div>
                  <ExternalLink className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70 group-hover:text-foreground' />
                </div>
                {item.description && (
                  <p className='mt-1 line-clamp-2 text-xs text-muted-foreground/80'>
                    {item.description}
                  </p>
                )}
              </a>
            ))}
          </div>
        ) : (
          <p className='text-sm text-muted-foreground'>
            No recent news found for this match.
          </p>
        )}
      </div>
    </div>
  );
}
