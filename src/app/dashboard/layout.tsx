import { verifySession } from '@/lib/dal';
import { signOut } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';

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
        <header className='sticky top-0 z-10 border-b bg-background/80 backdrop-blur'>
          <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3'>
            <div className='flex min-w-0 flex-col leading-tight md:hidden'>
              <div className='truncate text-sm font-semibold tracking-tight'>
                ScoreCast AI
              </div>
              <div className='truncate text-xs text-muted-foreground'>
                Today&apos;s matches & AI deep dives
              </div>
            </div>

            <div className='flex flex-1 items-center justify-end gap-3'>
              <div className='hidden max-w-64 truncate text-sm text-muted-foreground sm:block'>
                {user.email}
              </div>
              <form action={signOut}>
                <Button type='submit' variant='outline' size='sm'>
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </header>

        <main className='flex-1 overflow-y-auto'>
          <div className='mx-auto max-w-7xl px-4 py-6'>{children}</div>
        </main>
      </div>
    </div>
  );
}
