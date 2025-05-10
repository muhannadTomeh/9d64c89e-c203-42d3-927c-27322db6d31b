
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const AppSidebar = () => {
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
    <Sidebar className="w-64" side="right">
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path} className="mb-2">
                  <SidebarMenuButton 
                    asChild 
                    isActive={currentPath === item.path}
                    variant={currentPath === item.path ? "default" : "ghost"}
                    className="justify-start"
                  >
                    <Link to={item.path} className="w-full text-right">
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
