'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { LogOut, User as UserIcon, GraduationCap, BookOpen, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleBadges = {
    Admin: 'bg-purple-50 text-purple-700 border-purple-200',
    Teacher: 'bg-blue-50 text-blue-700 border-blue-200',
    Student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const roleIcons = {
    Admin: <ShieldCheck className="w-3.5 h-3.5 mr-1 text-purple-600" />,
    Teacher: <BookOpen className="w-3.5 h-3.5 mr-1 text-blue-600" />,
    Student: <GraduationCap className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white sticky top-0 z-40 px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3">
        <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-sm font-bold text-slate-900 tracking-tight">EduAssign</span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">|</span>
          <span className="text-xs text-slate-500 font-normal hidden sm:inline">Assignment & Submission Portal</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200">
          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
            {user.fullName.charAt(0)}
          </div>
          <div className="text-left flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-800">{user.fullName}</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${roleBadges[user.role]}`}>
              {roleIcons[user.role]}
              {user.role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
