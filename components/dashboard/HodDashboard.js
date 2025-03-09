'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/ToastContext';
import { formatDate } from '@/lib/utils';

export default function HodDashboard({ user }) {
  const { error: showError } = useToast();
  const [loading, setLoading] = useState({
    teachers: true,
    subjects: true,
    timetable: true,
    stats: true
  });
  const [departmentData, setDepartmentData] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);
  
  // Fetch department data and related information
  useEffect(() => {
    fetchDepartmentData();
    fetchTeachers();
    fetchSubjects();
    fetchTimetable();
    fetchActiveSemester();
  }, [user]);
  
  const fetchDepartmentData = async () => {
    try {
      // Fetch department by ID if user has department ID
      if (user?.department) {
        const response = await fetch(`/api/departments/${user.department}`);
        if (response.ok) {
          const data = await response.json();
          setDepartmentData(data.department);
        } else {
          // Fallback to mock data if can't fetch from API
          setDepartmentData({
            name: 'Computer Science',
            createdAt: new Date(),
            updatedAt: new Date(),
            description: 'Department of Computer Science and Engineering',
            _id: user.department
          });
        }
      }
      setLoading(prev => ({ ...prev, stats: false }));
    } catch (error) {
      console.error('Error fetching department:', error);
      showError('Failed to load department data');
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };
  
  const fetchTeachers = async () => {
    try {
      // Fetch teachers in this department
      const response = await fetch(`/api/users?role=teacher,hod&department=${user.department}`);
      if (response.ok) {
        const data = await response.json();
        setTeachers(data.users);
      }
      setLoading(prev => ({ ...prev, teachers: false }));
    } catch (error) {
      console.error('Error fetching teachers:', error);
      showError('Failed to load teachers data');
      setLoading(prev => ({ ...prev, teachers: false }));
    }
  };
  
  const fetchSubjects = async () => {
    try {
      // Fetch subjects for this department
      const response = await fetch(`/api/subjects?department=${user.department}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects);
      }
      setLoading(prev => ({ ...prev, subjects: false }));
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showError('Failed to load subjects data');
      setLoading(prev => ({ ...prev, subjects: false }));
    }
  };
  
  const fetchTimetable = async () => {
    try {
      // Fetch timetable entries for this department
      const response = await fetch(`/api/timetables?department=${user.department}`);
      if (response.ok) {
        const data = await response.json();
        setTimetableEntries(data.timetables);
        
        // Get upcoming classes (next 48 hours)
        const now = new Date();
        const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        
        const upcoming = data.timetables.filter(entry => {
          const entryDay = getDayNumber(entry.dayOfWeek);
          const currentDay = now.getDay();
          
          // If the entry is today or tomorrow
          if (
            (entryDay === currentDay) || 
            (entryDay === (currentDay + 1) % 7)
          ) {
            return true;
          }
          return false;
        });
        
        // Sort by day and time
        upcoming.sort((a, b) => {
          const dayDiff = getDayNumber(a.dayOfWeek) - getDayNumber(b.dayOfWeek);
          if (dayDiff !== 0) return dayDiff;
          return a.startTime.localeCompare(b.startTime);
        });
        
        setUpcomingClasses(upcoming.slice(0, 5)); // Show top 5 upcoming classes
      }
      setLoading(prev => ({ ...prev, timetable: false }));
    } catch (error) {
      console.error('Error fetching timetable:', error);
      showError('Failed to load timetable data');
      setLoading(prev => ({ ...prev, timetable: false }));
    }
  };
  
  const fetchActiveSemester = async () => {
    try {
      const response = await fetch('/api/semesters?isActive=true');
      if (response.ok) {
        const data = await response.json();
        if (data.semesters && data.semesters.length > 0) {
          setActiveSemester(data.semesters[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching active semester:', error);
    }
  };
  
  // Helper function to get numeric day of week
  const getDayNumber = (day) => {
    const days = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };
    return days[day] || 0;
  };
  
  // Calculate department statistics
  const getStats = () => {
    return [
      { 
        name: 'Department Teachers', 
        value: teachers.length.toString(), 
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' 
      },
      { 
        name: 'Department Subjects', 
        value: subjects.length.toString(), 
        icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' 
      },
      { 
        name: 'Weekly Classes', 
        value: timetableEntries.length.toString(), 
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' 
      },
    ];
  };
  
  // Calculate workload for each teacher
  const getTeachersWithWorkload = () => {
    const teachersWithWorkload = teachers.map(teacher => {
      // Count classes for this teacher
      const teacherClasses = timetableEntries.filter(entry => 
        entry.teacher === teacher._id
      );
      
      // Calculate hours (approximation: 45 min = 0.75 hour, 90 min = 1.5 hours)
      let workloadHours = 0;
      teacherClasses.forEach(entry => {
        const [startHour, startMin] = entry.startTime.split(':').map(Number);
        const [endHour, endMin] = entry.endTime.split(':').map(Number);
        
        const startTotalMins = startHour * 60 + startMin;
        const endTotalMins = endHour * 60 + endMin;
        const durationHours = (endTotalMins - startTotalMins) / 60;
        
        workloadHours += durationHours;
      });
      
      // Determine subjects taught
      const subjectIds = [...new Set(teacherClasses.map(entry => entry.subject))];
      const teacherSubjects = subjects.filter(subj => subjectIds.includes(subj._id));
      
      // Standard max workload
      const maxWorkload = 18;
      const workloadPercentage = Math.round((workloadHours / maxWorkload) * 100);
      
      return {
        ...teacher,
        workloadHours: Math.round(workloadHours * 10) / 10, // Round to 1 decimal place
        maxWorkload,
        workloadPercentage,
        subjects: teacherSubjects
      };
    });
    
    // Sort by workload percentage (highest first)
    return teachersWithWorkload.sort((a, b) => b.workloadPercentage - a.workloadPercentage);
  };
  
  // Check if everything is loaded
  const isLoading = Object.values(loading).some(status => status === true);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Get department details
  const departmentName = departmentData?.name || 'Department';
  const stats = getStats();
  const teachersWithWorkload = getTeachersWithWorkload();
  
  return (
    <div className="space-y-8">
      {/* Department Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{departmentName} Department</h2>
            <p className="text-gray-600">Department Head: {user?.name}</p>
            {activeSemester && (
              <p className="text-gray-500 text-sm">
                Current Semester: {activeSemester.name} ({formatDate(activeSemester.startDate, 'MMM dd')} - {formatDate(activeSemester.endDate, 'MMM dd, yyyy')})
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Link
              href="/dashboard/timetable"
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
            >
              View Timetable
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100 text-teal-600 mr-4">
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={stat.icon}
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Teachers Workload */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Teachers Workload</h2>
          <Link
            href="/dashboard/workload/assign"
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition text-sm"
          >
            Assign Workload
          </Link>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subjects
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workload
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachersWithWorkload.map((teacher) => (
                  <tr key={teacher._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                      <div className="text-xs text-gray-500">{teacher.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{teacher.designation || 'Teacher'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subject) => (
                          <span key={subject._id} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                            {subject.name}
                          </span>
                        ))}
                        {teacher.subjects.length === 0 && (
                          <span className="text-xs text-gray-500">No subjects assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 mr-4">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                teacher.workloadPercentage >= 90 ? 'bg-red-500' : 
                                teacher.workloadPercentage >= 75 ? 'bg-green-500' : 'bg-yellow-500'
                              }`} 
                              style={{ width: `${teacher.workloadPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                          {teacher.workloadHours}/{teacher.maxWorkload} hrs
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link 
                        href={`/dashboard/teachers/${teacher._id}`}
                        className="text-teal-600 hover:text-teal-900 mr-4"
                      >
                        View
                      </Link>
                      <Link 
                        href={`/dashboard/workload/assign?teacher=${teacher._id}`}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        Assign
                      </Link>
                    </td>
                  </tr>
                ))}
                {teachersWithWorkload.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No teachers found in this department
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Two-Column Layout for Upcoming Classes and Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Classes */}
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Classes</h2>
          </div>
          <div className="p-6">
            {upcomingClasses.length > 0 ? (
              <div className="space-y-4">
                {upcomingClasses.map((classItem) => {
                  const subject = subjects.find(s => s._id === classItem.subject);
                  const teacher = teachers.find(t => t._id === classItem.teacher);
                  
                  return (
                    <div key={classItem._id} className="flex bg-gray-50 rounded-lg p-4 items-center">
                      <div className="bg-teal-100 rounded-lg p-3 flex items-center justify-center mr-4">
                        <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{subject?.name || 'Unknown Subject'}</p>
                        <div className="flex flex-wrap text-sm text-gray-500">
                          <span className="mr-3">{classItem.dayOfWeek}, {classItem.startTime} - {classItem.endTime}</span>
                          <span>{teacher?.name || 'Unknown Teacher'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No upcoming classes found</p>
              </div>
            )}
          </div>
        </div>

        {/* Department Subjects */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Department Subjects</h2>
            <Link
              href="/dashboard/subjects"
              className="text-sm text-teal-600 hover:text-teal-800"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {subjects.length > 0 ? (
              <div className="space-y-3">
                {subjects.slice(0, 5).map((subject) => (
                  <div key={subject._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-800">{subject.name}</p>
                      <p className="text-xs text-gray-500">{subject.code}</p>
                    </div>
                    <Link
                      href={`/dashboard/subjects/${subject._id}`}
                      className="text-xs text-teal-600 hover:text-teal-800"
                    >
                      Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No subjects found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/timetable"
              className="flex items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition"
            >
              <div className="p-2 rounded-full bg-teal-100 text-teal-600 mr-3">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
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
              </div>
              <span className="text-sm font-medium text-gray-700">View Department Timetable</span>
            </Link>
            
            <Link
              href="/dashboard/teachers"
              className="flex items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition"
            >
              <div className="p-2 rounded-full bg-teal-100 text-teal-600 mr-3">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Department Teachers</span>
            </Link>
            
            <Link
              href="/dashboard/subjects"
              className="flex items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition"
            >
              <div className="p-2 rounded-full bg-teal-100 text-teal-600 mr-3">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Department Subjects</span>
            </Link>
            
            <Link
              href="/dashboard/workload/assign"
              className="flex items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition"
            >
              <div className="p-2 rounded-full bg-teal-100 text-teal-600 mr-3">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Assign Teacher Workload</span>
            </Link>
            
            <Link
              href="/dashboard/timetables"
              className="flex items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition"
            >
              <div className="p-2 rounded-full bg-teal-100 text-teal-600 mr-3">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Create New Timetable Entry</span>
            </Link>
            
            <Link
              href="/dashboard/reports"
              className="flex items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition"
            >
              <div className="p-2 rounded-full bg-teal-100 text-teal-600 mr-3">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">View Department Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 