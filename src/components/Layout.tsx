
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
    <div className="min-h-screen bg-cream font-arabic" dir="rtl">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="bg-emerald-deep p-2 rounded-lg shadow-lg border border-gold/30 text-white"
        >
          {isMobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
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
      <div className="md:mr-72 transition-all duration-300">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md py-4 px-4 md:px-8 border-b border-sand-200/60 sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-emerald-deep hover:bg-gold/10"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </Button>
            </div>
            <h2 className="text-xs md:text-sm font-medium text-emerald-deep/70 text-right tracking-wide">
              {new Date().toLocaleDateString('ar-EG', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </h2>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-4 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
