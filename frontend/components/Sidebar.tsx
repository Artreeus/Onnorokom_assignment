'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Users, BookOpen, FileCheck, LayoutDashboard, PlusCircle, CheckSquare, Info } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const adminNav = [
    { name: 'Dashboard & Users', href: '/admin', icon: Users },
    { name: 'Classes & Subjects', href: '/admin?tab=classes', icon: BookOpen },
  ];

  const teacherNav = [
    { name: 'Assignments Portal', href: '/teacher', icon: LayoutDashboard },
    { name: 'Create Assignment', href: '/teacher?action=create', icon: PlusCircle },
  ];

  const studentNav = [
    { name: 'My Assignments Feed', href: '/student', icon: FileCheck },
    { name: 'Submitted Answers', href: '/student?filter=submitted', icon: CheckSquare },
  ];

  const items = user.role === 'Admin' ? adminNav : user.role === 'Teacher' ? teacherNav : studentNav;

  return (
    <aside className="w-60 bg-white border-r border-slate-200 shrink-0 hidden md:block min-h-[calc(100vh-3.5rem)] p-4">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Navigation ({user.role})
          </div>
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href.split('?')[0];
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-800 flex items-center mb-1">
              <Info className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Role Testing Guide
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Sign out anytime to switch between Admin, Teacher, and Student demo roles.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
