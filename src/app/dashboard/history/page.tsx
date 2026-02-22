import { Suspense } from 'react';
import { Metadata } from 'next';
import { getUserHistory } from '@/actions/history-actions';
import { getUserPredictions } from '@/actions/predictions';
import { HistoryList } from '@/components/HistoryList';
import { BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My History - ScoreCast AI',
  description: 'View your past predictions and match history.',
};

export default function HistoryPage() {
  return (
    <div className='flex flex-col gap-6 p-4 sm:p-8'>
      <div className='space-y-1'>
        <h1 className='flex items-center gap-2 text-2xl font-semibold tracking-tight'>
          <BarChart3 className='h-5 w-5 text-primary' />
          <span className='gradient-text'>My</span>{' '}
          <span className='text-white/90'>History</span>
        </h1>
        <p className='text-sm text-muted-foreground'>
          A timeline of your match views and predictions.
        </p>
      </div>

      <Suspense
        fallback={
          <div className='glass-card rounded-2xl p-6 text-sm text-muted-foreground'>
            Loading history...
          </div>
        }
      >
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
