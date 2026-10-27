import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { schemeApi } from '../services/api.js';
import { GovernmentScheme } from '../types/index.js';
import {
  Scale,
  Building2,
  CheckCircle2,
  IndianRupee,
  ShieldCheck,
  FileText,
  ExternalLink,
  ArrowRight,
  Plus,
  X
} from 'lucide-react';

export const SchemeCompare: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allSchemes, setAllSchemes] = useState<GovernmentScheme[]>([]);
  const [selectedSchemeIds, setSelectedSchemeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      setIsLoading(true);
      const res = await schemeApi.getSchemes({ limit: 50 });
      const list = res.data.schemes || [];
      setAllSchemes(list);

      // Check URL params for initial schemes
      const idsParam = searchParams.get('ids');
      if (idsParam) {
        const ids = idsParam.split(',').filter(id => list.some(s => s.id === id));
        setSelectedSchemeIds(ids.slice(0, 3));
      } else if (list.length >= 2) {
        // Default to comparing first two popular schemes (e.g. PM-KISAN & Ayushman Bharat)
        setSelectedSchemeIds([list[0].id, list[1].id]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectScheme = (schemeId: string, index: number) => {
    const next = [...selectedSchemeIds];
    next[index] = schemeId;
    setSelectedSchemeIds(next);
    setSearchParams({ ids: next.join(',') });
  };

  const handleAddSlot = () => {
    if (selectedSchemeIds.length >= 3) return;
    const available = allSchemes.find(s => !selectedSchemeIds.includes(s.id));
    if (available) {
      const next = [...selectedSchemeIds, available.id];
      setSelectedSchemeIds(next);
      setSearchParams({ ids: next.join(',') });
    }
  };

  const handleRemoveSlot = (index: number) => {
    if (selectedSchemeIds.length <= 1) return;
    const next = selectedSchemeIds.filter((_, i) => i !== index);
    setSelectedSchemeIds(next);
    setSearchParams({ ids: next.join(',') });
  };

  const comparedSchemes = selectedSchemeIds
    .map(id => allSchemes.find(s => s.id === id))
    .filter((s): s is GovernmentScheme => s !== undefined);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>Multi-Scheme Analytical Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Compare Welfare Schemes Side-by-Side
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              Evaluate eligibility criteria, financial assistance levels, required documentation, and target demographics across public welfare programs simultaneously.
            </p>
          </div>

          {selectedSchemeIds.length < 3 && (
            <button
              onClick={handleAddSlot}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Scheme (Max 3)</span>
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
      ) : comparedSchemes.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">Select schemes to start comparison</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header Scheme Selectors Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-200 bg-slate-50/70 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center">
              Comparison Parameters
            </div>
            {comparedSchemes.map((scheme, idx) => (
              <div key={scheme.id} className="p-5 space-y-3 relative">
                {comparedSchemes.length > 1 && (
                  <button
                    onClick={() => handleRemoveSlot(idx)}
                    className="absolute top-3 right-3 p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                    title="Remove scheme from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  Scheme #{idx + 1}
                </span>
                <select
                  value={scheme.id}
                  onChange={(e) => handleSelectScheme(e.target.value, idx)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                >
                  {allSchemes.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.shortName || s.name}
                    </option>
                  ))}
                </select>

                <h3 className="font-bold text-sm text-slate-900 leading-tight">
                  {scheme.name}
                </h3>
                <span className="text-[11px] font-semibold text-slate-500 block truncate">
                  {scheme.ministry}
                </span>

                <div className="pt-1 flex items-center gap-2">
                  <Link
                    to={`/eligibility?schemeId=${scheme.id}`}
                    className="w-full py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-center rounded-lg text-xs font-bold shadow-2xs transition-colors block"
                  >
                    Check My Eligibility
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Matrix Row: Category */}
          <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-100 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
            <div className="p-4 font-bold text-slate-700 bg-slate-50/50 flex items-center">
              Welfare Sector
            </div>
            {comparedSchemes.map(scheme => (
              <div key={scheme.id} className="p-4 font-semibold text-slate-800">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  {scheme.category}
                </span>
              </div>
            ))}
          </div>

          {/* Matrix Row: Financial Benefit */}
          <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-100 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
            <div className="p-4 font-bold text-slate-700 bg-slate-50/50 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              <span>Financial Entitlement</span>
            </div>
            {comparedSchemes.map(scheme => (
              <div key={scheme.id} className="p-4 space-y-1">
                <p className="font-black text-base text-emerald-700">
                  {scheme.benefits.financialAmount
                    ? `₹${scheme.benefits.financialAmount.toLocaleString('en-IN')}`
                    : 'Non-Financial Grant'}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {scheme.benefits.frequency || 'Direct Benefit Transfer'}
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed pt-1">
                  {scheme.benefits.description}
                </p>
              </div>
            ))}
          </div>

          {/* Matrix Row: Age Criteria */}
          <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-100 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
            <div className="p-4 font-bold text-slate-700 bg-slate-50/50 flex items-center">
              Age Limit Requirement
            </div>
            {comparedSchemes.map(scheme => (
              <div key={scheme.id} className="p-4 font-semibold text-slate-800">
                {scheme.eligibility.minAge !== undefined || scheme.eligibility.maxAge !== undefined
                  ? `${scheme.eligibility.minAge ?? 0} to ${scheme.eligibility.maxAge ?? 'No limit'} years`
                  : 'No specific age restrictions'}
              </div>
            ))}
          </div>

          {/* Matrix Row: Income Ceiling */}
          <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-100 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
            <div className="p-4 font-bold text-slate-700 bg-slate-50/50 flex items-center">
              Annual Family Income Ceiling
            </div>
            {comparedSchemes.map(scheme => (
              <div key={scheme.id} className="p-4 font-semibold text-slate-800">
                {scheme.eligibility.maxAnnualIncome !== undefined
                  ? `Up to ₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')}/year`
                  : 'No income ceiling specified'}
              </div>
            ))}
          </div>

          {/* Matrix Row: Target Occupations */}
          <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-100 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
            <div className="p-4 font-bold text-slate-700 bg-slate-50/50 flex items-center">
              Target Occupations
            </div>
            {comparedSchemes.map(scheme => (
              <div key={scheme.id} className="p-4 font-medium text-slate-700 leading-relaxed">
                {scheme.eligibility.allowedOccupations?.join(', ') || 'Open to all occupations'}
              </div>
            ))}
          </div>

          {/* Matrix Row: Social Category & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-100 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
            <div className="p-4 font-bold text-slate-700 bg-slate-50/50 flex items-center">
              Gender & Category Coverage
            </div>
            {comparedSchemes.map(scheme => (
              <div key={scheme.id} className="p-4 text-slate-700 space-y-1">
                <p>
                  <span className="font-semibold text-slate-900">Gender: </span>
                  {scheme.eligibility.allowedGenders?.join(', ') || 'All'}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Category: </span>
                  {scheme.eligibility.allowedCategories?.join(', ') || 'All (General/OBC/SC/ST/EWS)'}
                </p>
              </div>
            ))}
          </div>

          {/* Matrix Row: Mandatory Documents */}
          <div className="grid grid-cols-1 md:grid-cols-4 border-b border-slate-100 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
            <div className="p-4 font-bold text-slate-700 bg-slate-50/50 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Mandatory Documents</span>
            </div>
            {comparedSchemes.map(scheme => (
              <div key={scheme.id} className="p-4 space-y-1.5">
                {scheme.requiredDocuments.map((d, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{d.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Matrix Row: Direct Portal Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs bg-slate-50/30">
            <div className="p-4 font-bold text-slate-700 bg-slate-50/50 flex items-center">
              Official Portal Link
            </div>
            {comparedSchemes.map(scheme => (
              <div key={scheme.id} className="p-4">
                <a
                  href={scheme.officialApplicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-bold hover:underline"
                >
                  <span>Visit Application Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
