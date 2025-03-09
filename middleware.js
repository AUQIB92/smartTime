import { NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/verify', '/reset-password'];

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/api/admin',
  '/api/users',
  '/api/classrooms',
  '/api/subjects',
  '/api/semesters',
  '/api/departments',
  '/api/timetables'
];

// Routes that require specific roles - keep this for API access control
const roleBasedRoutes = {
  '/api/admin': ['admin'],
  '/api/principal': ['principal'],
  '/api/hod': ['hod'],
  '/api/users': ['admin'],
  '/api/classrooms': ['admin'],
  '/api/subjects': ['admin'],
  '/api/semesters': ['admin'],
};

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is public
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }
  
  // Check if the route requires authentication
  const requiresAuth = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // If the route doesn't require authentication, allow access
  if (!requiresAuth) {
    return NextResponse.next();
  }
  
  // Check if the route is an auth API route
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }
  
  // For protected routes, check if the token cookie exists
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('No token found in cookies, redirecting to login:', pathname);
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Allow access to protected routes for users with a token
  // The components will handle token verification and role-based UI rendering
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}; 