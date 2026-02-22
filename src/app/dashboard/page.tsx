import { verifySession } from '@/lib/dal';
import { signOut } from '@/actions/auth';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  // Това е ключовият момент - verifySession() проверява дали има логнат потребител.
  // Ако няма, автоматично пренасочва към /login.
  const { user } = await verifySession();

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4 space-y-6'>
      <h1 className='text-3xl font-bold'>Табло (Dashboard)</h1>
      <p className='text-lg text-muted-foreground'>
        Добре дошли,{' '}
        <span className='font-semibold text-foreground'>{user.email}</span>!
      </p>

      <form action={signOut}>
        <Button type='submit' variant='outline'>
          Изход
        </Button>
      </form>
    </div>
  );
}
