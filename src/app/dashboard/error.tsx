'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className='mx-auto max-w-xl py-10'>
      <Card className='glass-card'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-destructive' />
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-muted-foreground'>{error.message}</p>
          <Button
            onClick={reset}
            variant='outline'
            className='border-white/12 bg-card/20 hover:bg-card/40'
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
