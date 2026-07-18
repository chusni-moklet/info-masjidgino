import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except the login page itself
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Next.js Proxy runs on the edge. By default, `@supabase/supabase-js` stores 
    // auth sessions in localStorage, which is not accessible here.
    // If cookies are configured, we can read them. For a default setup, we perform
    // strict authentication checks on the client-side inside the layout guard.
    // This proxy serves as a hook for server-side redirection when cookies are set.
    
    const token = request.cookies.get('sb-access-token')?.value;
    
    // Un-comment below if you implement cookie-based session synchronization in your Supabase client:
    // if (!token) {
    //   const url = request.nextUrl.clone();
    //   url.pathname = '/admin/login';
    //   return NextResponse.redirect(url);
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
