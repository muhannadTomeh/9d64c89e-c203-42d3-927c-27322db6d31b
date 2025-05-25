
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-olive-50 font-arabic" dir="rtl">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="bg-white p-2 rounded-lg shadow-lg border border-olive-200"
        >
          {isMobileMenuOpen ? (
            <X size={24} className="text-olive-800" />
          ) : (
            <Menu size={24} className="text-olive-800" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} />
      
      {/* Main content - responsive margins for RTL */}
      <div className="md:mr-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-white py-4 px-4 md:px-6 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-sm md:text-lg font-bold text-olive-800 text-right">
              {new Date().toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-4 md:p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
