'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Users, BookOpen, Layers, UserPlus, Plus, Trash2, ShieldCheck, UserCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<any[]>([]);
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'classes' | 'subjects' | 'assignments' | 'all-assignments' | 'all-submissions'>('users');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [showAssignTeacher, setShowAssignTeacher] = useState(false);
  const [showAssignStudent, setShowAssignStudent] = useState(false);

  // Form inputs
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'Student' });
  const [newClass, setNewClass] = useState({ name: '', code: '', description: '' });
  const [newSubject, setNewSubject] = useState({ name: '', code: '' });
  const [assignTeacher, setAssignTeacher] = useState({ classCourseId: '', subjectId: '', teacherId: '' });
  const [assignStudent, setAssignStudent] = useState({ classCourseId: '', studentId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, cRes, sRes, mRes, aRes, subRes] = await Promise.all([
        api.get('/users'),
        api.get('/classes/all'),
        api.get('/subjects'),
        api.get('/classes/assignments-matrix'),
        api.get('/assignments'),
        api.get('/submissions')
      ]);
      setUsers(uRes.data);
      setClasses(cRes.data);
      setSubjects(sRes.data);
      setMatrix(mRes.data);
      setAllAssignments(aRes.data);
      setAllSubmissions(subRes.data);
    } catch (err: any) {
      toast.error('Failed to fetch admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', newUser);
      toast.success('User account created successfully!');
      setShowCreateUser(false);
      setNewUser({ fullName: '', email: '', password: '', role: 'Student' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create user.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully.');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete user.');
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/classes', newClass);
      toast.success('Academic class created successfully!');
      setShowCreateClass(false);
      setNewClass({ name: '', code: '', description: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create class.');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/subjects', newSubject);
      toast.success('Subject created successfully!');
      setShowCreateSubject(false);
      setNewSubject({ name: '', code: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create subject.');
    }
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/classes/assign-teacher', {
        classCourseId: parseInt(assignTeacher.classCourseId),
        subjectId: parseInt(assignTeacher.subjectId),
        teacherId: parseInt(assignTeacher.teacherId)
      });
      toast.success('Teacher assigned to subject successfully!');
      setShowAssignTeacher(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign teacher.');
    }
  };

  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/classes/assign-student', {
        classCourseId: parseInt(assignStudent.classCourseId),
        studentId: parseInt(assignStudent.studentId)
      });
      toast.success('Student enrolled into class successfully!');
      setShowAssignStudent(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign student.');
    }
  };

  const teachersList = users.filter(u => u.role === 'Teacher');
  const studentsList = users.filter(u => u.role === 'Student');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
                <ShieldCheck className="w-5 h-5 text-slate-700 mr-2" />
                Administrative Control Panel
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage system users, academic classes, subject definitions, and teacher assignments.
              </p>
            </div>
            <div className="mt-3 md:mt-0 flex flex-wrap gap-2">
              <button
                onClick={() => setShowCreateUser(true)}
                className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-1 shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
              <button
                onClick={() => setShowCreateClass(true)}
                className="px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Class</span>
              </button>
              <button
                onClick={() => setShowCreateSubject(true)}
                className="px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            </div>
          </div>

          {/* Metric Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Users</div>
              <div className="text-xl font-bold text-slate-900 flex items-center justify-between">
                <span>{users.length}</span>
                <Users className="w-5 h-5 text-slate-400" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.05 }} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Academic Classes</div>
              <div className="text-xl font-bold text-slate-900 flex items-center justify-between">
                <span>{classes.length}</span>
                <BookOpen className="w-5 h-5 text-slate-400" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Subjects Defined</div>
              <div className="text-xl font-bold text-slate-900 flex items-center justify-between">
                <span>{subjects.length}</span>
                <Layers className="w-5 h-5 text-slate-400" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.15 }} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Teacher Assignments</div>
              <div className="text-xl font-bold text-slate-900 flex items-center justify-between">
                <span>{matrix.length}</span>
                <UserCheck className="w-5 h-5 text-slate-400" />
              </div>
            </motion.div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 mb-5 space-x-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'users' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'classes' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Classes ({classes.length})
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'subjects' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Subjects ({subjects.length})
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'assignments' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Teacher Assignments ({matrix.length})
            </button>
            <button
              onClick={() => setActiveTab('all-assignments')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'all-assignments' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              All Assignments ({allAssignments.length})
            </button>
            <button
              onClick={() => setActiveTab('all-submissions')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                activeTab === 'all-submissions' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              All Submissions ({allSubmissions.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-400">#{u.id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{u.fullName}</td>
                        <td className="px-4 py-3 text-slate-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            u.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            u.role === 'Teacher' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === 'classes' && (
              <motion.div key="classes" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAssignStudent(true)}
                    className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-semibold flex items-center space-x-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Enroll Student</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classes.map((c) => (
                    <div key={c.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-700 border border-slate-200">{c.code}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">{c.description || 'No description provided.'}</p>
                      <div className="flex space-x-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                        <span>Students: <strong className="text-slate-900 font-semibold">{c.enrolledStudentCount}</strong></span>
                        <span>Subjects: <strong className="text-slate-900 font-semibold">{c.subjectCount}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'subjects' && (
              <motion.div key="subjects" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {subjects.map((s) => (
                  <div key={s.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-xs">{s.name}</h3>
                      <span className="font-mono text-[11px] text-slate-400">{s.code}</span>
                    </div>
                    <Layers className="w-4 h-4 text-slate-300" />
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'assignments' && (
              <motion.div key="assignments" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAssignTeacher(true)}
                    className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Teacher</span>
                  </button>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Class</th>
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3">Assigned Teacher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {matrix.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-900">{m.className}</td>
                          <td className="px-4 py-3 text-slate-600 font-mono">{m.subjectName}</td>
                          <td className="px-4 py-3 text-slate-800 font-medium">{m.teacherName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'all-assignments' && (
              <motion.div key="all-assignments" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Teacher</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allAssignments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-semibold text-slate-900">{a.title}</td>
                        <td className="px-4 py-3 text-slate-600">{a.className}</td>
                        <td className="px-4 py-3 text-slate-600 font-mono">{a.subjectName}</td>
                        <td className="px-4 py-3 text-slate-800">{a.teacherName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            a.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{new Date(a.deadline).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === 'all-submissions' && (
              <motion.div key="all-submissions" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Assignment</th>
                      <th className="px-4 py-3">Submitted At</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allSubmissions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-semibold text-slate-900">{s.studentName} <span className="text-slate-400 font-normal">({s.studentEmail})</span></td>
                        <td className="px-4 py-3 text-slate-600">{s.assignmentTitle}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(s.submittedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            s.status === 'Graded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {s.score !== null ? `${s.score} / ${s.maxMarks}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal: Create User */}
          <AnimatePresence>
            {showCreateUser && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-6 rounded-xl w-full max-w-md border border-slate-200 shadow-xl">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Create User Account</h3>
                  <form onSubmit={handleCreateUser} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newUser.fullName}
                        onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Role</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      >
                        <option value="Student">Student</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setShowCreateUser(false)} className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
                      <button type="submit" className="px-3 py-1.5 rounded-md bg-slate-900 text-white font-semibold text-xs">Create User</button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal: Create Class */}
          <AnimatePresence>
            {showCreateClass && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-6 rounded-xl w-full max-w-md border border-slate-200 shadow-xl">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Create New Class</h3>
                  <form onSubmit={handleCreateClass} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Class Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Class 10 - Science"
                        value={newClass.name}
                        onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Class Code</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CLS10-SCI"
                        value={newClass.code}
                        onChange={(e) => setNewClass({ ...newClass, code: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                      <textarea
                        value={newClass.description}
                        onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setShowCreateClass(false)} className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
                      <button type="submit" className="px-3 py-1.5 rounded-md bg-slate-900 text-white font-semibold text-xs">Create Class</button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal: Create Subject */}
          <AnimatePresence>
            {showCreateSubject && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-6 rounded-xl w-full max-w-md border border-slate-200 shadow-xl">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Create New Subject</h3>
                  <form onSubmit={handleCreateSubject} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Subject Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Physics"
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Subject Code</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. PHY101"
                        value={newSubject.code}
                        onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setShowCreateSubject(false)} className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
                      <button type="submit" className="px-3 py-1.5 rounded-md bg-slate-900 text-white font-semibold text-xs">Create Subject</button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal: Assign Teacher */}
          <AnimatePresence>
            {showAssignTeacher && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-6 rounded-xl w-full max-w-md border border-slate-200 shadow-xl">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Assign Teacher to Class Subject</h3>
                  <form onSubmit={handleAssignTeacher} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Select Class</label>
                      <select
                        required
                        value={assignTeacher.classCourseId}
                        onChange={(e) => setAssignTeacher({ ...assignTeacher, classCourseId: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      >
                        <option value="">-- Choose Class --</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Select Subject</label>
                      <select
                        required
                        value={assignTeacher.subjectId}
                        onChange={(e) => setAssignTeacher({ ...assignTeacher, subjectId: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      >
                        <option value="">-- Choose Subject --</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Select Teacher</label>
                      <select
                        required
                        value={assignTeacher.teacherId}
                        onChange={(e) => setAssignTeacher({ ...assignTeacher, teacherId: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      >
                        <option value="">-- Choose Teacher --</option>
                        {teachersList.map(t => <option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>)}
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setShowAssignTeacher(false)} className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
                      <button type="submit" className="px-3 py-1.5 rounded-md bg-slate-900 text-white font-semibold text-xs">Assign Teacher</button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal: Assign Student */}
          <AnimatePresence>
            {showAssignStudent && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-6 rounded-xl w-full max-w-md border border-slate-200 shadow-xl">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Enroll Student into Class</h3>
                  <form onSubmit={handleAssignStudent} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Select Class</label>
                      <select
                        required
                        value={assignStudent.classCourseId}
                        onChange={(e) => setAssignStudent({ ...assignStudent, classCourseId: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      >
                        <option value="">-- Choose Class --</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Select Student</label>
                      <select
                        required
                        value={assignStudent.studentId}
                        onChange={(e) => setAssignStudent({ ...assignStudent, studentId: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      >
                        <option value="">-- Choose Student --</option>
                        {studentsList.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>)}
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setShowAssignStudent(false)} className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
                      <button type="submit" className="px-3 py-1.5 rounded-md bg-slate-900 text-white font-semibold text-xs">Enroll Student</button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
