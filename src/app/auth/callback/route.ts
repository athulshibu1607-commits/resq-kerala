import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/citizen';

  if (code) {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }

  let safeNext = '/citizen';
  if (next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\')) {
    safeNext = next;
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}
