import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddMedicine from './pages/AddMedicine';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import QuickSale from './pages/QuickSale';
import Staff from './pages/Staff';
import PharmacySearch from './pages/PharmacySearch';
import Unauthorized from './pages/Unauthorized';
import DemoSetup from './components/DemoSetup';
import TestComponent from './components/TestComponent';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/demo" element={<DemoSetup />} />
            <Route path="/test" element={<TestComponent />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/inventory" element={
              <ProtectedRoute allowedRoles={['pharmacy_owner', 'staff']}>
                <DashboardLayout>
                  <Inventory />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/inventory/add" element={
              <ProtectedRoute allowedRoles={['pharmacy_owner', 'staff']}>
                <DashboardLayout>
                  <AddMedicine />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/transactions" element={
              <ProtectedRoute allowedRoles={['pharmacy_owner', 'staff']}>
                <DashboardLayout>
                  <Transactions />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['pharmacy_owner']}>
                <DashboardLayout>
                  <Reports />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/quick-sale" element={
              <ProtectedRoute allowedRoles={['pharmacy_owner', 'staff']}>
                <DashboardLayout>
                  <QuickSale />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={['pharmacy_owner']}>
                <DashboardLayout>
                  <Staff />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/pharmacy-search" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <DashboardLayout>
                  <PharmacySearch />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/test" replace />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;