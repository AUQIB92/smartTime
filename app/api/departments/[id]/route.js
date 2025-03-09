import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Department from '@/models/Department';

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

// GET /api/departments/[id] - Get a specific department
export async function GET(request, { params }) {
  try {
    const decoded = await getAuthenticatedUser();
    
    // Check if user is authenticated
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get department ID from params
    const { id } = params;
    
    // Find department by ID
    const department = await Department.findById(id).select('-__v');
    
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }
    
    return NextResponse.json({ department });
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/departments/[id] - Update a specific department
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
    
    // Get department ID from params
    const { id } = params;
    
    // Get request body
    const body = await request.json();
    
    // If code is being updated, check for duplicates
    if (body.code) {
      const existingDepartment = await Department.findOne({ 
        code: body.code,
        _id: { $ne: id }
      });
      
      if (existingDepartment) {
        return NextResponse.json({ error: 'Department with this code already exists' }, { status: 409 });
      }
    }
    
    // Find and update department
    const updatedDepartment = await Department.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedDepartment) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }
    
    return NextResponse.json({ department: updatedDepartment });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/departments/[id] - Delete a specific department
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
    
    // Get department ID from params
    const { id } = params;
    
    // Find and delete department
    const deletedDepartment = await Department.findByIdAndDelete(id);
    
    if (!deletedDepartment) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 