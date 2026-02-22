import { Suspense } from 'react';
import { Metadata } from 'next';
import { getUserPredictions } from '@/actions/predictions';
import { PredictionCard } from '@/components/PredictionCard';

export const metadata: Metadata = {
  title: 'My Predictions - ScoreCast AI',
  description: 'Your saved AI predictions',
};

export default function PredictionsPage() {
  return (
    <div className='flex flex-col gap-6'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          My Predictions
        </h1>
        <p className='text-sm text-muted-foreground'>
          AI predictions you&apos;ve generated and saved
        </p>
      </div>

      <Suspense fallback={<PredictionsSkeleton />}>
        <PredictionsContent />
      </Suspense>
    </div>
  );
}

async function PredictionsContent() {
  const predictions = await getUserPredictions();

  if (predictions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-16'>
        <div className='text-center'>
          <p className='text-lg font-medium'>No predictions yet</p>
          <p className='mt-2 text-sm text-muted-foreground'>
            Generate AI predictions from the dashboard to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {predictions.map((pred) => (
        <PredictionCard key={pred.id} prediction={pred} />
      ))}
    </div>
  );
}

function PredictionsSkeleton() {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className='h-56 animate-pulse rounded-xl border bg-card'
        />
      ))}
    </div>
  );
}
