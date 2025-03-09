import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { sendOTP } from '@/lib/sms';

// Helper function to generate OTP in case the method on the model is not working
function generateFallbackOTP() {
  // Generate 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/login - Request OTP
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
    
    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: 'Your account has been deactivated' }, { status: 401 });
    }
    
    // Log user object properties for debugging
    console.log('User object found:', {
      id: user._id,
      name: user.name,
      role: user.role,
      methods: Object.keys(user.__proto__),
      modelName: user.constructor.modelName,
      hasGenerateOTP: typeof user.generateOTP === 'function'
    });
    
    // Generate OTP - try using the model method first, fall back to helper function if needed
    let otp;
    try {
      if (typeof user.generateOTP === 'function') {
        otp = user.generateOTP();
      } else {
        throw new Error('generateOTP method not found on user object');
      }
    } catch (error) {
      console.warn('Error using model generateOTP method, using fallback:', error);
      otp = generateFallbackOTP();
      // Set OTP and expiration on the user object manually
      user.otp = {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      };
    }
    
    await user.save();
    
    // Send OTP via SMS (or display in console in development)
    try {
      await sendOTP(user.mobileNumber, otp);
      
      // In development, you can include the OTP in the response for testing
      const isDevelopment = process.env.NODE_ENV !== 'production';
      
      return NextResponse.json({ 
        message: 'OTP sent successfully',
        mobileNumber: user.mobileNumber,
        // Only include OTP in development mode
        ...(isDevelopment && { otp })
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      // Continue even if SMS fails, for development purposes
      return NextResponse.json({ 
        message: 'OTP generated but SMS sending failed. Check server logs for OTP.',
        mobileNumber: user.mobileNumber,
        // Only include OTP in development mode
        ...(process.env.NODE_ENV !== 'production' && { otp })
      });
    }
  } catch (error) {
    console.error('Error requesting OTP:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/auth/login - Login with OTP
export async function POSTLoginWithOTP(request) {
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
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json({ error: 'Please verify your account first' }, { status: 401 });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: 'Your account has been deactivated' }, { status: 401 });
    }
    
    // Check if OTP matches - using the correct method name or fallback
    let isMatch = false;
    try {
      if (typeof user.verifyOTP === 'function') {
        isMatch = user.verifyOTP(otp);
      } else {
        // Fallback verification logic
        isMatch = user.otp && 
                 user.otp.code === otp && 
                 user.otp.expiresAt > new Date();
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      // Fallback verification logic
      isMatch = user.otp && 
               user.otp.code === otp && 
               user.otp.expiresAt > new Date();
    }
    
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    }
    
    // Generate JWT token
    const token = generateToken({ id: user._id });
    
    // Set token in cookies directly in the route handler
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      sameSite: 'strict',
    });
    
    // Return user data (without password)
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
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 