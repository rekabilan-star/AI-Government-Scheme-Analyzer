import React, { useState, useEffect } from 'react';
import { schemeApi } from '../services/api.js';
import { GovernmentScheme, UserProfile } from '../types/index.js';
import { OfficialDossierModal } from '../components/OfficialDossierModal.js';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  FileText,
  Building2,
  TrendingUp,
  Info,
  Scale
} from 'lucide-react';

interface SimulatedEvaluation {
  scheme: GovernmentScheme;
  status: 'Eligible' | 'Potentially Eligible' | 'Ineligible';
  score: number;
  satisfied: string[];
  unmet: string[];
  missing: string[];
}

export const EligibilitySimulator: React.FC = () => {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Profile Simulator Parameters
  const [age, setAge] = useState<number>(32);
  const [income, setIncome] = useState<number>(180000);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Transgender' | 'Other'>('Male');
  const [occupation, setOccupation] = useState<string>('Farmer');
  const [category, setCategory] = useState<'General' | 'OBC' | 'SC' | 'ST' | 'EWS'>('OBC');
  const [state, setState] = useState<string>('Uttar Pradesh');
  const [disability, setDisability] = useState<boolean>(false);
  const [landHolding, setLandHolding] = useState<number>(2.0);

  // Dossier Modal State
  const [selectedDossierScheme, setSelectedDossierScheme] = useState<GovernmentScheme | null>(null);
  const [selectedEval, setSelectedEval] = useState<SimulatedEvaluation | null>(null);

  // Filter tab for results
  const [filterTab, setFilterTab] = useState<'All' | 'Eligible' | 'Potentially Eligible' | 'Ineligible'>('All');

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setIsLoading(true);
      const res = await schemeApi.getSchemes({ limit: 100 });
      setSchemes(res.data.schemes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Preset Handlers
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'farmer':
        setAge(35);
        setIncome(120000);
        setGender('Male');
        setOccupation('Farmer');
        setCategory('OBC');
        setState('Uttar Pradesh');
        setDisability(false);
        setLandHolding(2.5);
        break;
      case 'vendor':
        setAge(42);
        setIncome(90000);
        setGender('Male');
        setOccupation('Street Vendor');
        setCategory('SC');
        setState('Maharashtra');
        setDisability(false);
        setLandHolding(0);
        break;
      case 'woman-entrepreneur':
        setAge(28);
        setIncome(300000);
        setGender('Female');
        setOccupation('Self-Employed / MSME');
        setCategory('ST');
        setState('Tamil Nadu');
        setDisability(false);
        setLandHolding(0);
        break;
      case 'student':
        setAge(19);
        setIncome(80000);
        setGender('Female');
        setOccupation('Student');
        setCategory('General');
        setState('Karnataka');
        setDisability(false);
        setLandHolding(0);
        break;
      case 'senior':
        setAge(64);
        setIncome(60000);
        setGender('Female');
        setOccupation('Senior Citizen');
        setCategory('General');
        setState('Delhi');
        setDisability(false);
        setLandHolding(0);
        break;
      case 'divyangjan':
        setAge(30);
        setIncome(110000);
        setGender('Male');
        setOccupation('Unemployed');
        setCategory('OBC');
        setState('Bihar');
        setDisability(true);
        setLandHolding(0);
        break;
      case 'artisan':
        setAge(38);
        setIncome(140000);
        setGender('Male');
        setOccupation('Artisan');
        setCategory('OBC');
        setState('Rajasthan');
        setDisability(false);
        setLandHolding(0);
        break;
      case 'shg-woman':
        setAge(29);
        setIncome(95000);
        setGender('Female');
        setOccupation('Self-Employed (Small Business)');
        setCategory('General');
        setState('Tamil Nadu');
        setDisability(false);
        setLandHolding(0);
        break;
      default:
        break;
    }
  };

  // Deterministic Evaluation Logic
  const evaluations: SimulatedEvaluation[] = schemes.map(scheme => {
    const satisfied: string[] = [];
    const unmet: string[] = [];
    const missing: string[] = [];
    let passedChecks = 0;
    let totalChecks = 0;

    const crit = scheme.eligibility;

    // Age Check
    if (crit.minAge !== undefined || crit.maxAge !== undefined) {
      totalChecks++;
      const minPass = crit.minAge === undefined || age >= crit.minAge;
      const maxPass = crit.maxAge === undefined || age <= crit.maxAge;
      if (minPass && maxPass) {
        satisfied.push(`Age: ${age} meets criteria (${crit.minAge || 0} - ${crit.maxAge || 'Any'} yrs)`);
        passedChecks++;
      } else {
        unmet.push(`Age ${age} outside limit (${crit.minAge || 0} - ${crit.maxAge || 'Any'} yrs)`);
      }
    }

    // Income Check
    if (crit.maxAnnualIncome !== undefined) {
      totalChecks++;
      if (income <= crit.maxAnnualIncome) {
        satisfied.push(`Income ₹${income.toLocaleString('en-IN')} within ceiling (₹${crit.maxAnnualIncome.toLocaleString('en-IN')})`);
        passedChecks++;
      } else {
        unmet.push(`Income ₹${income.toLocaleString('en-IN')} exceeds ceiling of ₹${crit.maxAnnualIncome.toLocaleString('en-IN')}`);
      }
    }

    // Gender Check
    if (crit.allowedGenders && crit.allowedGenders.length > 0 && !crit.allowedGenders.includes('All')) {
      totalChecks++;
      if (crit.allowedGenders.includes(gender)) {
        satisfied.push(`Gender requirement (${gender}) satisfied`);
        passedChecks++;
      } else {
        unmet.push(`Scheme targeted exclusively for ${crit.allowedGenders.join(', ')}`);
      }
    }

    // Occupation Check
    if (crit.allowedOccupations && crit.allowedOccupations.length > 0 && !crit.allowedOccupations.includes('All')) {
      totalChecks++;
      const matchOcc = crit.allowedOccupations.some(
        (o: string) => o.toLowerCase().includes(occupation.toLowerCase()) || occupation.toLowerCase().includes(o.toLowerCase())
      );
      if (matchOcc) {
        satisfied.push(`Occupation (${occupation}) matches target category`);
        passedChecks++;
      } else {
        unmet.push(`Targeted to: ${crit.allowedOccupations.join(', ')} (Applicant is ${occupation})`);
      }
    }

    // Social Category Check
    if (crit.allowedCategories && crit.allowedCategories.length > 0 && !crit.allowedCategories.includes('All')) {
      totalChecks++;
      const matchCat = crit.allowedCategories.some(
        (c: string) => c.toLowerCase() === category.toLowerCase() || c === 'All'
      );
      if (matchCat) {
        satisfied.push(`Social category (${category}) eligible`);
        passedChecks++;
      } else {
        unmet.push(`Reserved for: ${crit.allowedCategories.join(', ')}`);
      }
    }

    // State Check
    if (crit.allowedStates && crit.allowedStates.length > 0 && !crit.allowedStates.includes('All')) {
      totalChecks++;
      const matchState = crit.allowedStates.some(
        (s: string) => s.toLowerCase() === state.toLowerCase() || s === 'All'
      );
      if (matchState) {
        satisfied.push(`State (${state}) within scheme jurisdiction`);
        passedChecks++;
      } else {
        unmet.push(`Restricted to states: ${crit.allowedStates.join(', ')}`);
      }
    }

    // Disability Check
    if (crit.disabilityRequired !== undefined && crit.disabilityRequired) {
      totalChecks++;
      if (disability) {
        satisfied.push('Person with Disability (Divyangjan) criteria satisfied');
        passedChecks++;
      } else {
        unmet.push('Requires verified disability certificate (>= 40%)');
      }
    }

    // Landholding Check for agriculture
    if (scheme.name.includes('PM-KISAN') || scheme.category.includes('Agriculture')) {
      totalChecks++;
      if (landHolding > 0 && landHolding <= 5.0) {
        satisfied.push(`Cultivable land (${landHolding} acres) falls under small/marginal criteria`);
        passedChecks++;
      } else if (landHolding > 5.0) {
        unmet.push(`Landholding of ${landHolding} acres exceeds small/marginal ceiling of 5 acres`);
      } else {
        unmet.push('Cultivable land ownership document required for agricultural benefit');
      }
    }

    // Assessment Decision
    let status: 'Eligible' | 'Potentially Eligible' | 'Ineligible';
    const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 80;

    if (unmet.length === 0) {
      status = 'Eligible';
    } else if (unmet.length === 1 && score >= 60) {
      status = 'Potentially Eligible';
    } else {
      status = 'Ineligible';
    }

    return {
      scheme,
      status,
      score,
      satisfied,
      unmet,
      missing
    };
  });

  const eligibleCount = evaluations.filter(e => e.status === 'Eligible').length;
  const potentialCount = evaluations.filter(e => e.status === 'Potentially Eligible').length;
  const ineligibleCount = evaluations.filter(e => e.status === 'Ineligible').length;

  const filteredEvaluations = evaluations.filter(e => {
    if (filterTab === 'All') return true;
    return e.status === filterTab;
  });

  const openDossier = (evaluation: SimulatedEvaluation) => {
    setSelectedEval(evaluation);
    setSelectedDossierScheme(evaluation.scheme);
  };

  const simulatedCitizenProfile: Partial<UserProfile> = {
    age,
    annualFamilyIncome: income,
    gender,
    occupation,
    socialCategory: category,
    state,
    disabilityStatus: disability
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md mb-2">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Real-Time Citizen Sensitivity Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Interactive Scheme Eligibility & Sensitivity Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Dynamically manipulate demographic parameters to evaluate deterministic boundary conditions in real time. Observe instant qualification changes across all Central and State welfare schemes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => applyPreset('farmer')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Reset to Farmer
            </button>
          </div>
        </div>

        {/* Quick Demographic Presets */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <span className="text-xs font-bold text-slate-700 block mb-2.5">
            Quick Persona Presets for Viva Demonstration:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'farmer', label: '🌾 Small Farmer (UP)' },
              { id: 'vendor', label: '🛒 Street Vendor (MH)' },
              { id: 'artisan', label: '🛠️ Traditional Artisan (PM-Vishwakarma)' },
              { id: 'shg-woman', label: '👩‍🌾 Rural SHG Woman (Lakhpati Didi)' },
              { id: 'woman-entrepreneur', label: '💼 SC/ST Woman Entrepreneur' },
              { id: 'student', label: '🎓 College Student' },
              { id: 'senior', label: '👵 Senior Citizen (Pension)' },
              { id: 'divyangjan', label: '♿ Divyangjan (Disabled)' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className="px-3 py-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-medium rounded-md transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulator Workspace: Controls on Left, Live Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Parameter Controls (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Demographic Variables</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Live Input</span>
          </div>

          {/* Age Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <label htmlFor="sim-age" className="text-slate-700 font-bold">Age of Applicant</label>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {age} Years
              </span>
            </div>
            <input
              id="sim-age"
              type="range"
              min={1}
              max={80}
              value={age}
              onChange={e => setAge(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 yr</span>
              <span>18 yrs</span>
              <span>40 yrs</span>
              <span>60 yrs</span>
              <span>80 yrs</span>
            </div>
          </div>

          {/* Income Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <label htmlFor="sim-income" className="text-slate-700 font-bold">Annual Family Income</label>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                ₹{income.toLocaleString('en-IN')} / yr
              </span>
            </div>
            <input
              id="sim-income"
              type="range"
              min={0}
              max={1200000}
              step={10000}
              value={income}
              onChange={e => setIncome(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹0</span>
              <span>₹2.5L (BPL)</span>
              <span>₹5L</span>
              <span>₹8L (EWS)</span>
              <span>₹12L</span>
            </div>
          </div>

          {/* Occupation Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Occupation / Sector</label>
            <select
              value={occupation}
              onChange={e => setOccupation(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 font-medium"
            >
              <option value="Farmer">Farmer (Small / Marginal)</option>
              <option value="Street Vendor">Street Vendor / Hawkers</option>
              <option value="Self-Employed / MSME">Self-Employed / Small Business / MSME</option>
              <option value="Student">Student (Secondary / Higher Education)</option>
              <option value="Daily Wage Worker">Daily Wage / Construction Worker</option>
              <option value="Unemployed">Unemployed Youth / Job Seeker</option>
              <option value="Senior Citizen">Senior Citizen (Retired)</option>
              <option value="Artisan">Artisan / Handloom Weaver</option>
            </select>
          </div>

          {/* Gender & Category Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Social Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white font-medium"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
          </div>

          {/* State Jurisdiction */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">State of Domicile</label>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white font-medium"
            >
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Bihar">Bihar</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Gujarat">Gujarat</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>

          {/* Landholding & Disability */}
          <div className="space-y-3 pt-3 border-t border-slate-200 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Cultivable Landholding</span>
                <span className="font-mono text-slate-900 font-semibold">{landHolding} Acres</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={landHolding}
                onChange={e => setLandHolding(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="font-bold text-slate-700">Divyangjan (Disability &gt;= 40%)</span>
              <button
                type="button"
                onClick={() => setDisability(!disability)}
                className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors ${
                  disability
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {disability ? 'Yes (Verified)' : 'No'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Scheme Matrix & Sensitivity Feed (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Summary Metric Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Evaluated
              </span>
              <span className="text-2xl font-black text-slate-900">{schemes.length}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Central & State Schemes</span>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Eligible Schemes
              </span>
              <span className="text-2xl font-black text-emerald-700">{eligibleCount}</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">100% Boundary Satisfied</span>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 shadow-xs">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Potentially Eligible
              </span>
              <span className="text-2xl font-black text-amber-700">{potentialCount}</span>
              <span className="text-[10px] text-amber-600 block mt-0.5">Minor Action Needed</span>
            </div>

            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 shadow-xs">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                Ineligible
              </span>
              <span className="text-2xl font-black text-rose-700">{ineligibleCount}</span>
              <span className="text-[10px] text-rose-600 block mt-0.5">Boundary Condition Failed</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 p-1.5 bg-slate-100 rounded-xl">
            <div className="flex items-center gap-1">
              {(['All', 'Eligible', 'Potentially Eligible', 'Ineligible'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    filterTab === tab
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500 px-3 font-medium">
              Showing {filteredEvaluations.length} Schemes
            </span>
          </div>

          {/* Scheme Simulation Cards */}
          <div className="space-y-4">
            {filteredEvaluations.map(item => (
              <div
                key={item.scheme.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-blue-800">{item.scheme.ministry}</span>
                      <span>·</span>
                      <span>{item.scheme.category}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {item.scheme.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold ${
                        item.status === 'Eligible'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : item.status === 'Potentially Eligible'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}
                    >
                      {item.status === 'Eligible' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {item.status === 'Potentially Eligible' && <AlertCircle className="w-3.5 h-3.5" />}
                      {item.status === 'Ineligible' && <XCircle className="w-3.5 h-3.5" />}
                      <span>{item.status} ({item.score}%)</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{item.scheme.description}</p>

                {/* Criteria Breakdown Grid */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                    Criteria Verification Analysis:
                  </span>
                  <div className="space-y-1">
                    {item.satisfied.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-emerald-800 font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                    {item.unmet.map((u, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-rose-800 font-medium text-[11px]">
                        <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span>{u}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs gap-3">
                  <div className="text-slate-500 font-medium">
                    <span className="font-semibold text-slate-800">Benefits: </span>
                    <span>{item.scheme.benefits.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDossier(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Official Dossier</span>
                    </button>
                    <a
                      href={item.scheme.officialApplicationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Dossier Modal */}
      {selectedDossierScheme && selectedEval && (
        <OfficialDossierModal
          isOpen={!!selectedDossierScheme}
          onClose={() => setSelectedDossierScheme(null)}
          scheme={selectedDossierScheme}
          citizenProfile={simulatedCitizenProfile}
          eligibilityStatus={selectedEval.status}
          satisfiedCriteria={selectedEval.satisfied}
          unmetCriteria={selectedEval.unmet}
          matchScore={selectedEval.score}
        />
      )}
    </div>
  );
};
