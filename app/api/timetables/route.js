import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Timetable from '@/models/Timetable';
import User from '@/models/User';
import { sendSMS, formatClassAlertMessage } from '@/lib/twilio';

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

// GET /api/timetables - Get all timetables (with optional filtering)
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
    const teacherId = searchParams.get('teacher');
    const classroomId = searchParams.get('classroom');
    const semesterId = searchParams.get('semester');
    const dayOfWeek = searchParams.get('day');
    
    // Build query based on filters
    const query = { isActive: true };
    if (teacherId) query.teacher = teacherId;
    if (classroomId) query.classroom = classroomId;
    if (semesterId) query.semester = semesterId;
    if (dayOfWeek) query.dayOfWeek = dayOfWeek;
    
    // Fetch timetables based on query
    const timetables = await Timetable.find(query)
      .populate('teacher', 'name email phoneNumber')
      .populate('subject', 'name code')
      .populate('classroom', 'name building')
      .populate('semester', 'name')
      .select('-__v');
    
    return NextResponse.json({ timetables });
  } catch (error) {
    console.error('Error fetching timetables:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/timetables - Create a new timetable entry
export async function POST(request) {
  try {
    const decoded = await getAuthenticatedUser();
    
    // Check if user is authenticated
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    const { teacher, subject, classroom, semester, dayOfWeek, startTime, endTime } = body;
    if (!teacher || !subject || !classroom || !semester || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check for scheduling conflicts
    const conflictQuery = {
      $or: [
        // Check if classroom is already booked
        {
          classroom,
          dayOfWeek,
          semester,
          isActive: true,
          $or: [
            // New class starts during an existing class
            { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
            // New class ends during an existing class
            { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
            // New class completely contains an existing class
            { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
          ]
        },
        // Check if teacher is already booked
        {
          teacher,
          dayOfWeek,
          semester,
          isActive: true,
          $or: [
            // New class starts during an existing class
            { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
            // New class ends during an existing class
            { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
            // New class completely contains an existing class
            { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
          ]
        }
      ]
    };
    
    const conflict = await Timetable.findOne(conflictQuery);
    
    if (conflict) {
      return NextResponse.json({ 
        error: 'Scheduling conflict detected', 
        conflict 
      }, { status: 409 });
    }
    
    // Create new timetable entry
    const newTimetable = new Timetable(body);
    await newTimetable.save();
    
    // Populate the new timetable entry
    const populatedTimetable = await Timetable.findById(newTimetable._id)
      .populate('teacher', 'name email phoneNumber')
      .populate('subject', 'name code')
      .populate('classroom', 'name building')
      .populate('semester', 'name');
    
    return NextResponse.json({ timetable: populatedTimetable }, { status: 201 });
  } catch (error) {
    console.error('Error creating timetable:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/timetables - Update multiple timetable entries (batch update)
export async function PUT(request) {
  try {
    const decoded = await getAuthenticatedUser();
    
    // Check if user is authenticated
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    const { timetables } = body;
    if (!timetables || !Array.isArray(timetables) || timetables.length === 0) {
      return NextResponse.json({ error: 'Invalid timetables data' }, { status: 400 });
    }
    
    // Update timetables
    const updatePromises = timetables.map(async (timetableData) => {
      const { _id, ...updateData } = timetableData;
      if (!_id) return null;
      
      return Timetable.findByIdAndUpdate(_id, updateData, { new: true });
    });
    
    const updatedTimetables = await Promise.all(updatePromises);
    
    return NextResponse.json({ timetables: updatedTimetables.filter(Boolean) });
  } catch (error) {
    console.error('Error updating timetables:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/timetables/send-alerts - Send SMS alerts to teachers
export async function POST_SEND_ALERTS(request, { params, searchParams }) {
  try {
    const decoded = await getAuthenticatedUser();
    
    // Check if user is authenticated
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get current day and time
    const now = new Date();
    const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    
    // Format current time as HH:MM
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    // Find classes that are about to start in the next 30 minutes
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);
    const laterHour = thirtyMinutesLater.getHours().toString().padStart(2, '0');
    const laterMinute = thirtyMinutesLater.getMinutes().toString().padStart(2, '0');
    const thirtyMinLaterTime = `${laterHour}:${laterMinute}`;
    
    // Query for classes starting in the next 30 minutes
    const upcomingClasses = await Timetable.find({
      dayOfWeek: currentDay,
      startTime: { $gte: currentTime, $lte: thirtyMinLaterTime },
      isActive: true
    })
    .populate('teacher', 'name phoneNumber')
    .populate('subject', 'name')
    .populate('classroom', 'name');
    
    // Send SMS alerts to teachers
    const smsPromises = upcomingClasses.map(async (classInfo) => {
      if (!classInfo.teacher.phoneNumber) {
        return { success: false, error: 'No phone number available', class: classInfo._id };
      }
      
      try {
        const message = formatClassAlertMessage(classInfo);
        const result = await sendSMS(classInfo.teacher.phoneNumber, message);
        
        return { 
          success: true, 
          messageId: result.sid,
          teacher: classInfo.teacher._id,
          class: classInfo._id
        };
      } catch (error) {
        return { 
          success: false, 
          error: error.message,
          teacher: classInfo.teacher._id,
          class: classInfo._id
        };
      }
    });
    
    const smsResults = await Promise.all(smsPromises);
    
    return NextResponse.json({ 
      alerts: smsResults,
      totalSent: smsResults.filter(r => r.success).length,
      totalFailed: smsResults.filter(r => !r.success).length
    });
  } catch (error) {
    console.error('Error sending SMS alerts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 