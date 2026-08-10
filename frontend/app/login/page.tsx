'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ShieldCheck, BookOpen, GraduationCap, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Successfully authenticated!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'Admin' | 'Teacher' | 'Student') => {
    setDemoLoading(role);
    try {
      await demoLogin(role);
      toast.success(`Logged in as ${role} demo user!`);
    } catch (err: any) {
      toast.error('Failed to log in with demo account. Ensure backend API is running.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-grid-pattern text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-3 shadow-sm">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            EduAssign Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Role-based submission & assignment evaluation platform
          </p>
        </motion.div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="bg-white py-8 px-6 shadow-sm rounded-xl border border-slate-200 sm:px-8"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.com"
                  className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-md font-semibold text-xs text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </motion.button>
          </form>

          {/* Quick Demo Login Section */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center space-x-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-slate-700" />
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                1-Click Evaluator Demo Access
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => handleDemo('Admin')}
                disabled={!!demoLoading}
                className="p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="flex items-center text-purple-700 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs font-bold">Admin</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {demoLoading === 'Admin' ? 'Loading...' : 'System Control'}
                </div>
              </motion.button>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => handleDemo('Teacher')}
                disabled={!!demoLoading}
                className="p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="flex items-center text-blue-700 mb-0.5">
                  <BookOpen className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs font-bold">Teacher</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {demoLoading === 'Teacher' ? 'Loading...' : 'Create & Grade'}
                </div>
              </motion.button>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => handleDemo('Student')}
                disabled={!!demoLoading}
                className="p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="flex items-center text-emerald-700 mb-0.5">
                  <GraduationCap className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs font-bold">Student</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {demoLoading === 'Student' ? 'Loading...' : 'Submit Answers'}
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
