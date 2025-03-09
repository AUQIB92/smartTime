import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { sendWelcomeEmail } from '@/lib/mailer';
import { sendOTP } from '@/lib/sms';
import { getAuthenticatedUser, requireAuth, errorResponse } from '@/lib/api-helpers';

// GET /api/users - Get all users (with optional filtering)
export async function GET(request) {
  try {
    // Check authentication
    const authError = await requireAuth(request);
    if (authError) return authError;
    
    // Connect to the database
    await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const department = searchParams.get('department');
    
    // Build query based on filters
    const query = {};
    
    // Handle role filtering (support for comma-separated roles)
    if (role) {
      if (role.includes(',')) {
        // Multiple roles (comma-separated)
        const roles = role.split(',').map(r => r.trim());
        query.role = { $in: roles };
      } else {
        // Single role
        query.role = role;
      }
    }
    
    // Handle department filtering
    if (department) query.department = department;
    
    // Fetch users based on query
    const users = await User.find(query).select('-otp');
    
    return NextResponse.json({ users });
  } catch (error) {
    return errorResponse(error, 'Error fetching users');
  }
}

// POST /api/users - Create a new user
export async function POST(request) {
  try {
    // Check authentication (admin only)
    const authError = await requireAuth(request, ['admin']);
    if (authError) return authError;
    
    // Connect to the database
    await connectToDatabase();
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    const { name, email, mobileNumber, role } = body;
    if (!name || !mobileNumber || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, mobileNumber, and role are required' 
      }, { status: 400 });
    }
    
    // Check if user with mobile number already exists
    const existingUser = await User.findOne({ mobileNumber });
    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this mobile number already exists' 
      }, { status: 409 });
    }
    
    // Create new user
    const newUser = new User({
      name,
      email,
      mobileNumber,
      role,
      department: body.department,
      designation: body.designation,
      isActive: true,
      isVerified: false,
    });
    
    // Generate OTP for verification
    const otp = newUser.generateOTP();
    
    // Save user to database
    await newUser.save();
    
    // Send welcome email with OTP if email is provided
    if (email) {
      try {
        await sendWelcomeEmail(newUser, otp);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }
    }
    
    // Send OTP via SMS
    try {
      await sendOTP(mobileNumber, otp);
    } catch (smsError) {
      console.error('Error sending OTP via SMS:', smsError);
    }
    
    // Return user data without sensitive information
    const userData = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      mobileNumber: newUser.mobileNumber,
      role: newUser.role,
      department: newUser.department,
      designation: newUser.designation,
    };
    
    return NextResponse.json({ user: userData }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Error creating user');
  }
}

// PUT /api/users - Update multiple users (batch update)
export async function PUT(request) {
  try {
    // Check authentication (admin only)
    const authError = await requireAuth(request, ['admin']);
    if (authError) return authError;
    
    // Connect to the database
    await connectToDatabase();
    
    // Get request body
    const body = await request.json();
    
    // Validate users array
    if (!Array.isArray(body.users) || body.users.length === 0) {
      return NextResponse.json({ error: 'Users array is required' }, { status: 400 });
    }
    
    // Update users
    const updatePromises = body.users.map(async (userData) => {
      if (!userData._id) {
        return { error: 'User ID is required', userData };
      }
      
      try {
        const updatedUser = await User.findByIdAndUpdate(
          userData._id,
          { $set: userData },
          { new: true, runValidators: true }
        ).select('-password -otp');
        
        if (!updatedUser) {
          return { error: 'User not found', userData };
        }
        
        return { user: updatedUser };
      } catch (error) {
        return { error: error.message, userData };
      }
    });
    
    const results = await Promise.all(updatePromises);
    
    return NextResponse.json({ results });
  } catch (error) {
    return errorResponse(error, 'Error updating users');
  }
} 