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

// GET /api/departments - Get all departments
export async function GET(request) {
  try {
    const decoded = await getAuthenticatedUser();
    
    // Check if user is authenticated
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    
    // Build query based on filters
    const query = {};
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    // Fetch departments based on query
    const departments = await Department.find(query).select('-__v');
    
    return NextResponse.json({ departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/departments - Create a new department
export async function POST(request) {
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
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    const { name, code } = body;
    if (!name || !code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if department with same code already exists
    const existingDepartment = await Department.findOne({ code });
    if (existingDepartment) {
      return NextResponse.json({ error: 'Department with this code already exists' }, { status: 409 });
    }
    
    // Create new department
    const newDepartment = new Department(body);
    await newDepartment.save();
    
    return NextResponse.json({ department: newDepartment }, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/departments - Update multiple departments (batch update)
export async function PUT(request) {
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
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    const { departments } = body;
    if (!departments || !Array.isArray(departments) || departments.length === 0) {
      return NextResponse.json({ error: 'Invalid departments data' }, { status: 400 });
    }
    
    // Update departments
    const updatePromises = departments.map(async (departmentData) => {
      const { _id, ...updateData } = departmentData;
      if (!_id) return null;
      
      return Department.findByIdAndUpdate(_id, updateData, { new: true });
    });
    
    const updatedDepartments = await Promise.all(updatePromises);
    
    return NextResponse.json({ departments: updatedDepartments.filter(Boolean) });
  } catch (error) {
    console.error('Error updating departments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 