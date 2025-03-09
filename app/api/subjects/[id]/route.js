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

// GET /api/subjects/[id] - Get a specific subject
export async function GET(request, { params }) {
  try {
    const decoded = await getAuthenticatedUser();
    
    // Check if user is authenticated
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get subject ID from params
    const { id } = params;
    
    // Find subject by ID
    const subject = await Subject.findById(id).select('-__v');
    
    if (!subject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }
    
    return NextResponse.json({ subject });
  } catch (error) {
    console.error('Error fetching subject:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/subjects/[id] - Update a specific subject
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
    
    // Get subject ID from params
    const { id } = params;
    
    // Get request body
    const body = await request.json();
    
    // If code is being updated, check for duplicates
    if (body.code) {
      const existingSubject = await Subject.findOne({ 
        code: body.code,
        _id: { $ne: id }
      });
      
      if (existingSubject) {
        return NextResponse.json({ error: 'Subject with this code already exists' }, { status: 409 });
      }
    }
    
    // Find and update subject
    const updatedSubject = await Subject.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedSubject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }
    
    return NextResponse.json({ subject: updatedSubject });
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/subjects/[id] - Delete a specific subject
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
    
    // Get subject ID from params
    const { id } = params;
    
    // Find and delete subject
    const deletedSubject = await Subject.findByIdAndDelete(id);
    
    if (!deletedSubject) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 