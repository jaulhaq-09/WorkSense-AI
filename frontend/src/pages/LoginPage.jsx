import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'developer') {
        navigate('/personal');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/25 text-white font-extrabold text-2xl mb-4">
            ⚡
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">WorkSense AI</h2>
          <p className="mt-2 text-sm text-slate-400">
            Developer Workload Imbalance Detector & Redistribution Cockpit
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/60 sm:px-10">
          {error && (
            <div className="mb-6 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition duration-150 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-8 pt-6 border-t border-slate-700/60">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              1-Click Demo Accounts
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@worksense.ai', 'AdminPassword123!')}
                className="p-2 text-left rounded-lg bg-slate-900/60 hover:bg-slate-700 border border-slate-700/80 transition"
              >
                <div className="font-semibold text-indigo-300">Admin</div>
                <div className="text-[11px] text-slate-400">admin@worksense.ai</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('pm@worksense.ai', 'Password123!')}
                className="p-2 text-left rounded-lg bg-slate-900/60 hover:bg-slate-700 border border-slate-700/80 transition"
              >
                <div className="font-semibold text-emerald-300">Project Manager</div>
                <div className="text-[11px] text-slate-400">pm@worksense.ai</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alex@worksense.ai', 'Password123!')}
                className="p-2 text-left rounded-lg bg-slate-900/60 hover:bg-slate-700 border border-slate-700/80 transition"
              >
                <div className="font-semibold text-rose-300">Dev A (Alex • 92.5%)</div>
                <div className="text-[11px] text-slate-400">alex@worksense.ai</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('casey@worksense.ai', 'Password123!')}
                className="p-2 text-left rounded-lg bg-slate-900/60 hover:bg-slate-700 border border-slate-700/80 transition"
              >
                <div className="font-semibold text-amber-300">Dev C (Casey • 27.5%)</div>
                <div className="text-[11px] text-slate-400">casey@worksense.ai</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          WorkSense AI Engine • Multi-Role RBAC • Machine Learning Telemetry
        </div>
      </div>
    </div>
  );
};
