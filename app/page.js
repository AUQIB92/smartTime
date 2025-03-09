'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setUserRole(data.user.role);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    checkAuth();
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-800 text-white">
        <div className="container mx-auto px-6 py-16">
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center">
              <svg className="h-10 w-10 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <div className="text-2xl font-bold">SmartTime</div>
            </div>
            <div>
              {isLoggedIn ? (
                <Link 
                  href="/dashboard"
                  className="bg-white text-teal-600 px-5 py-2 rounded-md font-medium hover:bg-teal-50 transition"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="space-x-4">
                  <Link 
                    href="/login" 
                    className="bg-white text-teal-600 px-5 py-2 rounded-md font-medium hover:bg-teal-50 transition"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </nav>
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Intelligent Timetable Management System
              </h1>
              <p className="text-xl mb-8 text-teal-100">
                Streamline your institution's scheduling with our comprehensive timetable management solution.
              </p>
              <div className="space-x-4">
                <Link 
                  href={isLoggedIn ? "/dashboard" : "/login"} 
                  className="bg-white text-teal-600 px-6 py-3 rounded-md font-medium hover:bg-teal-50 transition"
                >
                  Get Started
                </Link>
                <Link 
                  href="#features" 
                  className="border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:bg-opacity-10 transition"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-14 right-20 w-64 h-64 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
              <div className="bg-white bg-opacity-10 p-8 rounded-2xl border border-white border-opacity-20 backdrop-filter backdrop-blur-lg relative z-10">
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(9)].map((_, i) => (
                    <div 
                      key={i} 
                      className="aspect-square bg-white bg-opacity-10 rounded-md flex items-center justify-center"
                    >
                      <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 rounded-md opacity-60"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">Key Features</h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Our platform offers a comprehensive set of tools designed to make timetable management effortless and efficient.
          </p>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-xl border border-teal-100 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Role-Based Access</h3>
              <p className="text-gray-600">
                Different dashboards for Admins, HoDs, Principals, and Teachers with tailored features for each role.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-xl border border-teal-100 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Smart Scheduling</h3>
              <p className="text-gray-600">
                Automatically prevent scheduling conflicts for teachers and classrooms with our intelligent algorithm.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-xl border border-teal-100 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">SMS Notifications</h3>
              <p className="text-gray-600">
                Automatic SMS alerts for teachers before their scheduled classes to ensure punctuality and preparedness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">How It Works</h2>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Our platform simplifies the complex process of timetable management in just a few easy steps.
          </p>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Admin Setup</h3>
              <p className="text-gray-600">
                Administrators configure classrooms, subjects, and add teachers to the system.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Workload Assignment</h3>
              <p className="text-gray-600">
                HoDs assign teaching workload to teachers in their department.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Schedule Creation</h3>
              <p className="text-gray-600">
                The system generates conflict-free timetables based on workload assignments.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Automated Alerts</h3>
              <p className="text-gray-600">
                Teachers receive SMS notifications before their scheduled classes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-teal-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your institution's scheduling?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-teal-100">
            Join thousands of educational institutions that have transformed their timetable management with SmartTime.
          </p>
          <Link 
            href={isLoggedIn ? "/dashboard" : "/login"} 
            className="bg-white text-teal-600 px-8 py-4 rounded-md font-medium hover:bg-teal-50 transition inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <div className="text-xl font-bold">SmartTime</div>
              </div>
              <p className="text-gray-400 mt-2">Intelligent Timetable Management</p>
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-400 hover:text-white transition">
                About
              </Link>
              <Link href="#features" className="text-gray-400 hover:text-white transition">
                Features
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition">
                Contact
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            &copy; {new Date().getFullYear()} SmartTime. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
