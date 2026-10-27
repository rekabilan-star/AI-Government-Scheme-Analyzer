import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendationApi, savedSchemeApi } from '../services/api.js';
import { SchemeRecommendation } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { EligibilityBadge } from '../components/EligibilityBadge.js';
import {
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Bookmark,
  ArrowRight,
  User,
  AlertCircle,
  IndianRupee
} from 'lucide-react';

export const Recommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<SchemeRecommendation[]>([]);
  const [aiOverview, setAiOverview] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'All' | 'Eligible' | 'Potentially Eligible'>('All');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const res = await recommendationApi.getRecommendations();
      setRecommendations(res.data.recommendations || []);
      setAiOverview(res.data.aiOverview || '');

      if (user) {
        try {
          const savedRes = await savedSchemeApi.getSavedSchemes();
          const ids = new Set((savedRes.data.savedSchemes || []).map(s => s.schemeId));
          setSavedIds(ids);
        } catch (e) {
          // Ignore
        }
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async (schemeId: string) => {
    if (!user) {
      alert('Please log in to save schemes to your profile.');
      return;
    }

    try {
      if (savedIds.has(schemeId)) {
        await savedSchemeApi.removeSavedScheme(schemeId);
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(schemeId);
          return next;
        });
      } else {
        await savedSchemeApi.saveScheme(schemeId);
        setSavedIds(prev => new Set(prev).add(schemeId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = recommendations.filter(r => {
    if (filterTab === 'All') return true;
    return r.eligibilityStatus === filterTab;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-md mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Personalized AI Recommendation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Curated Welfare Recommendations
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Transparent match scores calculated from your verified citizen profile, demographic eligibility rules, and targeted social benefits.
            </p>
          </div>

          {user ? (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start gap-3 shrink-0">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{user.name}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {user.profile.occupation || 'Occupation unset'} • {user.profile.state || 'Pan-India'} • {user.profile.socialCategory || 'General'}
                </p>
                <Link to="/profile" className="text-blue-600 font-semibold text-[11px] hover:underline mt-1 block">
                  Edit Profile →
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center gap-3 shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-900">Browsing as Guest</p>
                <p className="text-amber-700 text-[11px]">Log in to unlock 100% personalized recommendations</p>
                <Link to="/login" className="text-amber-900 font-bold underline text-[11px] mt-0.5 block">
                  Sign in now
                </Link>
              </div>
            </div>
          )}
        </div>

        {aiOverview && (
          <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-blue-50/80 via-indigo-50/70 to-slate-50 rounded-xl border border-blue-100 flex items-start gap-3.5">
            <div className="p-2 bg-blue-700 text-white rounded-lg shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-blue-900 block mb-1">
                Gemini AI Executive Summary
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {aiOverview}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          {(['All', 'Eligible', 'Potentially Eligible'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterTab === tab
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'All' ? `All Matches (${recommendations.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No schemes found under this filter</h3>
          <p className="text-xs text-slate-500">Try selecting "All Matches" to see all ranked opportunities.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(rec => {
            const isSaved = savedIds.has(rec.scheme.id);
            return (
              <div
                key={rec.scheme.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {rec.scheme.category}
                    </span>
                    <EligibilityBadge status={rec.eligibilityStatus} size="sm" />
                    <span className="text-xs font-semibold text-slate-500">
                      • {rec.scheme.ministry}
                    </span>
                  </div>

                  <Link to={`/schemes/${rec.scheme.id}`} className="block group">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {rec.scheme.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {rec.scheme.description}
                  </p>

                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-800 block mb-1">
                      Why Recommended for You:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.reasons.map((reason, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{reason}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {rec.keyHighlights.length > 0 && (
                    <div className="pt-1 flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{rec.keyHighlights[0]}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black shadow-xs">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{rec.matchScore}% Match Score</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Rule Affinity Rating</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSave(rec.scheme.id)}
                      className={`p-2 rounded-lg border transition-colors ${
                        isSaved
                          ? 'bg-amber-50 border-amber-300 text-amber-600'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                      title={isSaved ? 'Remove from Saved' : 'Save Scheme'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
                    </button>

                    <Link
                      to={`/eligibility?schemeId=${rec.scheme.id}`}
                      className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>Check Rules</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
