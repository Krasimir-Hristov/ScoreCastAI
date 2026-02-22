import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className='space-y-4'>
      <div className='h-10 w-72 animate-pulse rounded-xl border border-white/10 bg-card/30' />
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className='glass-card animate-pulse'>
            <CardHeader className='space-y-2'>
              <div className='h-4 w-32 rounded bg-card/40' />
              <div className='h-3 w-48 rounded bg-card/40' />
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='h-6 w-full rounded bg-card/40' />
              <div className='h-6 w-5/6 rounded bg-card/40' />
              <div className='h-9 w-32 rounded bg-card/40' />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
