import Link from 'next/link';

export default function TeacherDashboard({ user }) {
  // Sample timetable data (in a real app, this would come from the database)
  const todayClasses = [
    { 
      subject: 'Mathematics', 
      classroom: '101', 
      startTime: '09:00 AM', 
      endTime: '10:30 AM',
      status: 'completed'
    },
    { 
      subject: 'Physics', 
      classroom: '203', 
      startTime: '11:00 AM', 
      endTime: '12:30 PM',
      status: 'upcoming'
    },
    { 
      subject: 'Computer Science', 
      classroom: '305', 
      startTime: '02:00 PM', 
      endTime: '03:30 PM',
      status: 'upcoming'
    },
  ];

  // Sample workload summary (in a real app, this would come from the database)
  const workloadSummary = {
    totalHours: 18,
    subjects: 3,
    classesPerWeek: 6,
  };

  return (
    <div>
      {/* Welcome Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Welcome, {user?.firstName || 'Teacher'}!</h2>
        <p className="text-gray-600 mb-4">Here's your teaching schedule for today.</p>
        
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Today's Date</p>
            <p className="text-lg font-semibold text-gray-800">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Today's Classes and Workload Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Classes */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Today's Classes</h2>
          </div>
          <div className="p-6">
            {todayClasses.length > 0 ? (
              <div className="space-y-4">
                {todayClasses.map((classItem, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      classItem.status === 'completed' 
                        ? 'border-gray-200 bg-gray-50' 
                        : 'border-indigo-200 bg-indigo-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">{classItem.subject}</h3>
                        <p className="text-sm text-gray-600">Room {classItem.classroom}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">
                          {classItem.startTime} - {classItem.endTime}
                        </p>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            classItem.status === 'completed' 
                              ? 'bg-gray-200 text-gray-700' 
                              : 'bg-indigo-200 text-indigo-700'
                          }`}
                        >
                          {classItem.status === 'completed' ? 'Completed' : 'Upcoming'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No classes scheduled for today.</p>
              </div>
            )}
            
            <div className="mt-6">
              <Link 
                href="/dashboard/timetable" 
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                View full timetable
                <svg
                  className="ml-1 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Workload Summary */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Workload Summary</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <p className="text-gray-600">Total Hours/Week</p>
                <p className="text-lg font-semibold text-gray-800">{workloadSummary.totalHours}</p>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <p className="text-gray-600">Subjects</p>
                <p className="text-lg font-semibold text-gray-800">{workloadSummary.subjects}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Classes/Week</p>
                <p className="text-lg font-semibold text-gray-800">{workloadSummary.classesPerWeek}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <Link 
                href="/dashboard/workload" 
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                View detailed workload
                <svg
                  className="ml-1 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 