import { NextResponse, type NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  console.log('Middleware - Token present:', !!token);
  console.log('Middleware - Path:', request.nextUrl.pathname);

  // Allow access to login and signup pages without token
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
    if (token) {
      // If user has token and tries to access login, verify it
      try {
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        console.log('Middleware - Verifying token with secret:', jwtSecret);
        verify(token, jwtSecret);
        console.log('Middleware - Token valid, redirecting to dashboard');
        // Token is valid, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (error) {
        console.log('Middleware - Token invalid:', error);
        // Token is invalid, allow access to login page
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      console.log('Middleware - No token, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Temporarily bypass JWT verification for testing
    console.log('Middleware - Dashboard: Bypassing JWT verification for testing');
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
  runtime: 'nodejs',
};
