import { Suspense } from 'react';
import { Metadata } from 'next';
import { getUserHistory } from '@/actions/history-actions';
import { getUserPredictions } from '@/actions/predictions';
import { HistoryList } from '@/components/HistoryList';

export const metadata: Metadata = {
  title: 'My History - ScoreCast AI',
  description: 'View your past predictions and match history.',
};

export default function HistoryPage() {
  return (
    <div className='flex flex-col gap-6 p-4 sm:p-8'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-semibold tracking-tight'>My History</h1>
        <p className='text-sm text-muted-foreground'>
          A timeline of your match views and predictions.
        </p>
      </div>

      <Suspense fallback={<div>Loading history...</div>}>
        <HistoryContent />
      </Suspense>
    </div>
  );
}

async function HistoryContent() {
  // Parallel data fetching
  const [historyItems, predictions] = await Promise.all([
    getUserHistory(),
    getUserPredictions(),
  ]);

  return <HistoryList historyItems={historyItems} predictions={predictions} />;
}
