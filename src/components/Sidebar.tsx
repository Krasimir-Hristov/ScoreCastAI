'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'All Matches',
    href: '/dashboard',
    icon: '⚽',
    description: "Browse today's fixtures",
  },
  {
    label: 'Favorites',
    href: '/dashboard/favorites',
    icon: '⭐',
    description: 'Your starred matches',
  },
  {
    label: 'My Predictions',
    href: '/dashboard/predictions',
    icon: '🎯',
    description: 'Saved AI predictions',
  },
  {
    label: 'History',
    href: '/dashboard/history',
    icon: '📊',
    description: 'Viewed matches timeline',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className='hidden w-60 flex-col border-r bg-muted/30 md:flex'>
      <div className='sticky top-0 flex h-full flex-col gap-2 p-4'>
        <div className='mb-2 px-3'>
          <h2 className='text-lg font-semibold tracking-tight'>ScoreCast AI</h2>
          <p className='text-xs text-muted-foreground'>
            AI-powered predictions
          </p>
        </div>

        <nav className='flex flex-col gap-1'>
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted',
                )}
              >
                <span className='text-lg leading-none'>{item.icon}</span>
                <div className='flex flex-col'>
                  <span className='font-medium'>{item.label}</span>
                  <span
                    className={cn(
                      'text-xs',
                      isActive
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground',
                    )}
                  >
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
