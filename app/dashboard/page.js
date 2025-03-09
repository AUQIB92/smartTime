'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import PrincipalDashboard from '@/components/dashboard/PrincipalDashboard';
import HodDashboard from '@/components/dashboard/HodDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import { useToast } from '@/lib/ToastContext';

export default function DashboardPage() {
  const router = useRouter();
  const { success } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [welcomeShown, setWelcomeShown] = useState(false);

  useEffect(() => {
    // Fetch current user data
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
        setUser(data.user);
        
        // Show welcome toast only once
        if (!welcomeShown) {
          success(`Welcome back, ${data.user.name}!`);
          setWelcomeShown(true);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to load user data. Please try again.');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, success, welcomeShown]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  if (user) {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'principal':
        return <PrincipalDashboard user={user} />;
      case 'hod':
        return <HodDashboard user={user} />;
      case 'teacher':
      default:
        return <TeacherDashboard user={user} />;
    }
  }

  return null;
} 