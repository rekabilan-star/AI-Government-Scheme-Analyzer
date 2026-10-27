import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { schemeApi, eligibilityApi } from '../services/api.js';
import { GovernmentScheme, UserProfile, EligibilityEvaluation } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { EligibilityBadge } from '../components/EligibilityBadge.js';
import { DocumentChecklistModal } from '../components/DocumentChecklistModal.js';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Sliders,
  FileCheck2,
  Building2,
  Info,
  Volume2,
  VolumeX,
  Printer,
  Download,
  X,
  Award
} from 'lucide-react';

export const EligibilityAnalyzer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(searchParams.get('schemeId') || '');
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

  // Form parameters (initialized with profile if present or URL params)
  const [age, setAge] = useState<string>(searchParams.get('age') || String(user?.profile?.age || '32'));
  const [gender, setGender] = useState<string>(user?.profile?.gender || 'Male');
  const [state, setState] = useState<string>(user?.profile?.state || 'Uttar Pradesh');
  const [occupation, setOccupation] = useState<string>(searchParams.get('occupation') || user?.profile?.occupation || 'Farmer');
  const [income, setIncome] = useState<string>(searchParams.get('income') || String(user?.profile?.annualFamilyIncome || '180000'));
  const [education, setEducation] = useState<string>(user?.profile?.education || '10th Pass');
  const [category, setCategory] = useState<string>(searchParams.get('category') || user?.profile?.socialCategory || 'OBC');
  const [disability, setDisability] = useState<boolean>(user?.profile?.disabilityStatus || false);

  const [evaluation, setEvaluation] = useState<EligibilityEvaluation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const toggleSpeech = (textToRead: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = textToRead.replace(/[*#_•]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      const res = await schemeApi.getSchemes({ limit: 50 });
      const list = res.data.schemes || [];
      setSchemes(list);

      const targetId = searchParams.get('schemeId') || (list.length > 0 ? list[0].id : '');
      setSelectedSchemeId(targetId);
      const found = list.find(s => s.id === targetId) || (list.length > 0 ? list[0] : null);
      setSelectedScheme(found);

      if (found) {
        runAnalysis(found.id);
      }
    } catch (err) {
      console.error('Failed to load schemes for analyzer:', err);
    }
  };

  const handleSchemeChange = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    const found = schemes.find(s => s.id === schemeId) || null;
    setSelectedScheme(found);
    setSearchParams({ schemeId });
    if (found) {
      runAnalysis(found.id);
    }
  };

  const runAnalysis = async (schemeIdToTest?: string) => {
    const targetSchemeId = schemeIdToTest || selectedSchemeId;
    if (!targetSchemeId) return;

    try {
      setIsAnalyzing(true);
      const profileOverride: Partial<UserProfile> = {
        age: age ? Number(age) : undefined,
        gender: gender as any,
        state: state.trim(),
        occupation: occupation.trim(),
        annualFamilyIncome: income ? Number(income) : undefined,
        education: education.trim(),
        socialCategory: category as any,
        disabilityStatus: disability
      };

      const res = await eligibilityApi.analyze({
        schemeId: targetSchemeId,
        profileOverride,
        requestAiExplanation: true
      });

      setEvaluation(res.data.evaluation);
      setSelectedScheme(res.data.scheme);
    } catch (err) {
      console.error('Eligibility evaluation error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetToUserProfile = () => {
    if (user?.profile) {
      setAge(String(user.profile.age || '30'));
      setGender(user.profile.gender || 'Male');
      setState(user.profile.state || 'Delhi');
      setOccupation(user.profile.occupation || 'Farmer');
      setIncome(String(user.profile.annualFamilyIncome || '180000'));
      setEducation(user.profile.education || '10th Pass');
      setCategory(user.profile.socialCategory || 'General');
      setDisability(user.profile.disabilityStatus || false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-md mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Deterministic Rule-Based Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Eligibility Analyzer & Test Workbench
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            Compare demographic and socioeconomic criteria directly against official government policy rules. Review satisfied conditions, identify unmet clauses, and read AI explanations.
          </p>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Evaluation Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Scheme Selection and Test Attributes (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Test Parameters</span>
            </h2>
            {user && (
              <button
                type="button"
                onClick={handleResetToUserProfile}
                className="text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to My Profile</span>
              </button>
            )}
          </div>

          {/* Scheme Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Target Scheme</label>
            <select
              value={selectedSchemeId}
              onChange={(e) => handleSchemeChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {schemes.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {/* Parameters Form */}
          <div className="space-y-3.5 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State Domicile</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Social Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Occupation</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
              >
                <option value="Farmer">Farmer</option>
                <option value="Agriculture Laborer">Agriculture Laborer</option>
                <option value="Student">Student</option>
                <option value="Street Vendor">Street Vendor</option>
                <option value="Self-Employed (Small Business)">Self-Employed / Trader</option>
                <option value="Daily Wage Worker">Daily Wage / Construction</option>
                <option value="Unemployed">Unemployed / Job Seeker</option>
                <option value="Artisan">Artisan / Handicraft</option>
                <option value="Private Employee">Private Employee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Family Income (₹)</label>
              <input
                type="number"
                step="5000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Education Level</label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
              >
                <option value="Below 10th">Below 10th</option>
                <option value="10th Pass">10th Pass</option>
                <option value="12th Pass">12th Pass</option>
                <option value="Diploma">Diploma / ITI</option>
                <option value="Undergraduate">Undergraduate (Degree)</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="disabilityCheck"
                checked={disability}
                onChange={(e) => setDisability(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="disabilityCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                Possess certified disability (Divyangjan - 40%+)
              </label>
            </div>

            <button
              type="button"
              onClick={() => runAnalysis()}
              disabled={isAnalyzing}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Deterministic Rules...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Execute Eligibility Check</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Evaluation Results & AI Analysis (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {evaluation && selectedScheme ? (
            <>
              {/* Overall Assessment Scoreboard */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Evaluation Outcome
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                      {selectedScheme.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{selectedScheme.ministry}</p>
                  </div>

                  <div className="self-start sm:self-auto flex flex-col items-end">
                    <EligibilityBadge status={evaluation.status} size="lg" />
                    <span className="text-[11px] font-semibold text-slate-500 mt-1">
                      Match Confidence: {evaluation.overallScore}%
                    </span>
                  </div>
                </div>

                {/* Summary Statement */}
                <p className="text-xs text-slate-700 mt-4 leading-relaxed font-medium">
                  {evaluation.summary}
                </p>

                {/* Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsChecklistOpen(true)}
                    className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>View Required Documents ({selectedScheme.requiredDocuments.length})</span>
                  </button>

                  <button
                    onClick={() => setIsPrintModalOpen(true)}
                    className="px-3.5 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-emerald-200"
                  >
                    <Printer className="w-4 h-4 text-emerald-700" />
                    <span>Print Assessment Dossier</span>
                  </button>

                  <a
                    href={selectedScheme.officialApplicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>

                  <Link
                    to={`/schemes/${selectedScheme.id}`}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 ml-auto"
                  >
                    Scheme Full Details →
                  </Link>
                </div>
              </div>

              {/* Gemini AI Grounded Analysis Card */}
              {evaluation.aiExplanation && (
                <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/50 rounded-2xl border border-indigo-100 p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Gemini AI Policy Explainer</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSpeech(evaluation.aiExplanation || '')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                        isSpeaking
                          ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                          : 'bg-white/80 text-indigo-700 border-indigo-200 hover:bg-white'
                      }`}
                      title={isSpeaking ? 'Stop voice readout' : 'Listen to assessment'}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span>{isSpeaking ? 'Stop Audio' : 'Listen Readout'}</span>
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">
                    Plain-Language Citizen Assessment
                  </h4>
                  <div className="text-xs text-slate-700 space-y-2 leading-relaxed whitespace-pre-line font-normal">
                    {evaluation.aiExplanation}
                  </div>
                </div>
              )}

              {/* Detailed Breakdown of Criteria */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <h4 className="text-sm font-bold text-slate-900">
                  Detailed Criteria Evaluation Breakdown
                </h4>

                {/* 1. Satisfied Criteria */}
                {evaluation.satisfiedCriteria.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Satisfied Criteria ({evaluation.satisfiedCriteria.length})</span>
                    </span>
                    <div className="space-y-2">
                      {evaluation.satisfiedCriteria.map((c, i) => (
                        <div key={i} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">{c.criterion}</span>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Satisfied
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">{c.details}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Required: <span className="font-medium text-slate-700">{c.expected}</span> • Provided: <span className="font-medium text-slate-700">{c.actual}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Unmet Criteria */}
                {evaluation.unmetCriteria.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-2.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Unmet Criteria ({evaluation.unmetCriteria.length})</span>
                    </span>
                    <div className="space-y-2">
                      {evaluation.unmetCriteria.map((c, i) => (
                        <div key={i} className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">{c.criterion}</span>
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                              Not Satisfied
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">{c.details}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Mandatory: <span className="font-medium text-slate-700">{c.expected}</span> • Your Data: <span className="font-medium text-slate-700">{c.actual}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Missing Information */}
                {evaluation.missingCriteria.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2.5">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>Missing / Unverified Details ({evaluation.missingCriteria.length})</span>
                    </span>
                    <div className="space-y-2">
                      {evaluation.missingCriteria.map((c, i) => (
                        <div key={i} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">{c.criterion}</span>
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                              Missing Info
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">{c.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer Notice */}
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {evaluation.disclaimer}
                </p>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">Select a scheme and execute the analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* Document Checklist Modal */}
      {selectedScheme && (
        <DocumentChecklistModal
          isOpen={isChecklistOpen}
          onClose={() => setIsChecklistOpen(false)}
          schemeName={selectedScheme.name}
          documents={selectedScheme.requiredDocuments}
        />
      )}

      {/* Printable Assessment Dossier Modal */}
      {isPrintModalOpen && selectedScheme && evaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-300 print:border-none print:shadow-none print:max-w-none print:p-0">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Citizen Assessment Dossier
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document / Save as PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Sheet */}
            <div className="py-6 space-y-6">
              {/* Official Seal and Header */}
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  Government Welfare Scheme Analyzer and Recommendation System
                </p>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Citizen Eligibility Verification Assessment
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  {selectedScheme.ministry} • Central Portal Advisory Record
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-200 mt-3">
                  <span>Ref No: EVAL-{selectedScheme.code}-{Date.now().toString().slice(-6)}</span>
                  <span>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Target Scheme & Outcome */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Scheme Evaluated</span>
                  <p className="font-extrabold text-sm text-slate-900 mt-0.5">{selectedScheme.name}</p>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">
                    Entitlement: {selectedScheme.benefits.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <EligibilityBadge status={evaluation.status} size="lg" />
                  <p className="text-[10px] font-bold text-slate-500 mt-1">Rule Affinity: {evaluation.overallScore}%</p>
                </div>
              </div>

              {/* Citizen Test Demographics */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Citizen Socioeconomic Profile Evaluated:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Age:</span>
                    <span className="font-semibold text-slate-800">{age} Years</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gender:</span>
                    <span className="font-semibold text-slate-800">{gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">State:</span>
                    <span className="font-semibold text-slate-800">{state}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Occupation:</span>
                    <span className="font-semibold text-slate-800">{occupation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Annual Income:</span>
                    <span className="font-semibold text-slate-800">₹{Number(income).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Category:</span>
                    <span className="font-semibold text-slate-800">{category}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Education:</span>
                    <span className="font-semibold text-slate-800">{education}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Divyangjan:</span>
                    <span className="font-semibold text-slate-800">{disability ? 'Yes (40%+)' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Satisfied Criteria Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Satisfied Policy Criteria ({evaluation.satisfiedCriteria.length}):
                </h4>
                <div className="space-y-1 text-xs">
                  {evaluation.satisfiedCriteria.map((c, i) => (
                    <div key={i} className="p-2 bg-emerald-50/50 rounded border border-emerald-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{c.criterion}</span>
                      <span className="text-slate-600 text-[11px]">{c.actual} (Rule: {c.expected})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Mandatory Verification Documents Checklist:
                </h4>
                <div className="space-y-1 text-xs">
                  {selectedScheme.requiredDocuments.map((d, i) => (
                    <div key={i} className="p-2 border border-slate-200 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border border-slate-400 rounded-xs" />
                        <span className="font-semibold text-slate-900">{d.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{d.issuingAuthority || 'Government Authority'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Disclaimer */}
              <div className="pt-4 border-t-2 border-slate-900 text-[10px] text-slate-500 leading-relaxed space-y-1">
                <p className="font-bold text-slate-700 uppercase">Official Governance Scrutiny Notice:</p>
                <p>
                  This document serves as an informational assessment generated deterministically based on citizen self-declared data. Sanctioning of funds or issuance of official welfare cards is governed exclusively by the physical scrutiny of original documents at designated Central/State Government sanctioning offices.
                </p>
                <div className="pt-3 flex justify-between items-end text-slate-400 font-mono text-[9px]">
                  <span>Portal: {window.location.origin}</span>
                  <span className="border-t border-slate-400 pt-1 px-4 text-center">Citizen Signature / Verification Stamp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
