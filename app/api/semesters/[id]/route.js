import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Semester from '@/models/Semester';

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

// GET /api/semesters/[id] - Get a specific semester
export async function GET(request, { params }) {
  try {
    const decoded = await getAuthenticatedUser();
    
    // Check if user is authenticated
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get semester ID from params
    const { id } = params;
    
    // Find semester by ID
    const semester = await Semester.findById(id).select('-__v');
    
    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }
    
    return NextResponse.json({ semester });
  } catch (error) {
    console.error('Error fetching semester:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/semesters/[id] - Update a specific semester
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
    
    // Get semester ID from params
    const { id } = params;
    
    // Get request body
    const body = await request.json();
    
    // Validate dates if both are provided
    if (body.startDate && body.endDate) {
      const startDate = new Date(body.startDate);
      const endDate = new Date(body.endDate);
      
      if (endDate <= startDate) {
        return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
      }
    }
    
    // Find and update semester
    const updatedSemester = await Semester.findByIdAndUpdate(id, body, { 
      new: true,
      runValidators: true
    });
    
    if (!updatedSemester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }
    
    return NextResponse.json({ semester: updatedSemester });
  } catch (error) {
    console.error('Error updating semester:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/semesters/[id] - Delete a specific semester
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
    
    // Get semester ID from params
    const { id } = params;
    
    // Find and delete semester
    const deletedSemester = await Semester.findByIdAndDelete(id);
    
    if (!deletedSemester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Semester deleted successfully' });
  } catch (error) {
    console.error('Error deleting semester:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 