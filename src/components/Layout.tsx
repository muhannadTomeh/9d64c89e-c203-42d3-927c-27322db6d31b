
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from './AppSidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-olive-50 rtl">
        {/* Header */}
        <header className="bg-olive-700 py-4 text-white text-center shadow-md">
          <h1 className="text-2xl font-bold">إدارة المعصرة</h1>
        </header>
        
        {/* Main content with sidebar */}
        <div className="flex flex-1">
          {/* Main content */}
          <main className="flex-grow p-4 md:p-6">
            <div className="container mx-auto">
              {children}
            </div>
          </main>
          
          {/* Sidebar */}
          <AppSidebar />
        </div>
        
        {/* Footer */}
        <footer className="bg-olive-700 py-3 text-white text-center text-sm shadow-inner">
          <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} - نظام إدارة معصرة الزيتون</p>
        </footer>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
