import 'server-only';
import { createSupabaseServer } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import type { User } from '@supabase/supabase-js';

export type VerifySessionResult = {
  isAuth: true;
  userId: string;
  user: User;
};

export const verifySession = cache(async (): Promise<VerifySessionResult> => {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return { isAuth: true, userId: user.id, user };
});
