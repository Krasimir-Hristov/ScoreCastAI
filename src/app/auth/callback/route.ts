import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(
    new URL('/login?error=Could not authenticate user', request.url),
  );
}
