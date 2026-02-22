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

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null);

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-2xl text-center'>Вход</CardTitle>
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
                <p className='text-sm text-red-500'>
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Парола</Label>
              <Input id='password' name='password' type='password' required />
              {state?.fieldErrors?.password && (
                <p className='text-sm text-red-500'>
                  {state.fieldErrors.password[0]}
                </p>
              )}
            </div>
            {state?.error && (
              <p className='text-sm text-red-500 text-center'>{state.error}</p>
            )}
            <Button type='submit' className='w-full' disabled={isPending}>
              {isPending ? 'Влизане...' : 'Влез'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Link
            href='/register'
            className='text-sm text-muted-foreground hover:text-primary'
          >
            Нямаш акаунт? Регистрирай се
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
