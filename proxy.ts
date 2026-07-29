import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Protected pages requiring login
  if (
    (path.startsWith('/profile') ||
      path.startsWith('/clubprofile') ||
      path.startsWith('/admin')) &&
    !token
  ) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Already logged in users trying to access login/register
  if ((path === '/auth/login' || path === '/auth/register') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/clubprofile/:path*',
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
