'use client';

import { useActionState } from 'react';
import { signUp } from '@/actions/auth';
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

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUp, null);

  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-2xl text-center'>Регистрация</CardTitle>
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
              {isPending ? 'Създаване на акаунт...' : 'Регистрирай се'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4 text-center'>
          <p className='text-xs text-muted-foreground'>
            След регистрация ще получиш email за потвърждение.
          </p>
          <Link
            href='/login'
            className='text-sm text-muted-foreground hover:text-primary'
          >
            Вече имаш акаунт? Влез
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
