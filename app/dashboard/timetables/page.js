'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/ToastContext';

export default function TimetablesPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [timetables, setTimetables] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
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
    fetchData();
  }, []);

  // Fetch all required data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch timetables
      const timetablesResponse = await fetch('/api/timetables');
      if (!timetablesResponse.ok) {
        throw new Error('Failed to fetch timetables');
      }
      const timetablesData = await timetablesResponse.json();
      
      // Fetch teachers (only users with role 'teacher' or 'hod')
      const teachersResponse = await fetch('/api/users?role=teacher,hod');
      if (!teachersResponse.ok) {
        throw new Error('Failed to fetch teachers');
      }
      const teachersData = await teachersResponse.json();
      
      // Fetch subjects
      const subjectsResponse = await fetch('/api/subjects');
      if (!subjectsResponse.ok) {
        throw new Error('Failed to fetch subjects');
      }
      const subjectsData = await subjectsResponse.json();
      
      // Fetch classrooms
      const classroomsResponse = await fetch('/api/classrooms');
      if (!classroomsResponse.ok) {
        throw new Error('Failed to fetch classrooms');
      }
      const classroomsData = await classroomsResponse.json();
      
      // Fetch semesters
      const semestersResponse = await fetch('/api/semesters');
      if (!semestersResponse.ok) {
        throw new Error('Failed to fetch semesters');
      }
      const semestersData = await semestersResponse.json();
      
      // Set state with fetched data
      setTimetables(timetablesData.timetables);
      setTeachers(teachersData.users);
      setSubjects(subjectsData.subjects);
      setClassrooms(classroomsData.classrooms);
      setSemesters(semestersData.semesters);
      
      // Set initial form data with first items if available
      if (teachersData.users.length && subjectsData.subjects.length && 
          classroomsData.classrooms.length && semestersData.semesters.length) {
        setFormData(prev => ({
          ...prev,
          teacher: teachersData.users[0]._id,
          subject: subjectsData.subjects[0]._id,
          classroom: classroomsData.classrooms[0]._id,
          semester: semestersData.semesters[0]._id,
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
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
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle day selection
  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create timetable entry
      const response = await fetch('/api/timetables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create timetable entry');
      }
      
      // Show success toast
      success('Class added successfully!');
      
      // Close modal and refresh data
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating timetable entry:', error);
      showError(error.message || 'Failed to create timetable entry');
    }
  };

  // Handle delete timetable
  const handleDeleteTimetable = async (timetableId) => {
    if (!confirm('Are you sure you want to delete this class?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/timetables/${timetableId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete timetable entry');
      }
      
      // Show success toast
      success('Class deleted successfully!');
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error deleting timetable entry:', error);
      showError(error.message || 'Failed to delete timetable entry');
    }
  };

  // Filter timetables by selected day
  const filteredTimetables = timetables.filter(
    timetable => timetable.dayOfWeek === selectedDay
  );

  // Create a 2D array to represent the timetable grid
  const createTimetableGrid = () => {
    // Initialize empty grid
    const grid = {};
    
    // Initialize time slots
    timeSlots.forEach((time, index) => {
      if (index < timeSlots.length - 1) {
        const timeRange = `${time} - ${timeSlots[index + 1]}`;
        grid[timeRange] = {};
      }
    });
    
    // Fill grid with timetable entries
    filteredTimetables.forEach(timetable => {
      const startIndex = timeSlots.indexOf(timetable.startTime);
      const endIndex = timeSlots.indexOf(timetable.endTime);
      
      if (startIndex !== -1 && endIndex !== -1) {
        // For each time slot this class occupies
        for (let i = startIndex; i < endIndex; i++) {
          const timeRange = `${timeSlots[i]} - ${timeSlots[i + 1]}`;
          
          if (!grid[timeRange]) {
            grid[timeRange] = {};
          }
          
          if (!grid[timeRange][timetable.classroom]) {
            grid[timeRange][timetable.classroom] = [];
          }
          
          grid[timeRange][timetable.classroom].push(timetable);
        }
      }
    });
    
    return grid;
  };

  // Helper function to find entity by ID
  const findById = (array, id) => {
    return array.find(item => item._id === id) || {};
  };

  // Get class type label
  const getClassTypeLabel = (startTime, endTime) => {
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);
    
    if (startIndex !== -1 && endIndex !== -1) {
      const duration = endIndex - startIndex;
      return duration === 1 ? 'Class' : 'Lab';
    }
    
    return 'Unknown';
  };

  // Get class color based on subject
  const getClassColor = (subjectId) => {
    // Generate a consistent color based on subject ID
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-yellow-100 border-yellow-300 text-yellow-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-pink-100 border-pink-300 text-pink-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800',
      'bg-red-100 border-red-300 text-red-800',
      'bg-orange-100 border-orange-300 text-orange-800',
    ];
    
    // Use a hash function to get a consistent index
    const hash = subjectId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading timetable data...</p>
        </div>
      </div>
    );
  }

  // Create timetable grid
  const timetableGrid = createTimetableGrid();
  const uniqueClassrooms = [...new Set(classrooms.map(classroom => classroom._id))];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Timetable Management</h1>
          <p className="text-gray-600">Manage class schedules across the institution</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Class
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Day selector */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => handleDaySelect(day)}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${
                selectedDay === day
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      
      {/* Beautiful Timetable */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{selectedDay} Schedule</h2>
          
          {Object.keys(timetableGrid).length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No classes scheduled for {selectedDay}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-200 bg-gray-50 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Slot
                    </th>
                    {classrooms.map(classroom => (
                      <th key={classroom._id} className="border border-gray-200 bg-gray-50 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {classroom.name} ({classroom.building})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(timetableGrid).map(timeSlot => (
                    <tr key={timeSlot} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                        {timeSlot}
                      </td>
                      {classrooms.map(classroom => {
                        const classes = timetableGrid[timeSlot]?.[classroom._id] || [];
                        return (
                          <td key={classroom._id} className="border border-gray-200 px-2 py-2 align-top">
                            {classes.map(timetable => {
                              const subject = findById(subjects, timetable.subject);
                              const teacher = findById(teachers, timetable.teacher);
                              const semester = findById(semesters, timetable.semester);
                              const classType = getClassTypeLabel(timetable.startTime, timetable.endTime);
                              const colorClass = getClassColor(timetable.subject);
                              
                              return (
                                <div 
                                  key={timetable._id} 
                                  className={`p-2 rounded-md border mb-1 ${colorClass}`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="font-medium">{subject.name || 'Unknown'}</div>
                                    <span className="text-xs px-1 py-0.5 rounded bg-white bg-opacity-50">
                                      {classType}
                                    </span>
                                  </div>
                                  <div className="text-xs mt-1">
                                    <div>{teacher.name || 'Unknown'} - {teacher.role === 'hod' ? 'Head of Department' : 'Teacher'}
                                      {teacher.department ? ` (${teacher.department.name || teacher.department})` : ''}
                                    </div>
                                    <div>{semester.name || 'Unknown'}</div>
                                  </div>
                                  <div className="flex justify-end mt-1 space-x-1">
                                    <button
                                      onClick={() => router.push(`/dashboard/timetables/${timetable._id}`)}
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTimetable(timetable._id)}
                                      className="text-xs text-red-600 hover:text-red-800"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Timetable Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">Add New Class</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="teacher" className="block text-sm font-medium text-gray-700">
                    Teacher
                  </label>
                  <select
                    id="teacher"
                    name="teacher"
                    required
                    value={formData.teacher}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name} - {teacher.role === 'hod' ? 'Head of Department' : 'Teacher'}
                        {teacher.department ? ` (${teacher.department.name || teacher.department})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="classroom" className="block text-sm font-medium text-gray-700">
                    Classroom
                  </label>
                  <select
                    id="classroom"
                    name="classroom"
                    required
                    value={formData.classroom}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    {classrooms.map((classroom) => (
                      <option key={classroom._id} value={classroom._id}>
                        {classroom.name} ({classroom.building})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                    Semester
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    required
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    {semesters.map((semester) => (
                      <option key={semester._id} value={semester._id}>
                        {semester.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="classType" className="block text-sm font-medium text-gray-700">
                    Class Type
                  </label>
                  <select
                    id="classType"
                    name="classType"
                    required
                    value={formData.classType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    <option value="class">Regular Class (45 mins)</option>
                    <option value="lab">Lab Session (90 mins)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700">
                    Day of Week
                  </label>
                  <select
                    id="dayOfWeek"
                    name="dayOfWeek"
                    required
                    value={formData.dayOfWeek}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <select
                      id="startTime"
                      name="startTime"
                      required
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    >
                      {timeSlots.slice(0, -1).map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <select
                      id="endTime"
                      name="endTime"
                      required
                      value={formData.endTime}
                      disabled
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    >
                      {timeSlots.slice(1).map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      End time is automatically set based on class type
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 