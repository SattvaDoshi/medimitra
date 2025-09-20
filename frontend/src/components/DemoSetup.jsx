import React from 'react';
import { useAuth } from '../context/AuthContext';

const DemoSetup = () => {
  const { login } = useAuth();

  const setupDemoUser = () => {
    // Create a demo user
    const demoUser = {
      _id: 'demo123',
      name: 'Demo User',
      email: 'demo@pharmacy.com',
      role: 'pharmacy_owner',
      pharmacy: 'demo-pharmacy-id'
    };

    const demoToken = 'demo-token-123';

    // Store in localStorage
    localStorage.setItem('token', demoToken);
    localStorage.setItem('user', JSON.stringify(demoUser));

    // Reload the page to trigger auth check
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">PharmaTrack Demo</h1>
          <p className="text-gray-600 mb-8">
            Click below to set up a demo pharmacy owner account to explore the features.
          </p>
          <button
            onClick={setupDemoUser}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Enter Demo Mode
          </button>
          <p className="mt-4 text-sm text-gray-500">
            This will create a temporary demo account with sample data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoSetup;