'use client';

import { use } from 'react';
import type { PredictionOutput } from '@/lib/gemini';

export function MatchPredictionCard({
  promise,
}: {
  promise: Promise<PredictionOutput | null>;
}) {
  const prediction = use(promise);

  if (!prediction) {
    return (
      <div className='rounded-xl border bg-card p-4 text-sm text-muted-foreground'>
        No prediction available.
      </div>
    );
  }

  return (
    <div className='space-y-4 rounded-xl border bg-card p-4'>
      <div className='flex items-center justify-between'>
        <div className='text-sm font-semibold'>AI Prediction</div>
        <div className='text-xs font-medium text-muted-foreground'>
          Confidence: {prediction.confidence}
        </div>
      </div>

      <div className='grid gap-2 sm:grid-cols-2'>
        <div className='rounded-lg bg-accent/50 p-3'>
          <div className='text-xs text-muted-foreground'>Predicted Winner</div>
          <div className='font-medium'>{prediction.winner}</div>
        </div>
        <div className='rounded-lg bg-accent/50 p-3'>
          <div className='text-xs text-muted-foreground'>Predicted Score</div>
          <div className='font-medium'>
            {prediction.predictedScore.home} - {prediction.predictedScore.away}
          </div>
        </div>
      </div>

      <div className='space-y-1'>
        <div className='text-xs text-muted-foreground'>Reasoning</div>
        <div className='text-sm'>{prediction.reasoning}</div>
      </div>

      {prediction.warnings && prediction.warnings.length > 0 && (
        <div className='space-y-1'>
          <div className='text-xs font-medium text-destructive'>
            Key Warnings (Injuries/Suspensions)
          </div>
          <ul className='list-inside list-disc text-sm text-destructive/90'>
            {prediction.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
