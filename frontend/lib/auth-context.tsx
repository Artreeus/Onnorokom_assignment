'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'Admin' | 'Teacher' | 'Student';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: 'Admin' | 'Teacher' | 'Student') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    redirectBasedOnRole(newUser.role);
  };

  const demoLogin = async (role: 'Admin' | 'Teacher' | 'Student') => {
    const credentials = {
      Admin: { email: 'admin@school.com', password: 'Admin@123' },
      Teacher: { email: 'teacher@school.com', password: 'Teacher@123' },
      Student: { email: 'student@school.com', password: 'Student@123' }
    };
    const cred = credentials[role];
    await login(cred.email, cred.password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const redirectBasedOnRole = (role: string) => {
    if (role === 'Admin') router.push('/admin');
    else if (role === 'Teacher') router.push('/teacher');
    else if (role === 'Student') router.push('/student');
    else router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
