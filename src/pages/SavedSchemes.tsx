import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { savedSchemeApi } from '../services/api.js';
import { SavedScheme } from '../types/index.js';
import { SchemeCard } from '../components/SchemeCard.js';
import { Bookmark, ArrowRight, CheckCircle2 } from 'lucide-react';

export const SavedSchemes: React.FC = () => {
  const [saved, setSaved] = useState<SavedScheme[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    try {
      setIsLoading(true);
      const res = await savedSchemeApi.getSavedSchemes();
      setSaved(res.data.savedSchemes || []);
    } catch (err) {
      console.error('Failed to load saved schemes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToggle = (schemeId: string, isSaved: boolean) => {
    if (!isSaved) {
      setSaved(prev => prev.filter(s => s.schemeId !== schemeId));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-md mb-2">
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span>Saved Citizen Library</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bookmarked Government Schemes
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            Review schemes you've saved for future applications or family member requirements.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No Saved Schemes Yet</h3>
          <p className="text-xs text-slate-500">
            Browse through the Schemes Directory and click the bookmark icon to save relevant schemes.
          </p>
          <Link
            to="/schemes"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors"
          >
            <span>Explore Schemes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saved.map(item => (
            <SchemeCard
              key={item.id}
              scheme={item.scheme}
              isSavedInitial={true}
              onSaveToggle={(isSaved) => handleSaveToggle(item.schemeId, isSaved)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
