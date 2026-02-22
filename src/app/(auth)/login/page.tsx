'use client';

import { useActionState } from 'react';
import { signIn } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight, Trophy } from 'lucide-react';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null);

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden p-4'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute -bottom-40 left-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl' />
      </div>

      <Card className='glass-panel relative w-full max-w-md'>
        <CardHeader className='space-y-2 text-center'>
          <div className='mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-card/50 shadow-sm shadow-black/40'>
            <Trophy className='h-6 w-6 text-accent' />
          </div>
          <CardTitle className='text-2xl'>
            <span className='gradient-text'>ScoreCast</span>{' '}
            <span className='text-white/90'>AI</span>
          </CardTitle>
          <div className='text-sm text-muted-foreground'>Sign in</div>
        </CardHeader>
        <CardContent>
          <form action={formAction} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='name@example.com'
                required
              />
              {state?.fieldErrors?.email && (
                <p className='text-sm text-destructive'>
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' name='password' type='password' required />
              {state?.fieldErrors?.password && (
                <p className='text-sm text-destructive'>
                  {state.fieldErrors.password[0]}
                </p>
              )}
            </div>
            {state?.error && (
              <p className='text-sm text-destructive text-center'>
                {state.error}
              </p>
            )}
            <Button
              type='submit'
              className='w-full gap-2 bg-linear-to-r from-primary to-primary/80 text-primary-foreground shadow-sm shadow-black/40 hover:from-primary/90 hover:to-primary'
              disabled={isPending}
            >
              {isPending ? 'Signing in...' : 'Sign in'}
              {!isPending && <ArrowRight className='h-4 w-4' />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Link
            href='/register'
            className='text-sm text-muted-foreground hover:text-accent'
          >
            Don&apos;t have an account? Create one
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
