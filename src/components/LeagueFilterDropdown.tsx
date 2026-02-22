'use client';

import { ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { LeagueOption } from '@/components/leagueMatchBrowser.utils';

interface LeagueFilterDropdownProps {
  leagues: LeagueOption[];
  selectedLeagueId: number | 'all';
  onSelectLeague: (id: number | 'all') => void;
}

export function LeagueFilterDropdown({
  leagues,
  selectedLeagueId,
  onSelectLeague,
}: LeagueFilterDropdownProps) {
  const selectedLeague = leagues.find((l) => l.id === selectedLeagueId);
  const selectedLabel =
    selectedLeagueId === 'all'
      ? 'All leagues'
      : selectedLeague
        ? `${selectedLeague.name} (${selectedLeague.country})`
        : 'League';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='gap-2 border-white/12 bg-card/20 hover:bg-card/40'
        >
          <Filter className='h-4 w-4 text-muted-foreground' />
          League: {selectedLabel}
          <ChevronDown className='h-4 w-4 text-muted-foreground' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='glass-panel max-h-72 overflow-auto border-white/10'>
        <DropdownMenuItem onSelect={() => onSelectLeague('all')}>
          All leagues
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {leagues.map((l) => (
          <DropdownMenuItem
            key={l.id}
            onSelect={() => onSelectLeague(l.id)}
            className='flex flex-col items-start gap-0.5'
          >
            <span className='font-medium'>{l.name}</span>
            <span className='text-xs text-muted-foreground'>{l.country}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
