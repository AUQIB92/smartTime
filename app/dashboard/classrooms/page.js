'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClassroomsPage() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    floor: 1,
    capacity: 30,
    type: 'lecture',
    facilities: [],
  });
  const [facilityInput, setFacilityInput] = useState('');

  // Facility options
  const facilityOptions = [
    'Projector',
    'Smart Board',
    'Air Conditioning',
    'Computer Lab',
    'Wi-Fi',
    'Audio System',
    'Whiteboard',
    'Video Conferencing',
  ];

  // Fetch classrooms on component mount
  useEffect(() => {
    fetchClassrooms();
  }, []);

  // Fetch classrooms from API
  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/classrooms');
      
      if (!response.ok) {
        throw new Error('Failed to fetch classrooms');
      }
      
      const data = await response.json();
      setClassrooms(data.classrooms);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'floor' || name === 'capacity' ? parseInt(value, 10) : value 
    }));
  };

  // Handle facility selection
  const handleFacilitySelect = (facility) => {
    if (!formData.facilities.includes(facility)) {
      setFormData((prev) => ({
        ...prev,
        facilities: [...prev.facilities, facility],
      }));
    }
    setFacilityInput('');
  };

  // Handle custom facility input
  const handleAddCustomFacility = () => {
    if (facilityInput.trim() && !formData.facilities.includes(facilityInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        facilities: [...prev.facilities, facilityInput.trim()],
      }));
      setFacilityInput('');
    }
  };

  // Handle facility removal
  const handleRemoveFacility = (facility) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((f) => f !== facility),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/classrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create classroom');
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        building: '',
        floor: 1,
        capacity: 30,
        type: 'lecture',
        facilities: [],
      });
      setShowAddModal(false);
      
      // Refresh classrooms list
      fetchClassrooms();
    } catch (error) {
      console.error('Error creating classroom:', error);
      setError(error.message);
    }
  };

  // Handle classroom deletion
  const handleDeleteClassroom = async (classroomId) => {
    if (!confirm('Are you sure you want to delete this classroom?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/classrooms/${classroomId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete classroom');
      }
      
      // Refresh classrooms list
      fetchClassrooms();
    } catch (error) {
      console.error('Error deleting classroom:', error);
      setError(error.message);
    }
  };

  // Show loading state
  if (loading && classrooms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading classrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Classrooms Management</h1>
          <p className="text-gray-600">Manage all classrooms in the system</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Classroom
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No classrooms found
          </div>
        ) : (
          classrooms.map((classroom) => (
            <div key={classroom._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{classroom.name}</h3>
                    <p className="text-sm text-gray-500">{classroom.building}, Floor {classroom.floor}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 capitalize">
                    {classroom.type}
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Capacity: {classroom.capacity} students
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Facilities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {classroom.facilities && classroom.facilities.length > 0 ? (
                      classroom.facilities.map((facility, index) => (
                        <span key={index} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {facility}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No facilities listed</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => router.push(`/dashboard/classrooms/${classroom._id}`)}
                    className="text-teal-600 hover:text-teal-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClassroom(classroom._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Add Classroom Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">Add New Classroom</h3>
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
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Classroom Name/Number
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder="e.g. Room 101"
                  />
                </div>
                <div>
                  <label htmlFor="building" className="block text-sm font-medium text-gray-700">
                    Building
                  </label>
                  <input
                    type="text"
                    id="building"
                    name="building"
                    required
                    value={formData.building}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder="e.g. Science Block"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
                      Floor
                    </label>
                    <input
                      type="number"
                      id="floor"
                      name="floor"
                      min="0"
                      required
                      value={formData.floor}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                      Capacity
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      min="1"
                      required
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Classroom Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  >
                    <option value="lecture">Lecture Hall</option>
                    <option value="lab">Laboratory</option>
                    <option value="seminar">Seminar Room</option>
                    <option value="computer">Computer Lab</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facilities
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.facilities.map((facility, index) => (
                      <span key={index} className="px-2 py-1 text-xs rounded-full bg-teal-100 text-teal-800 flex items-center">
                        {facility}
                        <button
                          type="button"
                          onClick={() => handleRemoveFacility(facility)}
                          className="ml-1 text-teal-600 hover:text-teal-900"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={facilityInput}
                      onChange={(e) => setFacilityInput(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      placeholder="Add facility"
                      list="facility-options"
                    />
                    <datalist id="facility-options">
                      {facilityOptions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                    <button
                      type="button"
                      onClick={handleAddCustomFacility}
                      className="bg-teal-600 text-white px-3 py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Add
                    </button>
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
                  Create Classroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 