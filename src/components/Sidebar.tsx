
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UsersRound,
  ShoppingCart,
  Wallet,
  Settings,
  Clock,
  FileText
} from 'lucide-react';

// Define the navigation item type
type NavItemProps = {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
};

// Individual navigation item component
const NavItem: React.FC<NavItemProps> = ({ to, label, icon, isActive }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 py-3 px-4 mb-1 rounded-lg transition-colors ${
      isActive
        ? 'bg-olive-600 text-white font-bold'
        : 'text-olive-700 hover:bg-olive-100'
    }`}
  >
    <div className="w-6 h-6 flex items-center justify-center">
      {icon}
    </div>
    <span className="text-sm">{label}</span>
  </Link>
);

const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} /> },
    { path: '/queue', label: 'إدارة الطابور', icon: <Clock size={20} /> },
    { path: '/invoices', label: 'حساب الرد', icon: <FileText size={20} /> },
    { path: '/customers', label: 'سجل الزبائن', icon: <UsersRound size={20} /> },
    { path: '/workers', label: 'العمال', icon: <UsersRound size={20} /> },
    { path: '/trading', label: 'بيع وشراء الزيت', icon: <ShoppingCart size={20} /> },
    { path: '/expenses', label: 'المصاريف', icon: <Wallet size={20} /> },
    { path: '/settings', label: 'الإعدادات', icon: <Settings size={20} /> },
  ];

  return (
    <div className="h-screen fixed top-0 right-0 w-64 bg-white shadow-lg py-6 px-3 overflow-y-auto z-10">
      {/* Logo/Header */}
      <div className="text-center mb-6 px-4">
        <h1 className="text-xl font-bold text-olive-800">إدارة المعصرة</h1>
        <div className="h-1 w-16 bg-olive-500 mx-auto mt-2 rounded-full"></div>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex flex-col">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            to={item.path}
            label={item.label}
            icon={item.icon}
            isActive={currentPath === item.path}
          />
        ))}
      </nav>
      
      {/* Footer */}
      <div className="mt-auto text-center pt-6 text-olive-600 text-xs">
        <p>جميع الحقوق محفوظة &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default Sidebar;
