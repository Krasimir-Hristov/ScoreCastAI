'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import type { MatchHistory } from '@/types/database';
import { deleteHistoryEntry } from '@/actions/history-actions';
import { Button } from '@/components/ui/button';
import { DeepDiveModal } from '@/components/DeepDiveModal';

export function HistoryEntry({ item }: { item: MatchHistory }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const home = item.home_team || 'Unknown';
  const away = item.away_team || 'Team';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteHistoryEntry(item.id);
      if (success) {
        toast.success('Removed from history');
        router.refresh();
      } else {
        throw new Error('Delete failed');
      }
    } catch {
      toast.error('Failed to delete');
      setIsDeleting(false);
    }
  };

  return (
    <div className='relative flex gap-4 pb-4 last:pb-0'>
      <div className='absolute left-4.75 top-8 h-full w-px bg-linear-to-b from-primary/50 via-white/8 to-transparent last:hidden' />
      <div className='z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-card/40 backdrop-blur'>
        <Eye className='h-4 w-4 text-muted-foreground' />
      </div>
      <div className='glass-card flex-1 rounded-2xl p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <div className='font-medium'>
              {home} vs {away}
            </div>
            <time className='text-xs text-muted-foreground'>
              {format(new Date(item.viewed_at), 'h:mm a')}
            </time>
          </div>
          <div className='flex items-center gap-2'>
            <DeepDiveModal
              matchId={item.match_id}
              homeTeam={home}
              awayTeam={away}
              matchStatus='Unknown'
              title={`${home} vs ${away}`}
              trigger={
                <Button
                  variant='outline'
                  size='sm'
                  className='border-white/12 bg-card/20 hover:bg-card/40'
                >
                  View
                </Button>
              }
            />
            <Button
              variant='ghost'
              size='icon'
              className='h-9 w-9 rounded-xl border border-white/10 bg-card/20 text-destructive hover:bg-card/40 hover:text-destructive'
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
