'use client';

import React from 'react';
import { useToast, TOAST_TYPES } from '@/lib/ToastContext';

// Individual toast component
function ToastItem({ toast, onClose }) {
  const { id, message, type } = toast;
  
  // Get the appropriate styles based on toast type
  const getToastStyles = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return {
          container: 'bg-green-50 border-l-4 border-green-500',
          icon: (
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          text: 'text-green-700',
        };
      case TOAST_TYPES.ERROR:
        return {
          container: 'bg-red-50 border-l-4 border-red-500',
          icon: (
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
          text: 'text-red-700',
        };
      case TOAST_TYPES.WARNING:
        return {
          container: 'bg-yellow-50 border-l-4 border-yellow-500',
          icon: (
            <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
          text: 'text-yellow-700',
        };
      case TOAST_TYPES.INFO:
      default:
        return {
          container: 'bg-blue-50 border-l-4 border-blue-500',
          icon: (
            <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ),
          text: 'text-blue-700',
        };
    }
  };
  
  const styles = getToastStyles();
  
  return (
    <div 
      className={`${styles.container} p-4 rounded-md shadow-md mb-3 flex items-start animate-fade-in`}
      role="alert"
    >
      <div className="flex-shrink-0">
        {styles.icon}
      </div>
      <div className={`ml-3 ${styles.text}`}>
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button 
        onClick={() => onClose(id)} 
        className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-500 hover:text-gray-700 rounded-lg p-1.5"
      >
        <span className="sr-only">Close</span>
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

// Toast container component
export default function Toast() {
  const { toasts, removeToast } = useToast();
  
  if (toasts.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
} 