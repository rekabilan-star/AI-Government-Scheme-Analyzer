import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi, schemeApi } from '../services/api.js';
import { ApplicationTracking, ApplicationTrackingStatus, GovernmentScheme } from '../types/index.js';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  FileCheck2,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Edit3,
  Calendar,
  Building2,
  Sparkles
} from 'lucide-react';

export const ApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationTracking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('All');

  // Modal to add application tracking
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [allSchemes, setAllSchemes] = useState<GovernmentScheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('');
  const [newTrackingNum, setNewTrackingNum] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadApplications();
    loadSchemes();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const res = await applicationApi.getApplications();
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSchemes = async () => {
    try {
      const res = await schemeApi.getSchemes({ limit: 50 });
      const list = res.data.schemes || [];
      setAllSchemes(list);
      if (list.length > 0) setSelectedSchemeId(list[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationTrackingStatus) => {
    try {
      await applicationApi.updateApplication(appId, { status: newStatus });
      setApplications(prev =>
        prev.map(a => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleToggleChecklistItem = async (app: ApplicationTracking, docName: string) => {
    const updatedChecklist = app.checklist.map(item =>
      item.docName === docName ? { ...item, completed: !item.completed } : item
    );

    try {
      await applicationApi.updateApplication(app.id, { checklist: updatedChecklist });
      setApplications(prev =>
        prev.map(a => (a.id === app.id ? { ...a, checklist: updatedChecklist } : a))
      );
    } catch (err) {
      console.error('Failed to toggle checklist item:', err);
    }
  };

  const handleDelete = async (appId: string) => {
    if (!window.confirm('Are you sure you want to delete this application tracking record?')) {
      return;
    }
    try {
      await applicationApi.deleteApplication(appId);
      setApplications(prev => prev.filter(a => a.id !== appId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchemeId) return;

    try {
      setIsSubmitting(true);
      const res = await applicationApi.createApplication({
        schemeId: selectedSchemeId,
        status: 'Preparing Documents',
        trackingNumber: newTrackingNum.trim() || undefined,
        notes: newNotes.trim() || undefined
      });
      setApplications(prev => [res.data.application, ...prev]);
      setIsAddOpen(false);
      setNewTrackingNum('');
      setNewNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = applications.filter(a => {
    if (activeTab === 'All') return true;
    return a.status === activeTab;
  });

  const statusColors: Record<ApplicationTrackingStatus, string> = {
    'Not Started': 'bg-slate-100 text-slate-700 border-slate-300',
    'Preparing Documents': 'bg-amber-50 text-amber-800 border-amber-300',
    'Ready to Apply': 'bg-blue-50 text-blue-800 border-blue-300',
    'Submitted': 'bg-indigo-50 text-indigo-800 border-indigo-300',
    'Completed': 'bg-emerald-50 text-emerald-800 border-emerald-300'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md mb-2">
              <ListTodo className="w-3.5 h-3.5" />
              <span>Application Lifecycle Records</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Scheme Applications
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Track document readiness, official acknowledgement IDs, and application milestones.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Track New Scheme</span>
          </button>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-slate-800">User-Maintained Tracking Record:</strong> Statuses below reflect your self-maintained application notes and document checklist. They are intended for personal planning and do not substitute official acknowledgement receipts on government departmental servers.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          {['All', 'Not Started', 'Preparing Documents', 'Ready to Apply', 'Submitted', 'Completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'All' ? `All Records (${applications.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <ListTodo className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No Applications in this Stage</h3>
          <p className="text-xs text-slate-500">
            Start tracking a scheme application to maintain your document checklist and status milestones.
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors"
          >
            Start Tracking Scheme
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(app => {
            const completedCount = app.checklist.filter(c => c.completed).length;
            const totalCount = app.checklist.length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                        {app.schemeCategory}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{app.ministry}</span>
                    </div>
                    <Link to={`/schemes/${app.schemeId}`}>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-700 transition-colors">
                        {app.schemeName}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    {/* Status Select dropdown */}
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationTrackingStatus)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColors[app.status]}`}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Preparing Documents">Preparing Documents</option>
                      <option value="Ready to Apply">Ready to Apply</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <button
                      onClick={() => handleDelete(app.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tracking Details & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 font-medium block">Acknowledgement / Ref ID:</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {app.trackingNumber || 'Pending Submission'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Application Date:</span>
                    <span className="font-semibold text-slate-800">
                      {app.applicationDate || 'Not specified'}
                    </span>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <span className="text-slate-400 font-medium block">Personal Notes:</span>
                    <span className="font-medium text-slate-700 italic truncate block">
                      {app.notes || 'No notes added'}
                    </span>
                  </div>
                </div>

                {/* Document Readiness Checklist Bar */}
                {totalCount > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4 text-blue-600" />
                        <span>Document Readiness Checklist ({completedCount}/{totalCount})</span>
                      </span>
                      <span className="font-semibold text-blue-700">{progress}% Ready</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {app.checklist.map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleToggleChecklistItem(app, item.docName)}
                          className={`text-xs px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 transition-colors ${
                            item.completed
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              item.completed ? 'text-emerald-600' : 'text-slate-300'
                            }`}
                          />
                          <span>{item.docName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Track New Scheme Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Start Tracking Scheme Application</h3>

            <form onSubmit={handleCreateTracking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Scheme</label>
                <select
                  value={selectedSchemeId}
                  onChange={(e) => setSelectedSchemeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                  required
                >
                  {allSchemes.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Application / Acknowledgement ID (Optional)
                </label>
                <input
                  type="text"
                  value={newTrackingNum}
                  onChange={(e) => setNewTrackingNum(e.target.value)}
                  placeholder="e.g. PMKISAN-UP-2026-XXXXX"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Personal Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Visited CSC Kendra, biometric e-KYC completed..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add to Tracker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
