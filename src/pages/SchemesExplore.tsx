import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { schemeApi } from '../services/api.js';
import { GovernmentScheme } from '../types/index.js';
import { SchemeCard } from '../components/SchemeCard.js';
import { Search, Filter, SlidersHorizontal, RotateCcw, Building2, Layers } from 'lucide-react';

export const SchemesExplore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [ministries, setMinistries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const ministry = searchParams.get('ministry') || 'All';
  const sort = searchParams.get('sort') || 'recent';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1
  });

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadSchemes();
  }, [searchParams]);

  const loadMeta = async () => {
    try {
      const res = await schemeApi.getMeta();
      setCategories(res.data.categories || []);
      setMinistries(res.data.ministries || []);
    } catch (err) {
      console.error('Error fetching meta:', err);
    }
  };

  const loadSchemes = async () => {
    try {
      setIsLoading(true);
      const res = await schemeApi.getSchemes({
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
        ministry: ministry !== 'All' ? ministry : undefined,
        sort,
        page,
        limit: 9
      });
      setSchemes(res.data.schemes || []);
      setPagination(res.data.pagination || { total: 0, page: 1, limit: 9, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'All' && value !== '') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // Reset to page 1 on filter change
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Central & State Welfare Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Government Scheme Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            Discover verified welfare programs from all Central Government Ministries. Filter by target category, responsible ministry, and financial entitlement.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search by keyword or scheme code..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Ministry Filter */}
          <div>
            <select
              value={ministry}
              onChange={(e) => updateParam('ministry', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Ministries</option>
              {ministries.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Recently Added</option>
              <option value="financial_desc">Benefit: High to Low</option>
              <option value="financial_asc">Benefit: Low to High</option>
              <option value="name_asc">Alphabetical (A-Z)</option>
            </select>

            {(search || category !== 'All' || ministry !== 'All' || sort !== 'recent') && (
              <button
                onClick={clearAllFilters}
                title="Reset Filters"
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-xs font-semibold text-slate-600">
            Showing <span className="text-slate-900">{schemes.length}</span> of <span className="text-slate-900">{pagination.total}</span> available schemes
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-72 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : schemes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">No Schemes Found</h3>
            <p className="text-xs text-slate-500">
              No government schemes match the selected filters. Try broadening your search or resetting all filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map(scheme => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              disabled={page <= 1}
              onClick={() => updateParam('page', String(page - 1))}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs font-medium text-slate-600 px-3">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => updateParam('page', String(page + 1))}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
