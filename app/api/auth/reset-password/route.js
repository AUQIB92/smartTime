import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/mailer';

// POST /api/auth/reset-password - Request password reset
export async function POST(request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    const { mobileNumber } = body;
    if (!mobileNumber) {
      return NextResponse.json({ error: 'Please provide mobile number' }, { status: 400 });
    }
    
    // Find user by mobile number
    const user = await User.findOne({ mobileNumber });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Generate reset token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set reset token and expiration
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    
    await user.save();
    
    // Send password reset email
    await sendPasswordResetEmail(user, resetToken);
    
    return NextResponse.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/auth/reset-password - Reset password
export async function PUT(request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    const { email, token, password } = body;
    if (!email || !token || !password) {
      return NextResponse.json({ error: 'Please provide email, reset token, and new password' }, { status: 400 });
    }
    
    // Find user by email and reset token
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }
    
    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 