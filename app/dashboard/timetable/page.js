'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/ToastContext';

export default function TimetablePage() {
  const router = useRouter();
  const { error: showError } = useToast();
  
  const [loading, setLoading] = useState({
    user: true,
    timetable: true,
    lookup: true,
  });
  
  const [user, setUser] = useState(null);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  
  // Time slots from 10:00 AM to 4:00 PM
  const timeSlots = [
    '10:00', '10:45', '11:30', '12:15', '13:00', '13:45', '14:30', '15:15', '16:00'
  ];
  
  // Days of the week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Fetch data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);
  
  // Fetch timetable data after user data is loaded
  useEffect(() => {
    if (user && user.department) {
      fetchTimetableData();
      fetchLookupData();
    }
  }, [user]);
  
  // Fetch current user data
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      setUser(data.user);
      setLoading(prev => ({ ...prev, user: false }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      showError('Failed to load user data');
      setLoading(prev => ({ ...prev, user: false }));
    }
  };
  
  // Fetch timetable data
  const fetchTimetableData = async () => {
    try {
      // For HOD, fetch timetable entries for their department
      const response = await fetch(`/api/timetables?department=${user.department}`);
      if (!response.ok) {
        throw new Error('Failed to fetch timetable data');
      }
      
      const data = await response.json();
      setTimetableEntries(data.timetables);
      setLoading(prev => ({ ...prev, timetable: false }));
    } catch (error) {
      console.error('Error fetching timetable data:', error);
      showError('Failed to load timetable data');
      setLoading(prev => ({ ...prev, timetable: false }));
    }
  };
  
  // Fetch lookup data (teachers, subjects, classrooms)
  const fetchLookupData = async () => {
    try {
      // Fetch teachers
      const teachersResponse = await fetch(`/api/users?role=teacher,hod&department=${user.department}`);
      
      // Fetch subjects
      const subjectsResponse = await fetch(`/api/subjects?department=${user.department}`);
      
      // Fetch classrooms
      const classroomsResponse = await fetch('/api/classrooms');
      
      if (!teachersResponse.ok || !subjectsResponse.ok || !classroomsResponse.ok) {
        throw new Error('Failed to fetch lookup data');
      }
      
      const teachersData = await teachersResponse.json();
      const subjectsData = await subjectsResponse.json();
      const classroomsData = await classroomsResponse.json();
      
      setTeachers(teachersData.users);
      setSubjects(subjectsData.subjects);
      setClassrooms(classroomsData.classrooms);
      setLoading(prev => ({ ...prev, lookup: false }));
    } catch (error) {
      console.error('Error fetching lookup data:', error);
      showError('Failed to load reference data');
      setLoading(prev => ({ ...prev, lookup: false }));
    }
  };
  
  // Handle day selection
  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };
  
  // Create timetable grid
  const createTimetableGrid = () => {
    // Filter entries for the selected day
    const dayEntries = timetableEntries.filter(entry => entry.dayOfWeek === selectedDay);
    
    // Group entries by classroom
    const entriesByClassroom = {};
    classrooms.forEach(classroom => {
      entriesByClassroom[classroom._id] = dayEntries.filter(entry => entry.classroom === classroom._id);
    });
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Time
              </th>
              {classrooms.map(classroom => (
                <th key={classroom._id} scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {classroom.name}
                  <div className="text-gray-400 text-xs normal-case font-normal">
                    Capacity: {classroom.capacity}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeSlots.slice(0, -1).map((startTime, index) => {
              const endTime = timeSlots[index + 1];
              
              return (
                <tr key={startTime}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                    {startTime} - {endTime}
                  </td>
                  
                  {classrooms.map(classroom => {
                    // Find entries for this classroom and time slot
                    const entries = entriesByClassroom[classroom._id]?.filter(entry => {
                      // Check if entry overlaps with current time slot
                      const entryStart = entry.startTime;
                      const entryEnd = entry.endTime;
                      return entryStart <= startTime && entryEnd >= endTime;
                    }) || [];
                    
                    if (entries.length === 0) {
                      return (
                        <td key={classroom._id} className="px-3 py-2 whitespace-nowrap text-sm text-gray-400 border-r border-gray-200">
                          <div className="h-12 flex items-center justify-center">
                            Available
                          </div>
                        </td>
                      );
                    }
                    
                    return (
                      <td key={classroom._id} className="px-1 py-1 whitespace-nowrap text-sm border-r border-gray-200">
                        {entries.map(entry => {
                          const subject = findById(subjects, entry.subject);
                          const teacher = findById(teachers, entry.teacher);
                          const classType = getClassTypeLabel(entry.startTime, entry.endTime);
                          const color = getClassColor(entry.subject);
                          
                          return (
                            <div
                              key={entry._id}
                              className={`p-2 rounded-md mb-1 last:mb-0 ${color}`}
                            >
                              <div className="font-medium">{subject?.name || 'Unknown'}</div>
                              <div className="text-xs mt-1">
                                <div>{teacher?.name || 'Unknown'}</div>
                                <div className="flex justify-between">
                                  <span>{classType}</span>
                                  <span>{entry.startTime} - {entry.endTime}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Helper function to find entity by ID
  const findById = (array, id) => {
    return array.find(item => item._id === id);
  };
  
  // Helper function to determine class type label
  const getClassTypeLabel = (startTime, endTime) => {
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);
    
    if (endIndex - startIndex === 1) {
      return 'Regular Class';
    } else if (endIndex - startIndex === 2) {
      return 'Lab Session';
    } else {
      return 'Custom Session';
    }
  };
  
  // Helper function to get class color based on subject
  const getClassColor = (subjectId) => {
    // Generate a consistent color based on subject ID
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-indigo-100 text-indigo-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-teal-100 text-teal-800',
    ];
    
    // Use last character of ID to select a color
    const colorIndex = parseInt(subjectId.slice(-1), 16) % colors.length;
    return colors[colorIndex];
  };
  
  // Check if everything is loaded
  const isLoading = Object.values(loading).some(status => status === true);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading timetable data...</p>
        </div>
      </div>
    );
  }
  
  // If user is not HOD or admin, show access denied
  if (user && user.role !== 'hod' && user.role !== 'admin' && user.role !== 'principal') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You do not have permission to access this page.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Go back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Timetable</h1>
            <p className="mt-1 text-sm text-gray-500">
              View your department's weekly class schedule for the entire semester
            </p>
            {activeSemester && (
              <p className="mt-2 text-xs text-gray-600">
                <span className="font-medium">Current Semester:</span> {activeSemester.name} 
                ({formatDate(activeSemester.startDate, 'MMM d, yyyy')} - {formatDate(activeSemester.endDate, 'MMM d, yyyy')})
              </p>
            )}
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/workload/assign"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Assign Workload
            </Link>
          </div>
        </div>
      </div>
      
      {/* Day selector */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Weekly Timetable View</h2>
          <p className="text-sm text-gray-500">
            This timetable shows the recurring weekly schedule for the semester. 
            Select a day to view all classes scheduled for that day.
          </p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => handleDaySelect(day)}
                  className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none flex-shrink-0 ${
                    selectedDay === day
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          
          {/* Timetable Grid */}
          {timetableEntries.length > 0 ? (
            createTimetableGrid()
          ) : (
            <div className="text-center py-10">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No classes scheduled</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no classes scheduled for this department yet.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/workload/assign"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Assign New Class
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 