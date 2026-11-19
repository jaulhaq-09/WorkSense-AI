import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Shield, Sparkles, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('developer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const user = await signup(name, email, password, selectedRole);
        addToast(`Welcome to WorkSense AI, ${user.name}! Account created.`, 'success');
        if (user.role === 'developer') {
          navigate('/personal');
        } else {
          navigate('/dashboard');
        }
      } else {
        const user = await login(email, password);
        addToast(`Welcome back, ${user.name}!`, 'success');
        if (user.role === 'developer') {
          navigate('/personal');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsSignUp(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden font-sans">
      {/* Background glow ambiance */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[250px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center cursor-pointer" onClick={() => navigate('/')}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-xl shadow-indigo-500/25 text-white font-extrabold text-2xl mb-3">
            ⚡
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5">
            WorkSense <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Intelligent Developer Workload Analytics & Rebalancing Cockpit
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-dark-900/90 backdrop-blur-xl py-6 px-6 sm:px-8 shadow-2xl rounded-2xl border border-slate-700/80">
          {/* Tab Switcher: Sign In vs Sign Up */}
          <div className="flex rounded-xl bg-dark-950 p-1 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-150 ${
                !isSignUp
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-150 ${
                isSignUp
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-dark-950/80 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-dark-950/80 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Platform Role
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('developer')}
                    className={`py-2 px-2 text-center rounded-lg border font-semibold transition ${
                      selectedRole === 'developer'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-dark-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Developer
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('project_manager')}
                    className={`py-2 px-2 text-center rounded-lg border font-semibold transition ${
                      selectedRole === 'project_manager'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-dark-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('admin')}
                    className={`py-2 px-2 text-center rounded-lg border font-semibold transition ${
                      selectedRole === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-dark-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2 bg-dark-950/80 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-dark-950/80 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-98 text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-600/30 transition duration-150 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : isSignUp ? (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              1-Click Demo Credentials
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@worksense.ai', 'Admin123!')}
                className="p-2 text-left rounded-lg bg-dark-950/80 hover:bg-dark-800 border border-slate-800 hover:border-purple-500/40 transition group"
              >
                <div className="font-semibold text-purple-300 group-hover:text-purple-200">Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin@worksense.ai</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('pm@worksense.ai', 'Manager123!')}
                className="p-2 text-left rounded-lg bg-dark-950/80 hover:bg-dark-800 border border-slate-800 hover:border-emerald-500/40 transition group"
              >
                <div className="font-semibold text-emerald-300 group-hover:text-emerald-200">Project Manager</div>
                <div className="text-[10px] text-slate-400 truncate">pm@worksense.ai</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alex@worksense.ai', 'Dev123!')}
                className="p-2 text-left rounded-lg bg-dark-950/80 hover:bg-dark-800 border border-slate-800 hover:border-rose-500/40 transition group"
              >
                <div className="font-semibold text-rose-300 group-hover:text-rose-200">Dev Alex (Overloaded)</div>
                <div className="text-[10px] text-slate-400 truncate">alex@worksense.ai</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('dana@worksense.ai', 'Dev123!')}
                className="p-2 text-left rounded-lg bg-dark-950/80 hover:bg-dark-800 border border-slate-800 hover:border-cyan-500/40 transition group"
              >
                <div className="font-semibold text-cyan-300 group-hover:text-cyan-200">Dev Dana (Underutilized)</div>
                <div className="text-[10px] text-slate-400 truncate">dana@worksense.ai</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          WorkSense AI Engine • Standard JWT Authentication • Role-Based Access Control
        </div>
      </div>
    </div>
  );
};
