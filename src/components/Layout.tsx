
import React from 'react';
import Sidebar from './Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-olive-50" dir="rtl">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content - shifted to accommodate the sidebar */}
      <div className="mr-64">
        {/* Header */}
        <header className="bg-white py-4 px-6 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-olive-800">
              {new Date().toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
            <div className="flex items-center gap-4">
              {/* Add user profile or notifications here if needed */}
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
