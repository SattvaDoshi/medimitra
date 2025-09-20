import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, Search, User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ setSidebarOpen }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="hidden lg:block">
            <h1 className="text-2xl font-semibold text-gray-900">
              {getPageTitle(window.location.pathname)}
            </h1>
          </div>
        </div>

        {/* Center - Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search medicines, pharmacies..."
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Location (if available) */}
          {user?.location?.address?.city && (
            <div className="hidden sm:flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{user.location.address.city}</span>
            </div>
          )}

          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Bell className="h-5 w-5" />
          </button>

          {/* Profile */}
          <div className="relative">
            <Link
              to="/profile"
              className="flex items-center p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:block ml-2 text-sm font-medium">
                {user?.name}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search medicines, pharmacies..."
          />
        </div>
      </div>
    </header>
  );
};

// Helper function to get page title based on pathname
const getPageTitle = (pathname) => {
  const titles = {
    '/dashboard': 'Dashboard',
    '/inventory': 'Inventory Management',
    '/transactions': 'Transactions',
    '/search': 'Search Medicines',
    '/pharmacies': 'Find Pharmacies',
    '/reports': 'Reports & Analytics',
    '/quick-sale': 'Quick Sale',
    '/settings': 'Settings',
    '/profile': 'Profile',
  };
  
  return titles[pathname] || 'Dashboard';
};

export default Header;