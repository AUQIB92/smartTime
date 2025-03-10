'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/ToastContext';
import { formatDate } from '@/lib/utils';

export default function PrincipalDashboard({ user }) {
  const { error: showError } = useToast();
  const [loading, setLoading] = useState({
    departments: true,
    teachers: true,
    timetable: true,
    semesters: true
  });
  
  // Data states
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeSemester, setActiveSemester] = useState(null);
  
  // Filter states
  const [selectedView, setSelectedView] = useState('department'); // 'department', 'teacher', 'whereIs'
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedSemester, setSelectedSemester] = useState('');
  
  // Time slots from 10:00 AM to 4:00 PM
  const timeSlots = [
    '10:00', '10:45', '11:30', '12:15', '13:00', '13:45', '14:30', '15:15', '16:00'
  ];
  
  // Days of the week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Fetch data on component mount
  useEffect(() => {
    fetchDepartments();
    fetchTeachers();
    fetchSemesters();
    fetchClassrooms();
    fetchSubjects();
  }, []);
  
  // Fetch timetable data when filters change
  useEffect(() => {
    if (departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0]._id);
    }
    
    if (teachers.length > 0 && !selectedTeacher) {
      setSelectedTeacher(teachers[0]._id);
    }
    
    if (semesters.length > 0 && !selectedSemester) {
      // Find active semester
      const active = semesters.find(sem => sem.isActive);
      if (active) {
        setSelectedSemester(active._id);
        setActiveSemester(active);
      } else {
        setSelectedSemester(semesters[0]._id);
        setActiveSemester(semesters[0]);
      }
    }
    
    if (selectedSemester) {
      fetchTimetableData();
    }
  }, [departments, teachers, semesters, selectedDepartment, selectedTeacher, selectedSemester, selectedView]);
  
  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.status}`);
      }
      const data = await response.json();
      console.log('Departments fetched:', data.departments.length);
      setDepartments(data.departments);
      setLoading(prev => ({ ...prev, departments: false }));
    } catch (error) {
      console.error('Error fetching departments:', error);
      showError('Failed to load departments');
      setLoading(prev => ({ ...prev, departments: false }));
    }
  };
  
  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/users?role=teacher,hod');
      if (!response.ok) {
        throw new Error(`Failed to fetch teachers: ${response.status}`);
      }
      const data = await response.json();
      console.log('Teachers fetched:', data.users.length);
      setTeachers(data.users);
      setLoading(prev => ({ ...prev, teachers: false }));
    } catch (error) {
      console.error('Error fetching teachers:', error);
      showError('Failed to load teachers');
      setLoading(prev => ({ ...prev, teachers: false }));
    }
  };
  
  const fetchSemesters = async () => {
    try {
      const response = await fetch('/api/semesters');
      if (response.ok) {
        const data = await response.json();
        setSemesters(data.semesters);
      }
      setLoading(prev => ({ ...prev, semesters: false }));
    } catch (error) {
      console.error('Error fetching semesters:', error);
      showError('Failed to load semesters');
      setLoading(prev => ({ ...prev, semesters: false }));
    }
  };
  
  const fetchClassrooms = async () => {
    try {
      const response = await fetch('/api/classrooms');
      if (!response.ok) {
        throw new Error(`Failed to fetch classrooms: ${response.status}`);
      }
      const data = await response.json();
      console.log('Classrooms fetched:', data.classrooms.length);
      setClassrooms(data.classrooms);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      showError('Failed to load classrooms');
    }
  };
  
  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      if (!response.ok) {
        throw new Error(`Failed to fetch subjects: ${response.status}`);
      }
      const data = await response.json();
      console.log('Subjects fetched:', data.subjects.length);
      setSubjects(data.subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showError('Failed to load subjects');
    }
  };
  
  const fetchTimetableData = async () => {
    try {
      setLoading(prev => ({ ...prev, timetable: true }));
      
      // Build the URL with appropriate query parameters
      let url = '/api/timetables?';
      
      // For teacher view, make sure we're getting the specific teacher's data
      if (selectedView === 'teacher' && selectedTeacher) {
        url += `teacher=${selectedTeacher}&`;
      } else if (selectedView === 'department' && selectedDepartment) {
        url += `department=${selectedDepartment}&`;
      }
      
      // Always include semester filter
      if (selectedSemester) {
        url += `semester=${selectedSemester}`;
      }
      
      console.log('Fetching timetable data from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        showError(errorData.message || 'Failed to load timetable data');
        setLoading(prev => ({ ...prev, timetable: false }));
        return;
      }
      
      const data = await response.json();
      console.log('Timetable data received:', data.timetables.length, 'entries');
      
      // Log a sample entry to debug
      if (data.timetables.length > 0) {
        console.log('Sample timetable entry:', data.timetables[0]);
        console.log('Teacher data in entry:', data.timetables[0].teacher);
        console.log('Subject data in entry:', data.timetables[0].subject);
        console.log('Classroom data in entry:', data.timetables[0].classroom);
      }
      
      setTimetableEntries(data.timetables);
      setLoading(prev => ({ ...prev, timetable: false }));
    } catch (error) {
      console.error('Error fetching timetable data:', error);
      showError('Failed to load timetable data');
      setLoading(prev => ({ ...prev, timetable: false }));
    }
  };
  
  // Handler functions for UI interactions
  const handleViewSelect = (view) => {
    setSelectedView(view);
  };
  
  const handleDepartmentSelect = (e) => {
    setSelectedDepartment(e.target.value);
  };
  
  const handleTeacherSelect = (e) => {
    setSelectedTeacher(e.target.value);
  };
  
  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };
  
  const handleSemesterSelect = (e) => {
    setSelectedSemester(e.target.value);
  };
  
  // Create timetable grid for department view
  const createDepartmentTimetableGrid = () => {
    // Filter entries for the selected day and department
    const filteredEntries = timetableEntries.filter(entry => 
      entry.dayOfWeek === selectedDay && 
      entry.department === selectedDepartment
    );
    
    // Group entries by classroom
    const entriesByClassroom = {};
    classrooms.forEach(classroom => {
      entriesByClassroom[classroom._id] = filteredEntries.filter(entry => 
        entry.classroom === classroom._id
      );
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
                          const subject = getSubjectById(entry.subject);
                          const teacher = getTeacherById(entry.teacher);
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
  
  // Create timetable grid for teacher view
  const createTeacherTimetableGrid = () => {
    // Filter entries for the selected day and teacher
    const filteredEntries = timetableEntries.filter(entry => 
      entry.dayOfWeek === selectedDay && 
      entry.teacher === selectedTeacher
    );
    
    console.log(`Found ${filteredEntries.length} classes for teacher ${selectedTeacher} on ${selectedDay}`);
    
    // Sort entries by start time
    const sortedEntries = [...filteredEntries].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );
    
    if (sortedEntries.length === 0) {
      const teacher = getTeacherById(selectedTeacher);
      const teacherName = teacher ? teacher.name : 'This teacher';
      
      return (
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
            {teacherName} has no classes scheduled for {selectedDay}.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {sortedEntries.map(entry => {
          try {
            const subject = getSubjectById(entry.subject);
            const classroom = getClassroomById(entry.classroom);
            const department = getDepartmentById(entry.department);
            const classType = getClassTypeLabel(entry.startTime, entry.endTime);
            const color = getClassColor(entry.subject);
            
            return (
              <div 
                key={entry._id} 
                className={`${color} p-4 rounded-lg shadow-sm border border-gray-100`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{subject?.name || 'Unknown Subject'}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Time:</span> {entry.startTime} - {entry.endTime}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Type:</span> {classType}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Room:</span> {classroom?.name || 'Unknown'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Department:</span> {department?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-50 px-3 py-1 rounded-full text-sm">
                    {selectedDay}
                  </div>
                </div>
              </div>
            );
          } catch (error) {
            console.error('Error rendering class entry:', error, entry);
            return (
              <div key={entry._id || Math.random()} className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-100 text-red-800">
                <p className="font-medium">Error displaying class</p>
                <p className="text-sm mt-1">There was an error displaying this class information.</p>
              </div>
            );
          }
        })}
      </div>
    );
  };
  
  // Create "Who is Where" view
  const createWhoIsWhereView = () => {
    // Filter entries for the selected day
    const filteredEntries = timetableEntries.filter(entry => 
      entry.dayOfWeek === selectedDay
    );
    
    console.log(`Found ${filteredEntries.length} entries for ${selectedDay}`);
    
    // Group entries by time slot
    const entriesByTimeSlot = {};
    
    timeSlots.slice(0, -1).forEach((startTime, index) => {
      const endTime = timeSlots[index + 1];
      const timeSlotKey = `${startTime}-${endTime}`;
      
      entriesByTimeSlot[timeSlotKey] = filteredEntries.filter(entry => {
        const entryStart = entry.startTime;
        const entryEnd = entry.endTime;
        return entryStart <= startTime && entryEnd >= endTime;
      });
    });
    
    if (Object.values(entriesByTimeSlot).flat().length === 0) {
      return (
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No classes scheduled</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no classes scheduled for {selectedDay} in the selected semester.
          </p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Time Slot
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ongoing Classes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeSlots.slice(0, -1).map((startTime, index) => {
              const endTime = timeSlots[index + 1];
              const timeSlotKey = `${startTime}-${endTime}`;
              const entries = entriesByTimeSlot[timeSlotKey] || [];
              
              return (
                <tr key={timeSlotKey} className={entries.length > 0 ? "" : "bg-gray-50"}>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                    {startTime} - {endTime}
                  </td>
                  <td className="px-3 py-4">
                    {entries.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {entries.map(entry => {
                          try {
                            // Check if data is already populated by the API
                            const teacherName = entry.teacher?.name || getTeacherById(entry.teacher)?.name || `Teacher (ID: ${typeof entry.teacher === 'string' ? entry.teacher.slice(-4) : 'Unknown'})`;
                            const subjectName = entry.subject?.name || getSubjectById(entry.subject)?.name || `Subject (ID: ${typeof entry.subject === 'string' ? entry.subject.slice(-4) : 'Unknown'})`;
                            const classroomName = entry.classroom?.name || getClassroomById(entry.classroom)?.name || `Room (ID: ${typeof entry.classroom === 'string' ? entry.classroom.slice(-4) : 'Unknown'})`;
                            
                            // Get department - might need to look up from teacher or use local array
                            let departmentName = 'Unknown Department';
                            if (entry.department) {
                              departmentName = typeof entry.department === 'object' && entry.department.name 
                                ? entry.department.name 
                                : getDepartmentById(entry.department)?.name || `Dept (ID: ${typeof entry.department === 'string' ? entry.department.slice(-4) : 'Unknown'})`;
                            } else if (entry.teacher && typeof entry.teacher === 'object' && entry.teacher.department) {
                              departmentName = typeof entry.teacher.department === 'object' && entry.teacher.department.name
                                ? entry.teacher.department.name
                                : getDepartmentById(entry.teacher.department)?.name || `Dept (ID: ${typeof entry.teacher.department === 'string' ? entry.teacher.department.slice(-4) : 'Unknown'})`;
                            }
                            
                            const classType = getClassTypeLabel(entry.startTime, entry.endTime);
                            const color = getClassColor(typeof entry.subject === 'string' ? entry.subject : entry.subject?._id);
                            
                            // Debug logging
                            console.log('Entry data:', {
                              teacher: entry.teacher,
                              teacherName,
                              subject: entry.subject,
                              subjectName,
                              classroom: entry.classroom,
                              classroomName,
                              department: entry.department,
                              departmentName
                            });
                            
                            return (
                              <div 
                                key={entry._id} 
                                className={`${color} p-3 rounded-md shadow-sm border border-gray-100`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">{teacherName}</p>
                                    <p className="text-xs mt-1 font-medium">{subjectName}</p>
                                    <p className="text-xs mt-1">
                                      {classroomName} • {classType}
                                    </p>
                                    <p className="text-xs mt-1 text-gray-600">
                                      {departmentName}
                                    </p>
                                  </div>
                                  <div className="text-xs text-right">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                      {entry.startTime} - {entry.endTime}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          } catch (error) {
                            console.error('Error rendering class entry:', error, entry);
                            return (
                              <div key={entry._id || Math.random()} className="bg-red-50 p-4 rounded-md shadow-sm border border-red-100 text-red-800">
                                <p className="font-medium">Error displaying class</p>
                                <p className="text-xs mt-1">ID: {entry._id?.slice(-6) || 'Unknown'}</p>
                              </div>
                            );
                          }
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No classes scheduled during this time slot</p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Helper functions for data lookup
  const safeGetById = (array, id, defaultValue = null) => {
    if (!array || !Array.isArray(array)) {
      console.warn(`Array is not valid for ID lookup: ${id}`);
      return defaultValue;
    }
    
    if (!id) {
      console.warn('ID is null or undefined for lookup');
      return defaultValue;
    }
    
    try {
      const item = array.find(item => item._id === id);
      if (!item) {
        console.warn(`Item with ID ${id} not found in array of length ${array.length}`);
      }
      return item || defaultValue;
    } catch (error) {
      console.error(`Error finding item with ID ${id}:`, error);
      return defaultValue;
    }
  };
  
  const getClassroomById = (id) => {
    return safeGetById(classrooms, id, { name: 'Unknown Classroom' });
  };
  
  const getSubjectById = (id) => {
    return safeGetById(subjects, id, { name: 'Unknown Subject' });
  };
  
  const getTeacherById = (id) => {
    return safeGetById(teachers, id, { name: 'Unknown Teacher' });
  };
  
  const getDepartmentById = (id) => {
    return safeGetById(departments, id, { name: 'Unknown Department' });
  };
  
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
    
    try {
      // Handle null, undefined, or non-string subjectId
      if (!subjectId) {
        return colors[0]; // Default to first color
      }
      
      // If subjectId is an object, try to get the _id property
      const idToUse = typeof subjectId === 'object' ? subjectId._id : subjectId;
      
      if (!idToUse || typeof idToUse !== 'string') {
        return colors[0];
      }
      
      // Use last character of ID to select a color
      const colorIndex = parseInt(idToUse.slice(-1), 16) % colors.length || 0;
      return colors[colorIndex];
    } catch (error) {
      console.error('Error generating class color:', error);
      return colors[0]; // Default to first color on error
    }
  };
  
  // Check if everything is loaded
  const isLoading = Object.values(loading).some(status => status === true);
  
  // Add a useEffect to log the state of data for debugging
  useEffect(() => {
    if (!loading.departments && !loading.teachers && !loading.classrooms && !loading.subjects) {
      console.log('Data loaded for lookup:');
      console.log('Departments:', departments.length);
      console.log('Teachers:', teachers.length);
      console.log('Classrooms:', classrooms.length);
      console.log('Subjects:', subjects.length);
      
      // Log sample data for debugging
      if (departments.length > 0) console.log('Sample department:', departments[0]);
      if (teachers.length > 0) console.log('Sample teacher:', teachers[0]);
      if (classrooms.length > 0) console.log('Sample classroom:', classrooms[0]);
      if (subjects.length > 0) console.log('Sample subject:', subjects[0]);
    }
  }, [loading, departments, teachers, classrooms, subjects]);
  
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
  
  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Principal Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage institution-wide timetables and schedules
            </p>
            {activeSemester && (
              <p className="mt-2 text-xs text-gray-600">
                <span className="font-medium">Current Semester:</span> {activeSemester.name} 
                ({formatDate(activeSemester.startDate, 'MMM d, yyyy')} - {formatDate(activeSemester.endDate, 'MMM d, yyyy')})
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* View Selector and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* View Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View Type</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleViewSelect('department')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedView === 'department'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                By Department
              </button>
              <button
                onClick={() => handleViewSelect('teacher')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedView === 'teacher'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                By Teacher
              </button>
              <button
                onClick={() => handleViewSelect('whereIs')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedView === 'whereIs'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Who is Where
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Department Filter - Show only for department view */}
            {selectedView === 'department' && (
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  id="department"
                  value={selectedDepartment}
                  onChange={handleDepartmentSelect}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                >
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Teacher Filter - Show only for teacher view */}
            {selectedView === 'teacher' && (
              <div>
                <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher
                </label>
                <select
                  id="teacher"
                  value={selectedTeacher}
                  onChange={handleTeacherSelect}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                >
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} - {teacher.role === 'hod' ? 'Head of Department' : 'Teacher'}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Semester Filter - Always show */}
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                Semester
              </label>
              <select
                id="semester"
                value={selectedSemester}
                onChange={handleSemesterSelect}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
              >
                {semesters.map(semester => (
                  <option key={semester._id} value={semester._id}>
                    {semester.name} {semester.isActive ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Day Selector - Always show */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week
              </label>
              <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-md">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    onClick={() => handleDaySelect(day)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      selectedDay === day
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Timetable View */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {selectedView === 'department' && 'Department Timetable'}
            {selectedView === 'teacher' && 'Teacher Schedule'}
            {selectedView === 'whereIs' && 'Who is Where'}
          </h2>
          <p className="text-sm text-gray-500">
            {selectedView === 'department' && 'View the timetable for the selected department'}
            {selectedView === 'teacher' && 'View the schedule for the selected teacher'}
            {selectedView === 'whereIs' && 'See which teachers are in class at each time slot'}
          </p>
        </div>
        
        <div className="p-6">
          {selectedView === 'department' && createDepartmentTimetableGrid()}
          {selectedView === 'teacher' && createTeacherTimetableGrid()}
          {selectedView === 'whereIs' && createWhoIsWhereView()}
        </div>
      </div>
    </div>
  );
} 