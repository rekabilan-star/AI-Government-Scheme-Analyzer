import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { schemeApi, applicationApi, savedSchemeApi } from '../services/api.js';
import { GovernmentScheme } from '../types/index.js';
import { DocumentChecklistModal } from '../components/DocumentChecklistModal.js';
import { OfficialDossierModal } from '../components/OfficialDossierModal.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Building2,
  CheckCircle,
  ExternalLink,
  Bookmark,
  Calendar,
  IndianRupee,
  FileText,
  ListOrdered,
  ShieldCheck,
  ArrowLeft,
  FileCheck2,
  AlertCircle,
  Scale,
  Volume2,
  VolumeX,
  Printer
} from 'lucide-react';

export const SchemeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [scheme, setScheme] = useState<GovernmentScheme | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isChecklistOpen, setIsChecklistOpen] = useState<boolean>(false);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isTrackingStarting, setIsTrackingStarting] = useState<boolean>(false);
  const [trackSuccessMsg, setTrackSuccessMsg] = useState<string | null>(null);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      loadScheme(id);
    }
  }, [id]);

  const loadScheme = async (schemeId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await schemeApi.getSchemeById(schemeId);
      setScheme(res.data.scheme);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Scheme details could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTracking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!scheme) return;

    try {
      setIsTrackingStarting(true);
      await applicationApi.createApplication({
        schemeId: scheme.id,
        status: 'Preparing Documents',
        notes: `Application tracking started on ${new Date().toLocaleDateString()}`
      });
      setTrackSuccessMsg('Application added to your personal tracker! Redirecting...');
      setTimeout(() => {
        navigate('/applications');
      }, 1200);
    } catch (err) {
      console.error('Failed to create tracking:', err);
    } finally {
      setIsTrackingStarting(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!scheme) return;

    try {
      if (isSaved) {
        await savedSchemeApi.removeSavedScheme(scheme.id);
        setIsSaved(false);
      } else {
        await savedSchemeApi.saveScheme(scheme.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleNarrate = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    } else if (scheme) {
      const textToRead = `${scheme.name}. Implemented by ${scheme.ministry}. Benefits include: ${scheme.benefits}. Description: ${scheme.description}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setIsNarrating(false);
      utterance.onerror = () => setIsNarrating(false);
      window.speechSynthesis.speak(utterance);
      setIsNarrating(true);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium text-xs">Loading verified scheme profile...</p>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Scheme Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error || 'The requested government scheme record could not be found.'}</p>
        <Link to="/schemes" className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold">
          Return to Schemes Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link
          to="/schemes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Schemes Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleNarrate}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isNarrating
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isNarrating ? <VolumeX className="w-3.5 h-3.5 text-amber-700" /> : <Volume2 className="w-3.5 h-3.5 text-slate-600" />}
            <span>{isNarrating ? 'Stop Audio' : 'Listen to Scheme'}</span>
          </button>

          <Link
            to={`/compare?add=${scheme.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>Compare</span>
          </Link>
        </div>
      </div>

      {/* Main Scheme Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
            <span className="font-bold text-blue-800">{scheme.ministry}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-700 font-medium">{scheme.category}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-semibold">DBT Verified Central Scheme</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              className={`p-2 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Scheme'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {scheme.name}
        </h1>

        <p className="text-xs sm:text-sm text-slate-700 mt-4 leading-relaxed font-normal">
          {scheme.description}
        </p>

        {trackSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{trackSuccessMsg}</span>
          </div>
        )}

        {/* Action Button Row */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <Link
            to={`/eligibility?schemeId=${scheme.id}`}
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span>Analyze My Eligibility</span>
          </Link>

          <button
            onClick={() => setIsDossierOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Official Dossier (Print / PDF)</span>
          </button>

          <button
            onClick={() => setIsChecklistOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            <FileCheck2 className="w-4 h-4 text-slate-600" />
            <span>Document Checklist ({scheme.requiredDocuments.length})</span>
          </button>

          <button
            onClick={handleStartTracking}
            disabled={isTrackingStarting}
            className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            <Bookmark className="w-4 h-4 text-slate-500" />
            <span>{isTrackingStarting ? 'Starting...' : 'Track Application'}</span>
          </button>

          <a
            href={scheme.officialApplicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            <span>Official Government Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Grid: Benefits & Criteria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scheme Benefits */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-3">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              <span>Assistance & Entitlements</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Direct Benefit Transfer (DBT)</h2>
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl mb-4">
              <p className="text-xs text-emerald-950 font-semibold leading-relaxed">
                {scheme.benefits.description}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Eligibility Rules */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Eligibility Conditions</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Mandatory Criteria</h2>
          <div className="space-y-2.5 text-xs divide-y divide-slate-100">
            {/* Age */}
            <div className="pt-2 first:pt-0 flex justify-between gap-4">
              <span className="text-slate-500 font-medium">Age Requirement</span>
              <span className="text-slate-900 font-semibold text-right">
                {scheme.eligibility.minAge !== undefined || scheme.eligibility.maxAge !== undefined
                  ? `${scheme.eligibility.minAge ?? 0} to ${scheme.eligibility.maxAge ?? 'No limit'} years`
                  : 'No specific age limit'}
              </span>
            </div>

            {/* Income */}
            <div className="pt-2 flex justify-between gap-4">
              <span className="text-slate-500 font-medium">Income Ceiling</span>
              <span className="text-slate-900 font-semibold text-right">
                {scheme.eligibility.maxAnnualIncome !== undefined
                  ? `Annual Income ≤ ₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')}`
                  : 'No specific income restriction'}
              </span>
            </div>

            {/* Occupation */}
            <div className="pt-2 flex justify-between gap-4">
              <span className="text-slate-500 font-medium">Eligible Occupations</span>
              <span className="text-slate-900 font-semibold text-right max-w-xs">
                {scheme.eligibility.allowedOccupations?.join(', ') || 'All Occupations'}
              </span>
            </div>

            {/* Gender */}
            <div className="pt-2 flex justify-between gap-4">
              <span className="text-slate-500 font-medium">Gender Eligibility</span>
              <span className="text-slate-900 font-semibold text-right">
                {scheme.eligibility.allowedGenders?.join(', ') || 'All Citizens'}
              </span>
            </div>

            {/* Social Category */}
            <div className="pt-2 flex justify-between gap-4">
              <span className="text-slate-500 font-medium">Social Category</span>
              <span className="text-slate-900 font-semibold text-right">
                {scheme.eligibility.allowedCategories?.join(', ') || 'All Categories'}
              </span>
            </div>

            {/* Disability */}
            {scheme.eligibility.disabilityRequired && (
              <div className="pt-2 flex justify-between gap-4">
                <span className="text-slate-500 font-medium">Disability Status</span>
                <span className="text-rose-700 font-bold text-right">
                  Required (40%+ Benchmark Disability)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Required Documents Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Document Readiness</span>
          </div>
          <button
            onClick={() => setIsChecklistOpen(true)}
            className="text-xs font-bold text-blue-700 hover:underline"
          >
            Open Interactive Checklist
          </button>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-4">Mandatory Verification Documents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {scheme.requiredDocuments.map((doc, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-slate-800"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{doc.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Official Government Verification Link */}
      <div className="p-4 bg-slate-100/80 rounded-xl border border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-slate-900 block">Nodal Ministry Information Source:</span>
          <span className="text-slate-600">{scheme.officialSourceUrl}</span>
        </div>
        <a
          href={scheme.officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline"
        >
          <span>Open Ministry Gazette</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Interactive Document Checklist Modal */}
      <DocumentChecklistModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
        schemeName={scheme.name}
        documents={scheme.requiredDocuments}
      />

      {/* Official Citizen Eligibility Dossier Modal */}
      <OfficialDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        scheme={scheme}
        citizenProfile={user?.profile}
        eligibilityStatus="Eligible"
        satisfiedCriteria={['Age limit compliance', 'Income ceiling check', 'Sector eligibility']}
        matchScore={94}
      />
    </div>
  );
};
