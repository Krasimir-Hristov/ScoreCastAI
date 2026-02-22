'use client';

import { use, useState, Suspense } from 'react';
import { toast } from 'sonner';

import { generateMatchPrediction } from '@/lib/proxy';
import type { NewsItem } from '@/lib/tavily';
import type { PredictionOutput } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { MatchPredictionCard } from '@/components/MatchPredictionCard';
import { savePrediction } from '@/actions/predictions';

interface DeepDiveContentProps {
  newsPromise: Promise<NewsItem[]>;
  homeTeam: string;
  awayTeam: string;
  matchId: string;
  matchStatus: string;
}

function SavePredictionButton({
  promise,
  matchId,
  homeTeam,
  awayTeam,
}: {
  promise: Promise<PredictionOutput | null>;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
}) {
  const prediction = use(promise);
  const [isSaving, setIsSaving] = useState(false);

  if (!prediction) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Map PredictionOutput to PredictionData
      const outcome =
        prediction.winner === 'Home'
          ? 'home'
          : prediction.winner === 'Away'
            ? 'away'
            : 'draw';

      const result = await savePrediction(
        matchId,
        {
          outcome,
          confidence: prediction.confidence as 'low' | 'medium' | 'high',
          reasoning: prediction.reasoning,
        },
        {
          homeTeam,
          awayTeam,
          matchDate: new Date().toISOString(), // Saving current time as approximation
        },
      );

      if (result) {
        toast.success('Prediction saved successfully!');
      } else {
        toast.error('Failed to save. Please sign in first.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='flex justify-end pt-2'>
      <Button
        size='sm'
        variant='outline'
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Prediction'}
      </Button>
    </div>
  );
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
        <h3 className='text-base font-semibold'>Match Analysis</h3>
        {isMatchFinished ? (
          <div className='rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground'>
            Event Finished
          </div>
        ) : (
          !predictionPromise && (
            <Button size='sm' onClick={handleGenerate}>
              Generate AI Prediction
            </Button>
          )
        )}
      </div>

      {predictionPromise && (
        <Suspense
          fallback={
            <div className='h-32 w-full animate-pulse rounded-xl bg-muted/50' />
          }
        >
          <div className='space-y-4 rounded-xl border bg-card p-4'>
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
        <h4 className='text-sm font-medium text-muted-foreground'>
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
                className='block rounded-lg border bg-card/50 p-3 transition-colors hover:bg-accent/50'
              >
                <div className='text-sm font-medium leading-snug hover:underline'>
                  {item.title}
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
