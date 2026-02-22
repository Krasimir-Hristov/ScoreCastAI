'use server';

import { createSupabaseServer } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const AuthFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type AuthActionState = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
} | null;

export async function signUp(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const validatedFields = AuthFormSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServer();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/login');
}

export async function signIn(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const validatedFields = AuthFormSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect('/login');
}
