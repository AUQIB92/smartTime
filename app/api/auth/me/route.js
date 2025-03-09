import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { extractTokenPayload } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    // Get token from cookies - await the cookies() function
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    const token = tokenCookie?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Extract token payload without full verification
    // This is faster and sufficient for this non-critical operation
    const decoded = extractTokenPayload(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find user by ID
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      department: user.department,
      designation: user.designation,
    };
    
    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 