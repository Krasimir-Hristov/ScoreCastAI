'use client';

import { use, useState } from 'react';
import { toast } from 'sonner';
import { Trophy } from 'lucide-react';

import type { PredictionOutput } from '@/lib/gemini';
import { savePrediction } from '@/actions/predictions';
import { Button } from '@/components/ui/button';

export function SavePredictionButton({
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
      const outcome =
        prediction.winner === homeTeam
          ? 'home'
          : prediction.winner === awayTeam
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
          matchDate: new Date().toISOString(),
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
        className='gap-2 border-white/12 bg-card/20 hover:bg-card/40'
      >
        <Trophy className='h-4 w-4 text-accent' />
        {isSaving ? 'Saving...' : 'Save Prediction'}
      </Button>
    </div>
  );
}
