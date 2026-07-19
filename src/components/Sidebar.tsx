import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UsersRound,
  ShoppingCart,
  Wallet,
  Settings,
  Clock,
  FileText,
  HardHat,
  Leaf,
} from 'lucide-react';
import { useSupabaseMillContext } from '@/context/SupabaseMillContext';

type NavItemProps = {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
};

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, isActive, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`group relative flex items-center gap-4 py-3 px-4 mb-1.5 rounded-xl transition-all text-right ${
      isActive
        ? 'bg-emerald text-white font-bold shadow-lg shadow-black/20'
        : 'text-cream/70 hover:bg-white/5 hover:text-white'
    }`}
  >
    {isActive && (
      <span className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-l-full bg-gold" />
    )}
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <span className="text-sm flex-1">{label}</span>
  </Link>
);

type SidebarProps = { isOpen: boolean; onClose: () => void };

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { pathname } = useLocation();
  const { userProfile } = useSupabaseMillContext();

  const navItems = [
    { path: '/', label: 'لوحة التحكم', icon: <LayoutDashboard size={18} /> },
    { path: '/queue', label: 'إدارة الطابور', icon: <Clock size={18} /> },
    { path: '/invoices', label: 'حساب الرد', icon: <FileText size={18} /> },
    { path: '/customers', label: 'سجل الزبائن', icon: <UsersRound size={18} /> },
    { path: '/workers', label: 'إدارة العمال', icon: <HardHat size={18} /> },
    { path: '/trading', label: 'بيع وشراء الزيت', icon: <ShoppingCart size={18} /> },
    { path: '/expenses', label: 'المصاريف', icon: <Wallet size={18} /> },
    { path: '/settings', label: 'الإعدادات', icon: <Settings size={18} /> },
  ];

  const Brand = () => (
    <div className="flex items-center gap-3 px-2">
      <div className="w-11 h-11 bg-gold rounded-xl flex items-center justify-center shadow-lg shadow-black/30">
        <Leaf className="w-6 h-6 text-emerald-deep" strokeWidth={2.5} />
      </div>
      <div className="text-right">
        <h1 className="font-display text-lg font-extrabold text-white leading-tight">إدارة المعصرة</h1>
        <p className="text-[10px] text-gold tracking-widest uppercase">Olive Mill</p>
      </div>
    </div>
  );

  const Nav = () => (
    <nav className="flex-1 flex flex-col mt-2">
      {navItems.map((item) => (
        <NavItem
          key={item.path}
          to={item.path}
          label={item.label}
          icon={item.icon}
          isActive={pathname === item.path}
          onClick={onClose}
        />
      ))}
    </nav>
  );

  const UserFooter = () => (
    <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-emerald-deep font-bold text-lg flex-shrink-0">
        {userProfile?.full_name?.charAt(0) || 'م'}
      </div>
      <div className="text-right flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">
          {userProfile?.full_name || 'مستخدم'}
        </p>
        <p className="text-xs text-cream/50">
          {userProfile?.role === 'admin' ? 'مدير النظام' : 'مستخدم'}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex flex-col h-screen fixed top-0 right-0 w-72 bg-emerald-deep py-6 px-4 overflow-y-auto z-10 font-arabic shadow-2xl">
        <div className="pt-2 pb-8"><Brand /></div>
        <Nav />
        <UserFooter />
        <p className="mt-4 text-center text-[10px] text-cream/40 tracking-wide">
          &copy; {new Date().getFullYear()} جميع الحقوق محفوظة
        </p>
      </aside>

      <aside
        className={`md:hidden flex flex-col fixed top-0 right-0 h-full w-80 bg-emerald-deep py-6 px-4 overflow-y-auto z-30 transform transition-transform duration-300 font-arabic shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="pt-12 pb-8"><Brand /></div>
        <Nav />
        <UserFooter />
      </aside>
    </>
  );
};

export default Sidebar;
