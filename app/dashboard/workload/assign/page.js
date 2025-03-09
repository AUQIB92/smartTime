'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/ToastContext';

export default function AssignWorkloadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError } = useToast();
  
  const [loading, setLoading] = useState({
    user: true,
    teachers: true,
    subjects: true,
    classrooms: true,
    semesters: true,
  });
  
  const [user, setUser] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  
  // Form data for creating a new timetable entry
  const [formData, setFormData] = useState({
    teacher: '',
    subject: '',
    classroom: '',
    semester: '',
    dayOfWeek: 'Monday',
    startTime: '10:00',
    endTime: '10:45',
    classType: 'class', // 'class' or 'lab'
  });
  
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
  
  // Fetch data after we have user data
  useEffect(() => {
    if (user && user.department) {
      fetchTeachers();
      fetchSubjects();
      fetchClassrooms();
      fetchSemesters();
    }
  }, [user]);
  
  // Check if teacher was specified in URL
  useEffect(() => {
    const teacherId = searchParams.get('teacher');
    if (teacherId) {
      setSelectedTeacher(teacherId);
      setFormData(prev => ({ ...prev, teacher: teacherId }));
    }
  }, [searchParams, teachers]);
  
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
  
  // Fetch teachers in the HOD's department
  const fetchTeachers = async () => {
    try {
      const response = await fetch(`/api/users?role=teacher,hod&department=${user.department}`);
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }
      
      const data = await response.json();
      setTeachers(data.users);
      setLoading(prev => ({ ...prev, teachers: false }));
    } catch (error) {
      console.error('Error fetching teachers:', error);
      showError('Failed to load teachers');
      setLoading(prev => ({ ...prev, teachers: false }));
    }
  };
  
  // Fetch subjects in the HOD's department
  const fetchSubjects = async () => {
    try {
      const response = await fetch(`/api/subjects?department=${user.department}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }
      
      const data = await response.json();
      setSubjects(data.subjects);
      
      // Set first subject as default if available
      if (data.subjects.length > 0) {
        setFormData(prev => ({ ...prev, subject: data.subjects[0]._id }));
      }
      
      setLoading(prev => ({ ...prev, subjects: false }));
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showError('Failed to load subjects');
      setLoading(prev => ({ ...prev, subjects: false }));
    }
  };
  
  // Fetch classrooms
  const fetchClassrooms = async () => {
    try {
      const response = await fetch('/api/classrooms');
      if (!response.ok) {
        throw new Error('Failed to fetch classrooms');
      }
      
      const data = await response.json();
      setClassrooms(data.classrooms);
      
      // Set first classroom as default if available
      if (data.classrooms.length > 0) {
        setFormData(prev => ({ ...prev, classroom: data.classrooms[0]._id }));
      }
      
      setLoading(prev => ({ ...prev, classrooms: false }));
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      showError('Failed to load classrooms');
      setLoading(prev => ({ ...prev, classrooms: false }));
    }
  };
  
  // Fetch semesters
  const fetchSemesters = async () => {
    try {
      const response = await fetch('/api/semesters');
      if (!response.ok) {
        throw new Error('Failed to fetch semesters');
      }
      
      const data = await response.json();
      setLoading(prev => ({ ...prev, semesters: false }));
      
      if (!data.semesters || data.semesters.length === 0) {
        return;
      }
      
      setFormData(prev => ({ ...prev, semester: data.semesters[0]._id }));
      
      // Sort semesters by start date (newest first)
      const sortedSemesters = [...data.semesters].sort((a, b) => 
        new Date(b.startDate) - new Date(a.startDate)
      );
      
      setFormData(prev => ({ ...prev, semester: sortedSemesters[0]._id }));
      setLoading(prev => ({ ...prev, semesters: false }));
      setLoading(prev => ({ ...prev, semesters: false }));
      
      // Find the active semester and set it as default
      const activeSemester = sortedSemesters.find(s => s.isActive);
      if (activeSemester) {
        setFormData(prev => ({ ...prev, semester: activeSemester._id }));
      }
      
      setLoading(prev => ({ ...prev, semesters: false }));
      
      setFormData(prev => ({ ...prev, semester: sortedSemesters[0]._id }));
      setFormData(prev => ({ ...prev, semester: sortedSemesters[0]._id }));
      
      setLoading(prev => ({ ...prev, semesters: false }));
      setLoading(prev => ({ ...prev, semesters: false }));
      
      setSemesters(sortedSemesters);
    } catch (error) {
      console.error('Error fetching semesters:', error);
      showError('Failed to load semesters');
      setLoading(prev => ({ ...prev, semesters: false }));
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'classType') {
      // Update end time based on class type
      const startTimeIndex = timeSlots.indexOf(formData.startTime);
      if (startTimeIndex !== -1) {
        const endTimeIndex = value === 'class' ? startTimeIndex + 1 : startTimeIndex + 2;
        const endTime = endTimeIndex < timeSlots.length ? timeSlots[endTimeIndex] : timeSlots[timeSlots.length - 1];
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          endTime: endTime
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'startTime') {
      // Update end time based on start time and class type
      const startTimeIndex = timeSlots.indexOf(value);
      if (startTimeIndex !== -1) {
        const endTimeIndex = formData.classType === 'class' ? startTimeIndex + 1 : startTimeIndex + 2;
        const endTime = endTimeIndex < timeSlots.length ? timeSlots[endTimeIndex] : timeSlots[timeSlots.length - 1];
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          endTime: endTime
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === 'teacher') {
      setSelectedTeacher(value);
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Add department to the form data
      const timetableData = {
        ...formData,
        department: user.department
      };
      
      // Create timetable entry - this automatically populates the timetable
      const response = await fetch('/api/timetables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(timetableData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create timetable entry');
      }
      
      // Show success message
      success('Class successfully assigned to teacher. Timetable has been updated.');
      
      // Reset form to default values but keep the selected teacher
      setFormData({
        teacher: selectedTeacher,
        subject: formData.subject,
        classroom: formData.classroom,
        semester: formData.semester,
        dayOfWeek: 'Monday',
        startTime: '10:00',
        endTime: formData.classType === 'class' ? '10:45' : '11:30',
        classType: 'class',
      });
    } catch (error) {
      console.error('Error creating timetable entry:', error);
      showError(error.message || 'Failed to assign class to teacher');
    }
  };
  
  // Check if everything is loaded
  const isLoading = Object.values(loading).some(status => status === true);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }
  
  // If user is not HOD, show access denied
  if (user && user.role !== 'hod' && user.role !== 'admin') {
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
            You do not have permission to access this page. Only department heads can assign workload.
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
            <h1 className="text-2xl font-bold text-gray-900">Assign Teacher Workload</h1>
            <p className="mt-1 text-sm text-gray-500">
              Assign classes to teachers in your department. 
              The schedule will be applied for the entire semester.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/timetable"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              View Timetable
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Create New Class Assignment</h2>
          <p className="mt-1 text-sm text-gray-500">
            Assign a weekly recurring class to a teacher for the entire semester
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Teacher Selection */}
            <div className="sm:col-span-3">
              <label htmlFor="teacher" className="block text-sm font-medium text-gray-700">
                Teacher <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="teacher"
                  name="teacher"
                  required
                  value={formData.teacher}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} - {teacher.role === 'hod' ? 'Head of Department' : 'Teacher'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Subject Selection */}
            <div className="sm:col-span-3">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Classroom Selection */}
            <div className="sm:col-span-3">
              <label htmlFor="classroom" className="block text-sm font-medium text-gray-700">
                Classroom <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="classroom"
                  name="classroom"
                  required
                  value={formData.classroom}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select a classroom</option>
                  {classrooms.map((classroom) => (
                    <option key={classroom._id} value={classroom._id}>
                      {classroom.name} (Capacity: {classroom.capacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Semester Selection */}
            <div className="sm:col-span-3">
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                Semester <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="semester"
                  name="semester"
                  required
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select a semester</option>
                  {semesters.map((semester) => (
                    <option key={semester._id} value={semester._id}>
                      {semester.name} {semester.isActive ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Day of Week */}
            <div className="sm:col-span-3">
              <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700">
                Weekly Day <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="dayOfWeek"
                  name="dayOfWeek"
                  required
                  value={formData.dayOfWeek}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  This class will occur every {formData.dayOfWeek} throughout the semester
                </p>
              </div>
            </div>
            
            {/* Class Type */}
            <div className="sm:col-span-3">
              <label htmlFor="classType" className="block text-sm font-medium text-gray-700">
                Class Type <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="classType"
                  name="classType"
                  required
                  value={formData.classType}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="class">Regular Class (45 mins)</option>
                  <option value="lab">Lab Session (90 mins)</option>
                </select>
              </div>
            </div>
            
            {/* Start Time */}
            <div className="sm:col-span-3">
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="startTime"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  {timeSlots.slice(0, -1).map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* End Time (Auto-calculated based on start time and class type) */}
            <div className="sm:col-span-3">
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  readOnly
                  disabled
                  className="shadow-sm bg-gray-100 focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <p className="mt-1 text-xs text-gray-500">
                  End time is automatically calculated based on start time and class type
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> This assignment creates a recurring weekly schedule for the entire semester. The selected teacher will be teaching this class every {formData.dayOfWeek} at the specified time.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Link
              href="/dashboard"
              className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Assign Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 