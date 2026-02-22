import { verifySession } from '@/lib/dal';
import { signOut } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import { LogOut, Trophy } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await verifySession();

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <Sidebar />

      <div className='flex flex-1 flex-col overflow-hidden'>
        <header className='sticky top-0 z-10 border-b border-white/8 bg-background/60 backdrop-blur-xl'>
          <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3'>
            <div className='flex min-w-0 items-center gap-3'>
              <div className='grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-card/60 shadow-sm shadow-black/40'>
                <Trophy className='h-5 w-5 text-accent' />
              </div>
              <div className='min-w-0'>
                <div className='truncate text-sm font-semibold tracking-tight md:text-base'>
                  <span className='gradient-text'>ScoreCast</span>{' '}
                  <span className='text-white/90'>AI</span>
                </div>
                <div className='truncate text-xs text-muted-foreground'>
                  Today&apos;s matches & AI deep dives
                </div>
              </div>
            </div>

            <div className='flex flex-1 items-center justify-end gap-3'>
              <div className='hidden max-w-72 truncate rounded-full border border-white/10 bg-card/40 px-3 py-1 text-xs text-muted-foreground sm:block'>
                {user.email}
              </div>
              <form action={signOut}>
                <Button
                  type='submit'
                  variant='outline'
                  size='sm'
                  className='gap-2 border-white/12 bg-card/20 hover:bg-card/40'
                >
                  <LogOut className='h-4 w-4' />
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </header>

        <main className='flex-1 overflow-y-auto'>
          <div suppressHydrationWarning className='mx-auto max-w-7xl px-4 py-6'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
