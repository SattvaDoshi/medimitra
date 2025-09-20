// Simple test component to check if React is working
import React from 'react';

const TestComponent = () => {
  console.log('TestComponent is rendering');
  
  return (
    <div className="p-8 bg-white">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Component</h1>
      <p className="text-gray-600">If you can see this, React is working properly!</p>
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-blue-800">Current time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default TestComponent;