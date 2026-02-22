'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart3, CalendarDays, Star, Target, Trophy } from 'lucide-react';

const navItems = [
  {
    label: 'All Matches',
    href: '/dashboard',
    icon: CalendarDays,
    description: "Browse today's fixtures",
  },
  {
    label: 'Favorites',
    href: '/dashboard/favorites',
    icon: Star,
    description: 'Your starred matches',
  },
  {
    label: 'My Predictions',
    href: '/dashboard/predictions',
    icon: Target,
    description: 'Saved AI predictions',
  },
  {
    label: 'History',
    href: '/dashboard/history',
    icon: BarChart3,
    description: 'Viewed matches timeline',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className='hidden w-64 flex-col border-r border-white/8 bg-sidebar/65 backdrop-blur-xl md:flex'>
      <div className='sticky top-0 flex h-full flex-col gap-2 p-4'>
        <div className='mb-3 rounded-2xl border border-white/10 bg-card/30 p-3 shadow-sm shadow-black/40'>
          <div className='flex items-center gap-3'>
            <div className='grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-card/60'>
              <Trophy className='h-5 w-5 text-accent' />
            </div>
            <div className='min-w-0'>
              <div className='truncate text-sm font-semibold tracking-tight'>
                <span className='gradient-text'>ScoreCast</span>{' '}
                <span className='text-white/90'>AI</span>
              </div>
              <p className='truncate text-xs text-muted-foreground'>
                AI-powered football insights
              </p>
            </div>
          </div>
        </div>

        <nav className='flex flex-col gap-1'>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200',
                  isActive
                    ? 'bg-card/60 text-foreground shadow-sm shadow-black/40 glow-primary'
                    : 'text-muted-foreground hover:bg-card/30 hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors',
                    isActive
                      ? 'border-white/12 bg-primary/12 text-primary'
                      : 'border-white/8 bg-card/20 text-muted-foreground group-hover:text-foreground',
                  )}
                >
                  <Icon className='h-4 w-4' />
                </span>
                <div className='flex flex-col'>
                  <span
                    className={cn('font-medium', isActive && 'gradient-text')}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      isActive
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/90',
                    )}
                  >
                    {item.description}
                  </span>
                </div>

                {isActive && (
                  <span className='absolute left-0 top-2 bottom-2 w-px bg-linear-to-b from-primary via-primary/40 to-transparent' />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
