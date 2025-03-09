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

// GET /api/semesters - Get all semesters
export async function GET(request) {
  try {
    const decoded = await getAuthenticatedUser();
    
    // Check if user is authenticated
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get all semesters, sorted by start date (newest first)
    const semesters = await Semester.find({})
      .select('-__v')
      .sort({ startDate: -1 });
    
    return NextResponse.json({ semesters });
  } catch (error) {
    console.error('Error fetching semesters:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/semesters - Create a new semester
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
    if (!body.name || !body.startDate || !body.endDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, startDate, and endDate are required' 
      }, { status: 400 });
    }
    
    // Validate dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    
    if (endDate <= startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }
    
    // Create new semester
    const newSemester = new Semester({
      name: body.name,
      startDate,
      endDate,
      isActive: body.isActive || false
    });
    
    // If this semester is active, deactivate all other semesters
    if (body.isActive) {
      await Semester.updateMany({}, { isActive: false });
    }
    
    // Save the new semester
    await newSemester.save();
    
    return NextResponse.json({ semester: newSemester }, { status: 201 });
  } catch (error) {
    console.error('Error creating semester:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 