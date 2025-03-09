import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { requireAuth, errorResponse } from '@/lib/api-helpers';

// GET /api/users/[id] - Get a specific user
export async function GET(request, { params }) {
  try {
    // Check authentication
    const authError = await requireAuth(request);
    if (authError) return authError;
    
    // Connect to the database
    await connectToDatabase();
    
    // Get user ID from params
    const { id } = params;
    
    // Find user by ID
    const user = await User.findById(id).select('-password -otp');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    return errorResponse(error, 'Error fetching user');
  }
}

// PATCH /api/users/[id] - Update a specific user
export async function PATCH(request, { params }) {
  try {
    // Check authentication (admin only)
    const authError = await requireAuth(request, ['admin']);
    if (authError) return authError;
    
    // Connect to the database
    await connectToDatabase();
    
    // Get user ID from params
    const { id } = params;
    
    // Get request body
    const body = await request.json();
    
    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(id, body, { 
      new: true,
      runValidators: true
    }).select('-password -otp');
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return errorResponse(error, 'Error updating user');
  }
}

// DELETE /api/users/[id] - Delete a specific user
export async function DELETE(request, { params }) {
  try {
    // Check authentication (admin only)
    const authError = await requireAuth(request, ['admin']);
    if (authError) return authError;
    
    // Connect to the database
    await connectToDatabase();
    
    // Get user ID from params
    const { id } = params;
    
    // Find and delete user
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return errorResponse(error, 'Error deleting user');
  }
} 