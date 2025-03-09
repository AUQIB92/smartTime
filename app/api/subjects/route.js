import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Subject from '@/models/Subject';

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

// GET /api/subjects - Get all subjects (with optional filtering)
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
    const department = searchParams.get('department');
    
    // Build query based on filters
    const query = {};
    if (department) query.department = department;
    
    // Fetch subjects based on query
    const subjects = await Subject.find(query).select('-__v');
    
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/subjects - Create a new subject
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
    const { name, code, department, credits, hoursPerWeek } = body;
    if (!name || !code || !department || !credits || !hoursPerWeek) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if subject with same code already exists
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return NextResponse.json({ error: 'Subject with this code already exists' }, { status: 409 });
    }
    
    // Create new subject
    const newSubject = new Subject(body);
    await newSubject.save();
    
    return NextResponse.json({ subject: newSubject }, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/subjects - Update multiple subjects (batch update)
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
    const { subjects } = body;
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json({ error: 'Invalid subjects data' }, { status: 400 });
    }
    
    // Update subjects
    const updatePromises = subjects.map(async (subjectData) => {
      const { _id, ...updateData } = subjectData;
      if (!_id) return null;
      
      return Subject.findByIdAndUpdate(_id, updateData, { new: true });
    });
    
    const updatedSubjects = await Promise.all(updatePromises);
    
    return NextResponse.json({ subjects: updatedSubjects.filter(Boolean) });
  } catch (error) {
    console.error('Error updating subjects:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 