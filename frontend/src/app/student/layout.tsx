'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRequireAuth } from '@/store/auth-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  GraduationCap,
  LayoutDashboard,
  ScanLine,
  History,
  BookOpen,
  AlertTriangle,
  LogOut,
  Menu,
  Bell,
  Sun,
  Moon,
  Calendar
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { name: 'Enter Code', href: '/student/scan', icon: ScanLine },
  { name: 'Class Timetable', href: '/student/timetable', icon: Calendar },
  { name: 'Attendance History', href: '/student/attendance', icon: History },
  { name: 'Subject Attendance', href: '/student/subjects', icon: BookOpen },
  { name: 'Alerts', href: '/student/alerts', icon: AlertTriangle },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const auth = useRequireAuth('student');
  const pathname = usePathname();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (pathname === '/student/login') {
    return <>{children}</>;
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    auth.logout();
    router.push('/');
  };

  if (auth.isLoading || !auth.isAuthenticated || auth.user?.role !== 'student') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300">
      {/* Brand Logo */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-gray-100 dark:border-gray-800">
        <div className="bg-gradient-to-tr from-teal-500 to-emerald-600 p-2 rounded-lg text-white">
          <GraduationCap className="w-5 h-5" />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-lg bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-emerald-400">
            AttendX Student
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-gray-500'}`} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User / Logout */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/40">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
              RH
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{auth.user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{auth.user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0 text-red-500" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <div className={`hidden md:block h-full transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* Desktop Collapse Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {pathname.split('/').pop() || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-600 rounded-full" />
            </Button>

            <div className="h-8 w-px bg-gray-100 dark:bg-gray-800 hidden sm:block" />

            {/* Profile Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-sm">
                RH
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">Student Portal</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Scroll Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-950/30 p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
