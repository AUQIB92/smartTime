import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    const { email, token, password } = body;
    if (!email || !token || !password) {
      return NextResponse.json({ error: 'Please provide email, verification token, and password' }, { status: 400 });
    }
    
    // Find user by email and verification token
    const user = await User.findOne({ email, verificationToken: token });
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 });
    }
    
    // Update user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.password = password;
    
    await user.save();
    
    return NextResponse.json({ message: 'Account verified successfully' });
  } catch (error) {
    console.error('Error verifying account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 