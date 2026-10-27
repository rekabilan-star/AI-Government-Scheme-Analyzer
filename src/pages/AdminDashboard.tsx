import React, { useState, useEffect } from 'react';
import { adminApi, schemeApi, feedbackApi } from '../services/api.js';
import { GovernmentScheme, Feedback } from '../types/index.js';
import {
  ShieldCheck,
  Users,
  Building,
  ListTodo,
  Star,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  IndianRupee,
  CheckCircle,
  XCircle,
  ExternalLink,
  MessageSquare,
  BarChart3,
  RefreshCw,
  Search
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Scheme Modal state
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState<boolean>(false);
  const [editingScheme, setEditingScheme] = useState<GovernmentScheme | null>(null);

  // Form states for scheme creation / edit
  const [schemeName, setSchemeName] = useState<string>('');
  const [schemeShortName, setSchemeShortName] = useState<string>('');
  const [schemeCode, setSchemeCode] = useState<string>('');
  const [schemeMinistry, setSchemeMinistry] = useState<string>('');
  const [schemeCategory, setSchemeCategory] = useState<string>('Agriculture & Rural');
  const [schemeDescription, setSchemeDescription] = useState<string>('');
  const [benefitAmount, setBenefitAmount] = useState<string>('50000');
  const [benefitFrequency, setBenefitFrequency] = useState<string>('Annual Grant');
  const [benefitDesc, setBenefitDesc] = useState<string>('');
  const [minAge, setMinAge] = useState<string>('18');
  const [maxAge, setMaxAge] = useState<string>('65');
  const [maxIncome, setMaxIncome] = useState<string>('300000');
  const [officialUrl, setOfficialUrl] = useState<string>('https://india.gov.in');
  const [appUrl, setAppUrl] = useState<string>('https://india.gov.in');
  const [schemeDocs, setSchemeDocs] = useState<string>('Aadhaar Card, Bank Passbook, Income Certificate');
  const [schemeProcedure, setSchemeProcedure] = useState<string>('Visit official portal, complete online e-KYC, submit verification');

  // Response to feedback state
  const [respondingFbId, setRespondingFbId] = useState<string | null>(null);
  const [adminResponseText, setAdminResponseText] = useState<string>('');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    try {
      setIsLoading(true);
      const [analyticsRes, schemesRes, feedbackRes] = await Promise.all([
        adminApi.getAnalytics(),
        schemeApi.getSchemes({ limit: 100, includeInactive: true }),
        feedbackApi.getAllFeedback()
      ]);
      setAnalytics(analyticsRes.data);
      setSchemes(schemesRes.data.schemes || []);
      setFeedbacks(feedbackRes.data.feedbacks || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateScheme = () => {
    setEditingScheme(null);
    setSchemeName('');
    setSchemeShortName('');
    setSchemeCode(`GOV-${Date.now().toString().slice(-4)}`);
    setSchemeMinistry('');
    setSchemeCategory('Agriculture & Rural');
    setSchemeDescription('');
    setBenefitAmount('25000');
    setBenefitFrequency('Annual Transfer');
    setBenefitDesc('Direct DBT credit into beneficiary bank account');
    setMinAge('18');
    setMaxAge('70');
    setMaxIncome('250000');
    setOfficialUrl('https://india.gov.in');
    setAppUrl('https://india.gov.in');
    setSchemeDocs('Aadhaar Card, Income Certificate, Bank Account');
    setSchemeProcedure('Register online, upload documents, verify with local officer');
    setIsSchemeModalOpen(true);
  };

  const handleOpenEditScheme = (scheme: GovernmentScheme) => {
    setEditingScheme(scheme);
    setSchemeName(scheme.name);
    setSchemeShortName(scheme.shortName);
    setSchemeCode(scheme.code);
    setSchemeMinistry(scheme.ministry);
    setSchemeCategory(scheme.category);
    setSchemeDescription(scheme.description);
    setBenefitAmount(String(scheme.benefits.financialAmount || 0));
    setBenefitFrequency(scheme.benefits.frequency || '');
    setBenefitDesc(scheme.benefits.description);
    setMinAge(scheme.eligibility.minAge !== undefined ? String(scheme.eligibility.minAge) : '');
    setMaxAge(scheme.eligibility.maxAge !== undefined ? String(scheme.eligibility.maxAge) : '');
    setMaxIncome(scheme.eligibility.maxAnnualIncome !== undefined ? String(scheme.eligibility.maxAnnualIncome) : '');
    setOfficialUrl(scheme.officialSourceUrl);
    setAppUrl(scheme.officialApplicationUrl);
    setSchemeDocs(scheme.requiredDocuments.map(d => d.name).join(', '));
    setSchemeProcedure(scheme.applicationProcedure.join('; '));
    setIsSchemeModalOpen(true);
  };

  const handleSaveScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docsArray = schemeDocs.split(',').map(d => ({
        name: d.trim(),
        description: 'Mandatory verification document',
        mandatory: true
      })).filter(d => d.name.length > 0);

      const procedureArray = schemeProcedure.split(';').map(p => p.trim()).filter(p => p.length > 0);

      const payload: Partial<GovernmentScheme> = {
        name: schemeName.trim(),
        shortName: schemeShortName.trim() || schemeName.trim(),
        code: schemeCode.trim(),
        ministry: schemeMinistry.trim(),
        category: schemeCategory as any,
        description: schemeDescription.trim(),
        benefits: {
          description: benefitDesc.trim(),
          financialAmount: benefitAmount ? Number(benefitAmount) : 0,
          frequency: benefitFrequency.trim(),
          nonFinancial: ['Official government support']
        },
        eligibility: {
          minAge: minAge ? Number(minAge) : undefined,
          maxAge: maxAge ? Number(maxAge) : undefined,
          maxAnnualIncome: maxIncome ? Number(maxIncome) : undefined,
          allowedStates: ['All India']
        },
        requiredDocuments: docsArray,
        applicationProcedure: procedureArray,
        officialSourceUrl: officialUrl.trim(),
        officialApplicationUrl: appUrl.trim() || officialUrl.trim(),
        isActive: true
      };

      if (editingScheme) {
        await schemeApi.updateScheme(editingScheme.id, payload);
      } else {
        await schemeApi.createScheme(payload);
      }

      setIsSchemeModalOpen(false);
      loadAllAdminData();
    } catch (err) {
      console.error('Failed to save scheme:', err);
    }
  };

  const handleToggleDeactivate = async (scheme: GovernmentScheme) => {
    if (!window.confirm(`Are you sure you want to toggle status for "${scheme.name}"?`)) return;
    try {
      if (scheme.isActive) {
        await schemeApi.deleteScheme(scheme.id);
      } else {
        await schemeApi.updateScheme(scheme.id, { isActive: true });
      }
      loadAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendFeedbackResponse = async (fbId: string) => {
    if (!adminResponseText.trim()) return;
    try {
      await feedbackApi.respondToFeedback(fbId, adminResponseText.trim());
      setRespondingFbId(null);
      setAdminResponseText('');
      loadAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#ea580c'];

  if (isLoading && !analytics) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium text-xs">Computing live administrative analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 text-blue-200 text-xs font-bold rounded-md mb-2 border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Central Administrative Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Scheme Administration & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Live statistics computed from MongoDB database records • Active Database Engine: {analytics?.summary?.databaseType}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={loadAllAdminData}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <button
              onClick={handleOpenCreateScheme}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Scheme</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{analytics?.summary?.totalUsers || 0}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {analytics?.summary?.citizenCount} Citizens • {analytics?.summary?.adminCount} Admins
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Schemes</span>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{analytics?.summary?.activeSchemes || 0}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Total {analytics?.summary?.totalSchemes} In System
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tracked Apps</span>
            <ListTodo className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{analytics?.summary?.totalApplications || 0}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Citizen Workflows Active
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Benefit Pool</span>
            <IndianRupee className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-slate-900 truncate">
            ₹{((analytics?.summary?.totalBenefitPool || 0) / 100000).toFixed(1)}L
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Cumulative Assistance Cap
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Citizen Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">{analytics?.summary?.avgRating || '5.0'} / 5</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {analytics?.summary?.totalFeedbacks || 0} Ratings Recorded
          </span>
        </div>
      </div>

      {/* Visual Analytics Graphs (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graph 1: Application Stages Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Application Tracking Funnel</h3>
              <p className="text-xs text-slate-500">Citizen progression across application stages</p>
            </div>
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.applicationStatusChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Schemes by Category */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Welfare Portfolio by Sector</h3>
              <p className="text-xs text-slate-500">Number of schemes deployed per category</p>
            </div>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.categoryChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(analytics?.categoryChart || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scheme Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Government Schemes Inventory</h3>
            <p className="text-xs text-slate-500">Create, modify eligibility rules, update documents, and toggle active status</p>
          </div>
          <button
            onClick={handleOpenCreateScheme}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Scheme</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Scheme Name & Ministry</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Financial Benefit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schemes.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <span className="text-[11px] text-slate-500">{s.code} • {s.ministry}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{s.category}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">
                    {s.benefits.financialAmount ? `₹${s.benefits.financialAmount.toLocaleString('en-IN')}` : 'In-Kind'}
                  </td>
                  <td className="py-3 px-4">
                    {s.isActive ? (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditScheme(s)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Scheme"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleDeactivate(s)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md transition-colors"
                      title={s.isActive ? 'Deactivate' : 'Reactivate'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Citizen Feedback Review Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Citizen Ratings & Public Feedback</h3>
          <p className="text-xs text-slate-500">Review feedback submissions and submit administrative clarifications</p>
        </div>

        <div className="space-y-3">
          {feedbacks.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No citizen feedback recorded yet.</p>
          ) : (
            feedbacks.map(fb => (
              <div key={fb.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{fb.userName}</span>
                    <span className="text-[11px] text-slate-500">({fb.userEmail})</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[10px]">
                      {fb.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${star <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-slate-700 font-medium">{fb.comment}</p>

                {fb.adminResponse ? (
                  <div className="mt-2 p-2.5 bg-white rounded-lg border border-blue-100 text-[11px] text-blue-900">
                    <span className="font-bold text-blue-700 block mb-0.5">Administrative Response:</span>
                    <p>{fb.adminResponse}</p>
                  </div>
                ) : (
                  <div className="pt-1">
                    {respondingFbId === fb.id ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          value={adminResponseText}
                          onChange={(e) => setAdminResponseText(e.target.value)}
                          placeholder="Type administrative clarification..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                        <button
                          onClick={() => handleSendFeedbackResponse(fb.id)}
                          className="px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-semibold shrink-0"
                        >
                          Send
                        </button>
                        <button
                          onClick={() => setRespondingFbId(null)}
                          className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setRespondingFbId(fb.id);
                          setAdminResponseText('');
                        }}
                        className="text-xs text-blue-700 font-semibold hover:underline"
                      >
                        Respond to Citizen →
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Scheme Modal (Add / Edit) */}
      {isSchemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingScheme ? 'Edit Government Scheme' : 'Add New Government Scheme'}
            </h3>

            <form onSubmit={handleSaveScheme} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheme Name</label>
                  <input
                    type="text"
                    value={schemeName}
                    onChange={(e) => setSchemeName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Short Name / Acronym</label>
                  <input
                    type="text"
                    value={schemeShortName}
                    onChange={(e) => setSchemeShortName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ministry / Department</label>
                  <input
                    type="text"
                    value={schemeMinistry}
                    onChange={(e) => setSchemeMinistry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={schemeCategory}
                    onChange={(e) => setSchemeCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Agriculture & Rural">Agriculture & Rural</option>
                    <option value="Healthcare & Sanitation">Healthcare & Sanitation</option>
                    <option value="Education & Learning">Education & Learning</option>
                    <option value="Housing & Shelter">Housing & Shelter</option>
                    <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
                    <option value="Social Security & Pension">Social Security & Pension</option>
                    <option value="Women & Child Development">Women & Child Development</option>
                    <option value="Skill & Employment">Skill & Employment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={schemeDescription}
                  onChange={(e) => setSchemeDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Financial Benefit Amount (₹)</label>
                  <input
                    type="number"
                    value={benefitAmount}
                    onChange={(e) => setBenefitAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Benefit Frequency / Type</label>
                  <input
                    type="text"
                    value={benefitFrequency}
                    onChange={(e) => setBenefitFrequency(e.target.value)}
                    placeholder="e.g. Annual, One-Time Grant, Loan Subsidy"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Benefit Details</label>
                <input
                  type="text"
                  value={benefitDesc}
                  onChange={(e) => setBenefitDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Age</label>
                  <input
                    type="number"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Age</label>
                  <input
                    type="number"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Annual Income</label>
                  <input
                    type="number"
                    value={maxIncome}
                    onChange={(e) => setMaxIncome(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Portal URL</label>
                  <input
                    type="url"
                    value={officialUrl}
                    onChange={(e) => setOfficialUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Application URL</label>
                  <input
                    type="url"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Documents (comma separated)</label>
                <input
                  type="text"
                  value={schemeDocs}
                  onChange={(e) => setSchemeDocs(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application Procedure (semicolon separated)</label>
                <input
                  type="text"
                  value={schemeProcedure}
                  onChange={(e) => setSchemeProcedure(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSchemeModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold"
                >
                  {editingScheme ? 'Save Changes' : 'Publish Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
