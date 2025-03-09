import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractTokenPayload } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

/**
 * Get authenticated user for API routes
 * Uses token extraction instead of full verification for better performance
 * @returns {Object|null} - User object or null if not authenticated
 */
export async function getAuthenticatedUser() {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    const token = tokenCookie?.value;
    
    if (!token) {
      return null;
    }
    
    // Extract token payload without full verification
    const decoded = extractTokenPayload(token);
    
    if (!decoded) {
      return null;
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find user by ID
    const user = await User.findById(decoded.id).select('-password');
    
    return user || null;
  } catch (error) {
    console.error('Error getting authenticated user:', error.message);
    return null;
  }
}

/**
 * Check if user is authenticated and has required role
 * @param {Request} request - Next.js request object
 * @param {Array} allowedRoles - Array of allowed roles
 * @returns {Object} - Response object or null if authenticated
 */
export async function requireAuth(request, allowedRoles = []) {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  return null;
}

/**
 * Standard error response for API routes
 * @param {Error} error - Error object
 * @param {string} message - Custom error message
 * @returns {Object} - Next.js response object
 */
export function errorResponse(error, message = 'Internal Server Error') {
  console.error(`API Error: ${message}`, error);
  return NextResponse.json({ error: message }, { status: 500 });
} 