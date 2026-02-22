import { verifySession } from '@/lib/dal';
import { signOut } from '@/actions/auth';
import { Button } from '@/components/ui/button';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await verifySession();

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <header className='sticky top-0 z-10 border-b bg-background/80 backdrop-blur'>
        <div className='mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3'>
          <div className='flex min-w-0 flex-col leading-tight'>
            <div className='truncate text-sm font-semibold tracking-tight'>
              ScoreCast AI
            </div>
            <div className='truncate text-xs text-muted-foreground'>
              Today’s matches & AI deep dives
            </div>
          </div>

          <div className='flex items-center gap-3'>
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

      <main className='mx-auto max-w-6xl px-4 py-6'>{children}</main>
    </div>
  );
}
