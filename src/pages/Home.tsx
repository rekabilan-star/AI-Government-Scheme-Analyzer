import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { schemeApi } from '../services/api.js';
import { GovernmentScheme } from '../types/index.js';
import { SchemeCard } from '../components/SchemeCard.js';
import {
  Search,
  Sparkles,
  CheckCircle2,
  Bot,
  ListTodo,
  TrendingUp,
  Building,
  Users,
  Award,
  ArrowRight,
  ShieldCheck,
  Compass,
  FileCheck2,
  HeartHandshake,
  SlidersHorizontal,
  GraduationCap,
  Scale,
  FileText
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredSchemes, setFeaturedSchemes] = useState<GovernmentScheme[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Eligibility Form State
  const [quickAge, setQuickAge] = useState<string>('30');
  const [quickOccupation, setQuickOccupation] = useState<string>('Farmer');
  const [quickIncome, setQuickIncome] = useState<string>('150000');
  const [quickCategory, setQuickCategory] = useState<string>('OBC');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [schemesRes, metaRes] = await Promise.all([
        schemeApi.getSchemes({ limit: 6 }),
        schemeApi.getMeta()
      ]);
      setFeaturedSchemes(schemesRes.data.schemes || []);
      setCategories(metaRes.data.categories || []);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/schemes');
    }
  };

  const handleQuickAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/eligibility?age=${quickAge}&occ=${quickOccupation}&inc=${quickIncome}&cat=${quickCategory}`);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-400/20 rounded-lg text-amber-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>CSE Capstone Project · Dual-Engine Deterministic + Gemini GenAI Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            AI-Powered Government <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Scheme Analyzer</span> & Recommendation System
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            Discover verified Central and State welfare entitlements, simulate rule-based eligibility with zero hallucination, receive grounded Gemini AI guidance, and generate official citizen submission dossiers.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schemes: PM-KISAN, Ayushman Bharat, Mudra, Housing..."
                className="w-full pl-11 pr-4 py-3 bg-white/10 text-white placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-white/15 focus:outline-hidden focus:ring-2 focus:ring-blue-400 backdrop-blur-xs font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Search Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Academic & Feature Navigation Strip */}
          <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <Link to="/simulator" className="flex items-center gap-1.5 hover:text-amber-300 transition-colors font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>What-If Simulator</span>
            </Link>
            <span className="text-slate-600">·</span>
            <Link to="/viva-hub" className="flex items-center gap-1.5 hover:text-blue-300 transition-colors font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>Viva & Architecture Hub</span>
            </Link>
            <span className="text-slate-600">·</span>
            <Link to="/compare" className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors font-medium">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scheme Compare Matrix</span>
            </Link>
          </div>
        </div>

        {/* Ambient Visual Accents */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Institutional Statistics Bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">20+</p>
              <p className="text-xs text-slate-500 font-medium">Authentic Central Schemes</p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">100%</p>
              <p className="text-xs text-slate-500 font-medium">Deterministic Rule Bounds</p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">Gemini 3.8</p>
              <p className="text-xs text-slate-500 font-medium">Flash Grounded Explainer</p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">Official</p>
              <p className="text-xs text-slate-500 font-medium">Printable Citizen Dossiers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Two Columns: Quick Eligibility Analyzer & Viva Architecture Spotlight */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Quick Instant Check (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
              <Compass className="w-4 h-4" />
              <span>30-Second Pre-Screening</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Instant Citizen Eligibility Screener
            </h2>
            <p className="text-xs text-slate-600">
              Enter your basic socio-economic profile to compute matched welfare schemes and personalized recommendations:
            </p>
          </div>

          <form onSubmit={handleQuickAnalyze} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Applicant Age (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quickAge}
                  onChange={(e) => setQuickAge(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Occupation / Sector</label>
                <select
                  value={quickOccupation}
                  onChange={(e) => setQuickOccupation(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 font-medium bg-white"
                >
                  <option value="Farmer">Farmer (Small / Marginal)</option>
                  <option value="Street Vendor">Street Vendor / Hawker</option>
                  <option value="Self-Employed / MSME">Self-Employed / MSME / Trader</option>
                  <option value="Student">Student / Scholar</option>
                  <option value="Daily Wage Worker">Daily Wage / Construction</option>
                  <option value="Unemployed">Unemployed Youth</option>
                  <option value="Senior Citizen">Senior Citizen (Retired)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Annual Family Income (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={quickIncome}
                  onChange={(e) => setQuickIncome(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Social Category</label>
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 font-medium bg-white"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC (Other Backward Class)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-medium">
                * Evaluated by server-side deterministic inequality matrix.
              </span>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Analyze Full Eligibility</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Academic Capstone & Viva Showcase Spotlight (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xs space-y-5 border border-slate-800">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
              College Project Examination Ready
            </span>
            <h3 className="text-lg font-black text-white tracking-tight">
              Academic Viva & Architecture Center
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Equipped with complete IEEE synopsis, 20-point defense Q&A, algorithmic complexity breakdowns, and entity relationship diagrams for examiners.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <Link
              to="/viva-hub"
              className="p-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl flex items-center justify-between group transition-colors block"
            >
              <div>
                <span className="font-bold text-white block">System Architecture Blueprint</span>
                <span className="text-[11px] text-slate-400">Multi-tier data flow and invariant boundaries</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/simulator"
              className="p-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl flex items-center justify-between group transition-colors block"
            >
              <div>
                <span className="font-bold text-white block">Real-Time Sensitivity Simulator</span>
                <span className="text-[11px] text-slate-400">What-if live parameter manipulation</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/chat"
              className="p-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl flex items-center justify-between group transition-colors block"
            >
              <div>
                <span className="font-bold text-white block">Grounded Gemini AI Copilot</span>
                <span className="text-[11px] text-slate-400">Conversational guidance with TTS audio</span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">100% Pre-Seeded & Ready</span>
            <Link to="/viva-hub" className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
              <span>Open Defense Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Central Welfare Schemes */}
      <section className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Featured Central Welfare Schemes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Authentic schemes from the Ministry of Agriculture, Finance, Health, and Housing
            </p>
          </div>
          <Link
            to="/schemes"
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Schemes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-200/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredSchemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </section>

      {/* Scheme Sectors Exploration Strip */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Explore by Welfare Domain</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/schemes?category=${encodeURIComponent(cat)}`}
              className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
