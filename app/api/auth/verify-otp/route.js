import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { generateToken, setTokenCookie, verifyToken } from '@/lib/auth';
import { errorResponse } from '@/lib/api-helpers';

// Fallback function to verify OTP if the method is not available on the user object
function fallbackVerifyOTP(user, code) {
  return user.otp && 
         user.otp.code === code && 
         user.otp.expiresAt > new Date();
}

export async function POST(request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    const { mobileNumber, otp } = body;
    if (!mobileNumber || !otp) {
      return NextResponse.json({ error: 'Please provide mobile number and OTP' }, { status: 400 });
    }
    
    // Find user by mobile number
    const user = await User.findOne({ mobileNumber });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: 'Your account has been deactivated' }, { status: 401 });
    }
    
    // Log user object properties for debugging
    console.log('User object for verification:', {
      id: user._id,
      name: user.name,
      role: user.role,
      methods: Object.keys(user.__proto__),
      modelName: user.constructor.modelName,
      hasVerifyOTP: typeof user.verifyOTP === 'function',
      otp: user.otp ? { 
        hasCode: !!user.otp.code,
        hasExpiry: !!user.otp.expiresAt,
        isExpired: user.otp.expiresAt < new Date()
      } : null
    });
    
    // Verify OTP - try using the model method first, fall back to helper function if needed
    let isValidOTP = false;
    try {
      if (typeof user.verifyOTP === 'function') {
        isValidOTP = user.verifyOTP(otp);
      } else {
        console.warn('verifyOTP method not found on user object, using fallback');
        isValidOTP = fallbackVerifyOTP(user, otp);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      isValidOTP = fallbackVerifyOTP(user, otp);
    }
    
    if (!isValidOTP) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }
    
    // Mark user as verified if not already
    if (!user.isVerified) {
      user.isVerified = true;
    }
    
    // Clear OTP after successful verification
    user.otp = undefined;
    await user.save();
    
    // Generate JWT token with standard claims
    const token = generateToken({ 
      id: user._id, 
      role: user.role,
      name: user.name,
      email: user.email
    });
    
    // Verify token at login time to ensure it's valid
    // This is the only place where we do full verification
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Failed to generate valid token' }, { status: 500 });
    }
    
    // Set token in cookies using the helper function
    await setTokenCookie(token);
    
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
    return errorResponse(error, 'Error verifying OTP');
  }
} 