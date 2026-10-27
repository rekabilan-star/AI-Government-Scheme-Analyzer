import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Building, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Initial profile fields
  const [age, setAge] = useState<string>('28');
  const [state, setState] = useState<string>('Uttar Pradesh');
  const [occupation, setOccupation] = useState<string>('Farmer');
  const [income, setIncome] = useState<string>('180000');
  const [category, setCategory] = useState<string>('OBC');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);

      const res = await register(name.trim(), email.trim(), password, {
        age: age ? Number(age) : undefined,
        state: state.trim(),
        occupation: occupation.trim(),
        annualFamilyIncome: income ? Number(income) : undefined,
        socialCategory: category as any
      });

      if (res.success) {
        navigate('/profile');
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-700 flex items-center justify-center text-white mx-auto shadow-md">
          <Building className="w-6 h-6 text-amber-300" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen Registration</h1>
        <p className="text-xs text-slate-500">
          Create an account to calibrate your profile and unlock personalized welfare scheme discovery
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
              Initial Profile Parameters
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Student">Student</option>
                  <option value="Street Vendor">Street Vendor</option>
                  <option value="Self-Employed (Small Business)">Self-Employed / Shopkeeper</option>
                  <option value="Daily Wage Worker">Daily Wage / Construction</option>
                  <option value="Unemployed">Unemployed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Family Income (₹)
              </label>
              <input
                type="number"
                step="5000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isLoading ? 'Creating Account...' : 'Complete Citizen Registration'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-blue-700 hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};
