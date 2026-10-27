import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Building, ShieldCheck, User, LogIn, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await login(email.trim(), password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMsg(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (type: 'citizen' | 'admin') => {
    if (type === 'citizen') {
      setEmail('citizen@demo.in');
      setPassword('Citizen@1234');
    } else {
      setEmail('admin@gov.in');
      setPassword('Admin@1234');
    }
    setErrorMsg(null);
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-700 flex items-center justify-center text-white mx-auto shadow-md">
          <Building className="w-6 h-6 text-amber-300" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Citizen & Staff Portal</h1>
        <p className="text-xs text-slate-500">
          Sign in to access personalized scheme recommendations and tracking
        </p>
      </div>

      {/* Demo Credentials Quick Fill Box */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2.5">
        <span className="text-[11px] uppercase tracking-wider font-bold text-blue-900 block">
          College Project Demo Logins:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleFillDemo('citizen')}
            className="p-2.5 bg-white hover:bg-blue-100/50 border border-blue-200 rounded-xl text-left transition-colors group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Citizen Demo</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">citizen@demo.in</p>
          </button>

          <button
            type="button"
            onClick={() => handleFillDemo('admin')}
            className="p-2.5 bg-white hover:bg-blue-100/50 border border-blue-200 rounded-xl text-left transition-colors group"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin Demo</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">admin@gov.in</p>
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. citizen@demo.in"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Signing In...' : 'Sign In to Portal'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
          New citizen user?{' '}
          <Link to="/register" className="font-bold text-blue-700 hover:underline">
            Register new account
          </Link>
        </div>
      </div>
    </div>
  );
};
