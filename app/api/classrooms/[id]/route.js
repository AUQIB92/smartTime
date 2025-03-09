import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Classroom from '@/models/Classroom';

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

// GET /api/classrooms/[id] - Get a specific classroom
export async function GET(request, { params }) {
  try {
    const decoded = await getAuthenticatedUser();
    
    // Check if user is authenticated
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get classroom ID from params
    const { id } = params;
    
    // Find classroom by ID
    const classroom = await Classroom.findById(id).select('-__v');
    
    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }
    
    return NextResponse.json({ classroom });
  } catch (error) {
    console.error('Error fetching classroom:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/classrooms/[id] - Update a specific classroom
export async function PATCH(request, { params }) {
  try {
    const decoded = await getAuthenticatedUser();
    
    // Check if user is authenticated
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get classroom ID from params
    const { id } = params;
    
    // Get request body
    const body = await request.json();
    
    // Find and update classroom
    const updatedClassroom = await Classroom.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedClassroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }
    
    return NextResponse.json({ classroom: updatedClassroom });
  } catch (error) {
    console.error('Error updating classroom:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/classrooms/[id] - Delete a specific classroom
export async function DELETE(request, { params }) {
  try {
    const decoded = await getAuthenticatedUser();
    
    // Check if user is authenticated
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get classroom ID from params
    const { id } = params;
    
    // Find and delete classroom
    const deletedClassroom = await Classroom.findByIdAndDelete(id);
    
    if (!deletedClassroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 