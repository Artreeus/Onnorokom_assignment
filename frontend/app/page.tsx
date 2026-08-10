'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'Admin') {
        router.push('/admin');
      } else if (user.role === 'Teacher') {
        router.push('/teacher');
      } else if (user.role === 'Student') {
        router.push('/student');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-gray-400 text-sm font-semibold">
      Loading Assignment Management System...
    </div>
  );
}
