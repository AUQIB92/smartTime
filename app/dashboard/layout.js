'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user data is already in sessionStorage
    const storedUser = sessionStorage.getItem('user');
    
    if (storedUser) {
      try {
        // If user data exists in session storage, use it
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Continue to fetch user data if parsing fails
      }
    }

    // Fetch current user data if not in sessionStorage
    const fetchUser = async () => {
      try {
        console.log('Fetching user data from /api/auth/me');
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          console.log('Failed to fetch user data, status:', response.status);
          // If not authenticated, redirect to login
          router.push('/login');
          return;
        }
        
        const data = await response.json();
        console.log('User data fetched successfully:', data.user);
        
        // Store user data in sessionStorage for future use
        sessionStorage.setItem('user', JSON.stringify(data.user));
        
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect in useEffect)
  if (!user) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar user={user} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 