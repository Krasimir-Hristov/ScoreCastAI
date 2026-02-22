'use client';

import { use } from 'react';
import type { PredictionOutput } from '@/lib/gemini';
import { AlertTriangle, Target, Trophy } from 'lucide-react';

export function MatchPredictionCard({
  promise,
}: {
  promise: Promise<PredictionOutput | null>;
}) {
  const prediction = use(promise);

  if (!prediction) {
    return (
      <div className='glass-card rounded-2xl p-4 text-sm text-muted-foreground'>
        No prediction available.
      </div>
    );
  }

  return (
    <div className='space-y-4 rounded-2xl border border-white/10 bg-card/60 p-4 shadow-sm shadow-black/40'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 text-sm font-semibold'>
          <span className='grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-card/40'>
            <Trophy className='h-4 w-4 text-accent' />
          </span>
          AI Prediction
        </div>
        <div className='text-xs font-medium text-muted-foreground'>
          Confidence: {prediction.confidence}
        </div>
      </div>

      <div className='grid gap-2 sm:grid-cols-2'>
        <div className='rounded-2xl border border-white/10 bg-primary/10 p-3'>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Trophy className='h-3.5 w-3.5 text-primary' />
            Predicted Winner
          </div>
          <div className='mt-1 font-medium text-white/90'>
            {prediction.winner}
          </div>
        </div>
        <div className='rounded-2xl border border-white/10 bg-accent/10 p-3'>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Target className='h-3.5 w-3.5 text-accent' />
            Predicted Score
          </div>
          <div className='mt-1 font-medium text-white/90'>
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
          <div className='flex items-center gap-2 text-xs font-medium text-destructive'>
            <AlertTriangle className='h-3.5 w-3.5' />
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
