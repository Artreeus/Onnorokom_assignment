'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { GraduationCap, Clock, Send, Award, Edit3, XCircle } from 'lucide-react';

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active filter
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Submit/Edit Modal
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<any | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitContent, setSubmitContent] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [aRes, sRes, cRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/submissions/my-submissions'),
        api.get('/classes')
      ]);
      setAssignments(aRes.data);
      setSubmissions(sRes.data);
      setEnrolledClasses(cRes.data);
    } catch (err: any) {
      toast.error('Failed to load student dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionForAssignment = (assignmentId: number) => {
    return submissions.find(s => s.assignmentId === assignmentId);
  };

  const handleOpenSubmitModal = (assignment: any) => {
    setSelectedAssignment(assignment);
    const sub = getSubmissionForAssignment(assignment.id);
    setExistingSubmission(sub || null);
    setSubmitContent(sub ? sub.submissionContent : '');
    setAttachmentUrl(sub ? sub.attachmentUrl || '' : '');
    setShowSubmitModal(true);
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    try {
      if (existingSubmission) {
        // Update existing submission
        await api.put(`/submissions/${existingSubmission.id}`, {
          submissionContent: submitContent,
          attachmentUrl: attachmentUrl || null
        });
        toast.success('Submission updated successfully before deadline!');
      } else {
        // New submission
        await api.post('/submissions', {
          assignmentId: selectedAssignment.id,
          submissionContent: submitContent,
          attachmentUrl: attachmentUrl || null
        });
        toast.success('Answer submitted successfully!');
      }

      setShowSubmitModal(false);
      fetchStudentData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit answer.');
    }
  };

  const filteredAssignments = assignments.filter(a => {
    const sub = getSubmissionForAssignment(a.id);
    if (filterStatus === 'PENDING') return !sub;
    if (filterStatus === 'SUBMITTED') return sub && sub.status === 'Submitted';
    if (filterStatus === 'GRADED') return sub && sub.status === 'Graded';
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
                <GraduationCap className="w-5 h-5 text-slate-700 mr-2" />
                Student Coursework & Submissions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review assigned coursework, submit answers before deadlines, and check teacher marks.
              </p>
            </div>
            <div className="mt-3 md:mt-0 flex flex-wrap gap-2">
              {enrolledClasses.map(c => (
                <span key={c.id} className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                  Class: {c.name}
                </span>
              ))}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex space-x-2 mb-5">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                filterStatus === 'ALL' ? 'bg-slate-900 text-white border-slate-900 font-semibold' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              All Coursework ({assignments.length})
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                filterStatus === 'PENDING' ? 'bg-slate-900 text-white border-slate-900 font-semibold' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Pending Action
            </button>
            <button
              onClick={() => setFilterStatus('SUBMITTED')}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                filterStatus === 'SUBMITTED' ? 'bg-slate-900 text-white border-slate-900 font-semibold' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Submitted
            </button>
            <button
              onClick={() => setFilterStatus('GRADED')}
              className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                filterStatus === 'GRADED' ? 'bg-slate-900 text-white border-slate-900 font-semibold' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Graded & Evaluated
            </button>
          </div>

          {/* Assignments Feed */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence>
              {filteredAssignments.map((a) => {
                const sub = getSubmissionForAssignment(a.id);
                const isOverdue = a.isOverdue;

                return (
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
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-mono text-slate-700 border border-slate-200">{a.subjectName}</span>
                          <span className="text-xs text-slate-500">{a.className}</span>
                        </div>

                        {/* Status Badges */}
                        {sub ? (
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            sub.status === 'Graded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {sub.status === 'Graded' ? `Graded (${sub.score}/${a.maxMarks})` : 'Submitted'}
                          </span>
                        ) : isOverdue ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 flex items-center">
                            <XCircle className="w-3 h-3 mr-1" /> Closed (Overdue)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-1.5">{a.title}</h3>
                      <p className="text-xs text-slate-600 mb-4 leading-relaxed">{a.description}</p>

                      <div className="flex items-center justify-between text-xs text-slate-600 p-3 bg-slate-50 rounded-md border border-slate-200 mb-4">
                        <div>Teacher: <strong className="text-slate-900 font-semibold">{a.teacherName}</strong></div>
                        <div className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                            Due: {new Date(a.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Submission Details / Action */}
                    <div className="pt-3 border-t border-slate-100">
                      {sub && sub.status === 'Graded' && (
                        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 mb-3 text-xs">
                          <div className="font-bold text-emerald-800 flex items-center mb-0.5">
                            <Award className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                            Score: {sub.score} / {a.maxMarks} ({Math.round((sub.score / a.maxMarks) * 100)}%)
                          </div>
                          {sub.feedback && (
                            <div className="text-slate-700 mt-1 italic">
                              "{sub.feedback}"
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end">
                        {isOverdue && !sub ? (
                          <button disabled className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed border border-slate-200">
                            Submissions Closed
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenSubmitModal(a)}
                            className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center space-x-1 transition-colors shadow-xs ${
                              sub
                                ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {sub ? <Edit3 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                            <span>{sub ? 'Update Answer' : 'Submit Solution'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Modal: Submit Answer */}
          <AnimatePresence>
            {showSubmitModal && selectedAssignment && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-6 rounded-xl w-full max-w-lg border border-slate-200 shadow-xl">
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {existingSubmission ? 'Update Answer' : 'Submit Assignment Response'}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">{selectedAssignment.title} ({selectedAssignment.subjectName})</p>

                  <form onSubmit={handleSubmitAnswer} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Your Answer Content
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Type your detailed solution here..."
                        value={submitContent}
                        onChange={(e) => setSubmitContent(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Attachment Link (Optional PDF, GitHub, Drive Link)
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/file.pdf"
                        value={attachmentUrl}
                        onChange={(e) => setAttachmentUrl(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setShowSubmitModal(false)} className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
                      <button type="submit" className="px-3 py-1.5 rounded-md bg-slate-900 text-white font-semibold text-xs">
                        {existingSubmission ? 'Save Changes' : 'Confirm Submission'}
                      </button>
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
