import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';
import { type NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // 1. Run next-intl middleware for locale prefixing
  const response = intlMiddleware(request);

  // 2. Run Supabase session refresh
  return await updateSession(request, response);
}

export const config = {
  // Matcher ignoring `/_next`, `/api`, etc.
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the last locale for all requests
    '/(fr|ar|en)/:path*',

    // Enable redirections for all other paths
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
