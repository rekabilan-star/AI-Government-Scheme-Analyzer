import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { UserProfile } from '../types/index.js';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Building,
  GraduationCap,
  Briefcase,
  IndianRupee,
  Layers
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [gender, setGender] = useState<string>('Male');
  const [state, setState] = useState<string>('Uttar Pradesh');
  const [district, setDistrict] = useState<string>('Varanasi');
  const [occupation, setOccupation] = useState<string>('Farmer');
  const [income, setIncome] = useState<string>('140000');
  const [education, setEducation] = useState<string>('10th Pass');
  const [category, setCategory] = useState<string>('OBC');
  const [disability, setDisability] = useState<boolean>(false);
  const [maritalStatus, setMaritalStatus] = useState<string>('Married');

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAge(user.profile?.age !== undefined ? String(user.profile.age) : '30');
      setDob(user.profile?.dob || '');
      setGender(user.profile?.gender || 'Male');
      setState(user.profile?.state || 'Uttar Pradesh');
      setDistrict(user.profile?.district || 'Varanasi');
      setOccupation(user.profile?.occupation || 'Farmer');
      setIncome(user.profile?.annualFamilyIncome !== undefined ? String(user.profile.annualFamilyIncome) : '150000');
      setEducation(user.profile?.education || '10th Pass');
      setCategory(user.profile?.socialCategory || 'OBC');
      setDisability(user.profile?.disabilityStatus || false);
      setMaritalStatus(user.profile?.maritalStatus || 'Married');
    }
  }, [user]);

  // Calculate profile completeness score
  const calculateCompleteness = () => {
    const fields = [name, age, gender, state, district, occupation, income, education, category];
    const filled = fields.filter(f => f !== undefined && f !== null && String(f).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMsg(null);
      setSaveSuccess(false);

      const profilePayload: Partial<UserProfile> = {
        age: age ? Number(age) : undefined,
        dob: dob || undefined,
        gender: gender as any,
        state: state.trim(),
        district: district.trim(),
        occupation: occupation.trim(),
        annualFamilyIncome: income ? Number(income) : undefined,
        education: education.trim(),
        socialCategory: category as any,
        disabilityStatus: disability,
        maritalStatus: maritalStatus.trim()
      };

      const res = await updateProfile(profilePayload, name.trim());
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMsg(res.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md mb-2">
              <User className="w-3.5 h-3.5" />
              <span>Citizen Demographics & Socioeconomic Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Manage Citizen Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Your profile parameters directly power deterministic eligibility scoring and personalized AI recommendations.
            </p>
          </div>

          {/* Completeness Meter */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs shrink-0 self-start sm:self-auto w-48">
            <div className="flex items-center justify-between font-bold text-slate-900 mb-1.5">
              <span>Profile Score:</span>
              <span className="text-blue-700">{completeness}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {completeness === 100 ? 'Fully calibrated!' : 'Complete fields for 100% match accuracy'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile updated successfully! Recommendation and eligibility rules have been re-calibrated.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: Basic Identity */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Personal Identity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Email is bound to your account login</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Age (Years)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Domicile & Location */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Location & Domicile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">State / Union Territory</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Uttar Pradesh, Tamil Nadu, Maharashtra..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Varanasi, Madurai, Pune..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Socioeconomic & Demographic Attributes */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Socioeconomic Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Occupation</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Farmer">Farmer (Landholding)</option>
                <option value="Agriculture Laborer">Agricultural Laborer</option>
                <option value="Student">Student (Class 10/12/College)</option>
                <option value="Street Vendor">Street Vendor / Hawker</option>
                <option value="Self-Employed (Small Business)">Small Business / Micro Enterprise</option>
                <option value="Daily Wage Worker">Daily Wage / Construction</option>
                <option value="Artisan">Artisan / Weaver / Craftsman</option>
                <option value="Unemployed">Unemployed / Job Seeker</option>
                <option value="Private Employee">Private Employee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Annual Family Income (₹)</label>
              <input
                type="number"
                step="5000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="e.g. 150000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Highest Education</label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Below 10th">Below 10th</option>
                <option value="10th Pass">10th Pass</option>
                <option value="12th Pass">12th Pass</option>
                <option value="Diploma">Diploma / ITI</option>
                <option value="Undergraduate">Undergraduate Degree</option>
                <option value="Postgraduate">Postgraduate Degree</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Social Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="General">General</option>
                <option value="OBC">OBC (Other Backward Class)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center gap-3">
            <input
              type="checkbox"
              id="disabilityProfileCheck"
              checked={disability}
              onChange={(e) => setDisability(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="disabilityProfileCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
              I possess a certified benchmark disability of 40% or more (UDID Card Holder)
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Encrypted and protected under citizen privacy standards.
          </span>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
