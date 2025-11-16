import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { tokenManager } from '@/lib/auth/token-utils';
import { getSession } from '@/lib/auth/session';
import { isTokenMode } from '@/lib/config';

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': ['user', 'admin'],
  '/admin': ['admin'],
  '/profile': ['user', 'admin'],
};

// Define public routes (redirect if authenticated)
const publicRoutes = ['/login', '/register'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const requiredRoles = Object.entries(protectedRoutes).find(([route]) => 
    pathname.startsWith(route)
  )?.[1];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  let isAuthenticated = false;
  let userRole: string | null = null;

  try {
    if (isTokenMode) {
      // Token-based authentication
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const accessToken = authHeader.substring(7);
        const payload = await tokenManager.verifyAccessToken(accessToken);
        if (payload) {
          isAuthenticated = true;
          userRole = payload.role;
        }
      }
    } else {
      // Session-based authentication
      const session = await getSession();
      if (session.isLoggedIn && session.user) {
        isAuthenticated = true;
        userRole = session.user.role;
      }
    }
  } catch (error) {
    console.error('Proxy authentication error:', error);
  }

  // Handle protected routes
  if (requiredRoles) {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    if (userRole && !requiredRoles.includes(userRole)) {
      // Redirect to unauthorized page or dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Handle public routes (redirect if authenticated)
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};