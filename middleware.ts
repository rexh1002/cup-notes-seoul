import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';  // jose 라이브러리 사용

// JWT_SECRET을 Uint8Array로 변환
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function middleware(request: NextRequest) {
  console.log('Middleware - Requested Path:', request.nextUrl.pathname);

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (request.nextUrl.pathname === '/admin/login') {
      console.log('Middleware - Login page access');
      return NextResponse.next();
    }

    const token = request.cookies.get('adminToken')?.value;
    console.log('Middleware - Token found:', !!token);

    if (!token) {
      console.log('Middleware - No token, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      console.log('Middleware - Token verified');
      return NextResponse.next();
    } catch (error) {
      console.log('Middleware - Token verification failed:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};