'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { deletePrediction } from '@/actions/predictions';
import type { Prediction } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PredictionCard({ prediction }: { prediction: Prediction }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const data = prediction.prediction_data;
  const home = prediction.home_team || 'Team A';
  const away = prediction.away_team || 'Team B';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deletePrediction(prediction.id);
      if (success) {
        toast.success('Prediction deleted');
        router.refresh();
      } else {
        throw new Error('Delete failed');
      }
    } catch {
      toast.error('Failed to delete prediction');
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1'>
            <CardTitle className='text-base'>
              {home} vs {away}
            </CardTitle>
            <p className='text-xs text-muted-foreground mt-1'>
              {prediction.match_date
                ? new Date(prediction.match_date).toLocaleDateString()
                : new Date(prediction.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleDelete}
            disabled={isDeleting}
            className='text-destructive hover:text-destructive'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Prediction:</span>
          <span className='text-sm capitalize'>
            {data.outcome === 'home'
              ? home
              : data.outcome === 'away'
                ? away
                : 'Draw'}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Confidence:</span>
          <span className='text-sm capitalize'>{data.confidence}</span>
        </div>

        {data.reasoning && (
          <div className='mt-3 space-y-1 border-t pt-3'>
            <p className='text-xs font-medium'>Reasoning:</p>
            <p className='text-xs text-muted-foreground line-clamp-3'>
              {data.reasoning}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
