
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItemProps {
  to: string;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, isActive }) => (
  <Link
    to={to}
    className={`w-full py-4 px-6 text-center font-bold transition-colors ${
      isActive
        ? 'bg-olive-600 text-white shadow-md'
        : 'bg-olive-500 text-white hover:bg-olive-600'
    }`}
  >
    {label}
  </Link>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/', label: 'لوحة التحكم' },
    { path: '/queue', label: 'إدارة الطابور' },
    { path: '/invoices', label: 'حساب الرد' },
    { path: '/customers', label: 'سجل الزبائن' },
    { path: '/workers', label: 'العمال' },
    { path: '/trading', label: 'بيع وشراء الزيت' },
    { path: '/expenses', label: 'المصاريف' },
    { path: '/settings', label: 'الإعدادات' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-olive-50 rtl">
      {/* Header */}
      <header className="bg-olive-700 py-4 text-white text-center shadow-md">
        <h1 className="text-2xl font-bold">إدارة المعصرة</h1>
      </header>
      
      {/* Navigation */}
      <nav className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-0 shadow-md">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            to={item.path}
            label={item.label}
            isActive={currentPath === item.path}
          />
        ))}
      </nav>
      
      {/* Main content */}
      <main className="flex-grow p-4 md:p-6">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-olive-700 py-3 text-white text-center text-sm shadow-inner">
        <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} - نظام إدارة معصرة الزيتون</p>
      </footer>
    </div>
  );
};

export default Layout;
