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

// GET /api/classrooms - Get all classrooms (with optional filtering)
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
    const building = searchParams.get('building');
    const type = searchParams.get('type');
    
    // Build query based on filters
    const query = { isActive: true };
    if (building) query.building = building;
    if (type) query.type = type;
    
    // Fetch classrooms based on query
    const classrooms = await Classroom.find(query).select('-__v');
    
    return NextResponse.json({ classrooms });
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/classrooms - Create a new classroom
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
    const { name, building, floor, capacity, type } = body;
    if (!name || !building || floor === undefined || capacity === undefined || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create new classroom
    const newClassroom = new Classroom(body);
    await newClassroom.save();
    
    return NextResponse.json({ classroom: newClassroom }, { status: 201 });
  } catch (error) {
    console.error('Error creating classroom:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/classrooms - Update multiple classrooms (batch update)
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
    const { classrooms } = body;
    if (!classrooms || !Array.isArray(classrooms) || classrooms.length === 0) {
      return NextResponse.json({ error: 'Invalid classrooms data' }, { status: 400 });
    }
    
    // Update classrooms
    const updatePromises = classrooms.map(async (classroomData) => {
      const { _id, ...updateData } = classroomData;
      if (!_id) return null;
      
      return Classroom.findByIdAndUpdate(_id, updateData, { new: true });
    });
    
    const updatedClassrooms = await Promise.all(updatePromises);
    
    return NextResponse.json({ classrooms: updatedClassrooms.filter(Boolean) });
  } catch (error) {
    console.error('Error updating classrooms:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 