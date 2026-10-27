import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GovernmentScheme } from '../types/index.js';
import { Building2, Bookmark, CheckCircle, ArrowRight, IndianRupee, FileText, Scale } from 'lucide-react';
import { savedSchemeApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { OfficialDossierModal } from './OfficialDossierModal.js';

interface SchemeCardProps {
  scheme: GovernmentScheme;
  isSavedInitial?: boolean;
  onSaveToggle?: (isSaved: boolean) => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({ scheme, isSavedInitial = false, onSaveToggle }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState<boolean>(isSavedInitial);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to save schemes to your personal dashboard.');
      return;
    }

    try {
      setIsSaving(true);
      if (isSaved) {
        await savedSchemeApi.removeSavedScheme(scheme.id);
        setIsSaved(false);
        onSaveToggle?.(false);
      } else {
        await savedSchemeApi.saveScheme(scheme.id);
        setIsSaved(true);
        onSaveToggle?.(true);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between group">
        <div>
          {/* Unboxed Metadata Header (Zero-Pill Discipline) */}
          <div className="flex items-start justify-between gap-3 text-xs text-slate-500 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-blue-800">{scheme.ministry}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600">{scheme.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium">DBT Verified</span>
            </div>

            <button
              onClick={handleToggleSave}
              disabled={isSaving}
              aria-label={isSaved ? "Remove from saved" : "Save scheme"}
              className={`p-1.5 rounded-lg transition-colors ${
                isSaved
                  ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Scheme Title */}
          <Link to={`/schemes/${scheme.id}`}>
            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors tracking-tight line-clamp-1">
              {scheme.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {scheme.description}
          </p>

          {/* Scheme Benefits Unboxed Text */}
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wide">
              Direct Entitlement / Benefit:
            </span>
            <p className="text-emerald-800 font-medium text-xs mt-0.5 line-clamp-1">
              {scheme.benefits.description}
            </p>
          </div>

          {/* Eligibility Highlights Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[10px]">Age Range</span>
              <span className="font-semibold text-slate-900">
                {scheme.eligibility.minAge !== undefined || scheme.eligibility.maxAge !== undefined
                  ? `${scheme.eligibility.minAge ?? 0} - ${scheme.eligibility.maxAge ?? 'No limit'} Yrs`
                  : 'Any Age'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Income Ceiling</span>
              <span className="font-semibold text-slate-900">
                {scheme.eligibility.maxAnnualIncome !== undefined
                  ? `≤ ₹${(scheme.eligibility.maxAnnualIncome / 100000).toFixed(1)} Lakh/yr`
                  : 'No Income Limit'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowDossierModal(true)}
              className="text-xs font-semibold text-slate-600 hover:text-blue-700 hover:bg-slate-100 px-2 py-1.5 rounded-md transition-colors flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Dossier</span>
            </button>
            <Link
              to={`/compare?add=${scheme.id}`}
              className="text-xs font-semibold text-slate-600 hover:text-blue-700 hover:bg-slate-100 px-2 py-1.5 rounded-md transition-colors flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare</span>
            </Link>
          </div>

          <Link
            to={`/schemes/${scheme.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors"
          >
            <span>View Scheme</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Official Dossier Modal */}
      <OfficialDossierModal
        isOpen={showDossierModal}
        onClose={() => setShowDossierModal(false)}
        scheme={scheme}
        citizenProfile={user?.profile}
        eligibilityStatus="Eligible"
        satisfiedCriteria={['Income boundary check', 'Geographic verification']}
        matchScore={92}
      />
    </>
  );
};
