'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { BookOpen, Plus, Clock, Trash2, Award, ExternalLink, Eye } from 'lucide-react';

export default function TeacherDashboard() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classCourseId: '',
    subjectId: '',
    deadline: '',
    maxMarks: 100,
    status: 'Published'
  });

  const [gradeData, setGradeData] = useState({
    score: 0,
    feedback: '',
    status: 'Graded'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [aRes, cRes, sRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/classes'),
        api.get('/subjects')
      ]);
      setAssignments(aRes.data);
      setClasses(cRes.data);
      setSubjects(sRes.data);
    } catch (err: any) {
      toast.error('Failed to load teacher data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assignments', {
        title: formData.title,
        description: formData.description,
        classCourseId: parseInt(formData.classCourseId),
        subjectId: parseInt(formData.subjectId),
        deadline: new Date(formData.deadline).toISOString(),
        maxMarks: parseInt(formData.maxMarks.toString()),
        status: formData.status
      });
      toast.success('Assignment created successfully!');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', classCourseId: '', subjectId: '', deadline: '', maxMarks: 100, status: 'Published' });
      fetchInitialData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create assignment.');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    try {
      await api.patch(`/assignments/${id}/status?status=${newStatus}`);
      toast.success(`Assignment status updated to ${newStatus}`);
      fetchInitialData();
    } catch (err: any) {
      toast.error('Failed to update assignment status.');
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      toast.success('Assignment deleted successfully.');
      fetchInitialData();
    } catch (err: any) {
      toast.error('Failed to delete assignment.');
    }
  };

  const handleOpenSubmissions = async (assignment: any) => {
    setSelectedAssignment(assignment);
    try {
      const res = await api.get(`/submissions/assignment/${assignment.id}`);
      setSubmissions(res.data);
      setShowSubmissionsModal(true);
    } catch (err: any) {
      toast.error('Failed to load student submissions.');
    }
  };

  const handleOpenGradeModal = (sub: any) => {
    setGradingSubmission(sub);
    setGradeData({
      score: sub.score !== null ? sub.score : selectedAssignment?.maxMarks || 100,
      feedback: sub.feedback || '',
      status: sub.status === 'Graded' ? 'Graded' : 'Graded'
    });
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    try {
      await api.post(`/submissions/${gradingSubmission.id}/grade`, {
        score: parseFloat(gradeData.score.toString()),
        feedback: gradeData.feedback,
        status: gradeData.status
      });
      toast.success('Submission graded successfully!');
      setGradingSubmission(null);
      // Refresh submissions list
      const res = await api.get(`/submissions/assignment/${selectedAssignment.id}`);
      setSubmissions(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to grade submission.');
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (filterStatus === 'PUBLISHED') return a.status === 'Published';
    if (filterStatus === 'DRAFT') return a.status === 'Draft';
    return true;
  });

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
                <BookOpen className="w-5 h-5 text-slate-700 mr-2" />
                Teacher Assignment Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Create coursework, manage publish states, evaluate student submissions, and assign scores.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 md:mt-0 px-3.5 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create Assignment</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Assignments</div>
              <div className="text-xl font-bold text-slate-900">{assignments.length}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.05 }} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Published Active</div>
              <div className="text-xl font-bold text-emerald-700">
                {assignments.filter(a => a.status === 'Published').length}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Draft Mode</div>
              <div className="text-xl font-bold text-amber-700">
                {assignments.filter(a => a.status === 'Draft').length}
              </div>
            </motion.div>
          </div>

          {/* Filter Pills */}
          <div className="flex space-x-2 mb-5">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                filterStatus === 'ALL' ? 'bg-slate-900 text-white border-slate-900 font-semibold' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              All ({assignments.length})
            </button>
            <button
              onClick={() => setFilterStatus('PUBLISHED')}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                filterStatus === 'PUBLISHED' ? 'bg-slate-900 text-white border-slate-900 font-semibold' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Published ({assignments.filter(a => a.status === 'Published').length})
            </button>
            <button
              onClick={() => setFilterStatus('DRAFT')}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                filterStatus === 'DRAFT' ? 'bg-slate-900 text-white border-slate-900 font-semibold' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Drafts ({assignments.filter(a => a.status === 'Draft').length})
            </button>
          </div>

          {/* Assignments Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence>
              {filteredAssignments.map((a) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  key={a.id}
                  className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        a.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {a.status}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleToggleStatus(a.id, a.status)}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 bg-slate-100 rounded border border-slate-200"
                          title="Toggle Publish/Draft"
                        >
                          {a.status === 'Published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(a.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1.5">{a.title}</h3>
                    <p className="text-xs text-slate-600 mb-4 line-clamp-3 leading-relaxed">{a.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 p-3 bg-slate-50 rounded-md border border-slate-200">
                      <div>Class: <strong className="text-slate-900 font-semibold">{a.className}</strong></div>
                      <div>Subject: <strong className="text-slate-900 font-semibold">{a.subjectName}</strong></div>
                      <div>Max Marks: <strong className="text-slate-900 font-semibold">{a.maxMarks}</strong></div>
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        <span className={a.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                          {new Date(a.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      Submissions: <strong className="text-slate-900 font-semibold">{a.submissionCount}</strong>
                    </div>

                    <button
                      onClick={() => handleOpenSubmissions(a)}
                      className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Submissions ({a.submissionCount})</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Modal: Create Assignment */}
          <AnimatePresence>
            {showCreateModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-6 rounded-xl w-full max-w-lg border border-slate-200 shadow-xl">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Create Assignment</h3>
                  <form onSubmit={handleCreateAssignment} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Newton's Laws Application"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Description & Requirements</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Provide clear assignment instructions..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Class/Course</label>
                        <select
                          required
                          value={formData.classCourseId}
                          onChange={(e) => setFormData({ ...formData, classCourseId: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                        >
                          <option value="">-- Select Class --</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Subject</label>
                        <select
                          required
                          value={formData.subjectId}
                          onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                        >
                          <option value="">-- Select Subject --</option>
                          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Deadline Date & Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Maximum Marks</label>
                        <input
                          type="number"
                          min={1}
                          max={1000}
                          required
                          value={formData.maxMarks}
                          onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 100 })}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      >
                        <option value="Published">Publish Immediately</option>
                        <option value="Draft">Save as Draft</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setShowCreateModal(false)} className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
                      <button type="submit" className="px-3 py-1.5 rounded-md bg-slate-900 text-white font-semibold text-xs">Create Assignment</button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal: Submissions List */}
          <AnimatePresence>
            {showSubmissionsModal && selectedAssignment && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto border border-slate-200 shadow-xl">
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{selectedAssignment.title}</h3>
                      <p className="text-xs text-slate-500">Class: {selectedAssignment.className} | Max Marks: {selectedAssignment.maxMarks}</p>
                    </div>
                    <button onClick={() => setShowSubmissionsModal(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-900">Close</button>
                  </div>

                  {submissions.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No student submissions received for this assignment yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((s) => (
                        <div key={s.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-slate-900 text-xs">{s.studentName}</span>
                              <span className="text-slate-400 text-xs">({s.studentEmail})</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                s.status === 'Graded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {s.status}
                              </span>
                            </div>

                            <div className="p-2.5 bg-white border border-slate-200 rounded text-xs text-slate-700 my-2 whitespace-pre-wrap">
                              {s.submissionContent}
                            </div>

                            {s.attachmentUrl && (
                              <a
                                href={s.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center text-xs text-blue-600 hover:underline mb-1"
                              >
                                <ExternalLink className="w-3 h-3 mr-1 text-blue-600" />
                                View Attachment
                              </a>
                            )}

                            {s.score !== null && (
                              <div className="text-xs text-emerald-700 font-medium mt-1">
                                Score: {s.score} / {selectedAssignment.maxMarks}
                                {s.feedback && <span className="text-slate-600 font-normal block mt-0.5">Feedback: "{s.feedback}"</span>}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleOpenGradeModal(s)}
                            className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center space-x-1 shrink-0"
                          >
                            <Award className="w-3.5 h-3.5 text-white" />
                            <span>{s.status === 'Graded' ? 'Edit Grade' : 'Grade Submission'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal: Grading Form */}
          <AnimatePresence>
            {gradingSubmission && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-6 rounded-xl w-full max-w-md border border-slate-200 shadow-xl">
                  <h3 className="text-base font-bold text-slate-900 mb-1">Grade Submission</h3>
                  <p className="text-xs text-slate-500 mb-4">Student: {gradingSubmission.studentName}</p>

                  <form onSubmit={handleGradeSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Score (Max {selectedAssignment?.maxMarks})
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={selectedAssignment?.maxMarks || 100}
                        step={0.5}
                        required
                        value={gradeData.score}
                        onChange={(e) => setGradeData({ ...gradeData, score: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Teacher Feedback</label>
                      <textarea
                        rows={3}
                        placeholder="Provide detailed feedback notes..."
                        value={gradeData.feedback}
                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">Submission Status</label>
                      <select
                        value={gradeData.status}
                        onChange={(e) => setGradeData({ ...gradeData, status: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900"
                      >
                        <option value="Graded">Graded (Passed)</option>
                        <option value="NeedsRevision">Needs Revision</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setGradingSubmission(null)} className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
                      <button type="submit" className="px-3 py-1.5 rounded-md bg-slate-900 text-white font-semibold text-xs">Save Grade</button>
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
