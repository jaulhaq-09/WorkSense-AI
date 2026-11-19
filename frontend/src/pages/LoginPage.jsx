import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Shield, Sparkles, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogoMark } from '../components/Sidebar';

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
        addToast(`Welcome to WorkSense AI, ${user.name}!`, 'success');
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

  const demoAccounts = [
    { label: 'Admin', email: 'admin@worksense.ai', pass: 'Admin123!', role: 'System Admin' },
    { label: 'Project Manager', email: 'pm@worksense.ai', pass: 'Manager123!', role: 'Operations' },
    { label: 'Alex Rivera', email: 'alex@worksense.ai', pass: 'Dev123!', role: 'Dev (Overloaded)' },
    { label: 'Dana White', email: 'dana@worksense.ai', pass: 'Dev123!', role: 'Dev (Available)' },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-zinc-100 relative overflow-hidden font-sans">
      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center cursor-pointer flex flex-col items-center" onClick={() => navigate('/')}>
          <LogoMark className="w-9 h-9 mb-3" />
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            WorkSense <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">AI</span>
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Intelligent Workload Analytics Cockpit
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#111115] py-5 px-6 sm:px-7 shadow-2xl rounded-2xl border border-white/[0.08]">
          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-zinc-900/80 p-0.5 border border-white/[0.05] mb-5">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                !isSignUp ? 'bg-white/[0.08] text-white shadow-sm font-semibold' : 'text-zinc-400 hover:text-white'
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
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
                isSignUp ? 'bg-white/[0.08] text-white shadow-sm font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-rose-500/[0.08] border border-rose-500/25 p-2.5 flex items-start gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Elena Rostova"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Role</label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {['developer', 'project_manager', 'admin'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`py-1.5 px-2 text-center rounded-lg border text-xs capitalize transition ${
                        selectedRole === r
                          ? 'bg-indigo-600/15 text-indigo-300 border-indigo-500/30 font-semibold'
                          : 'bg-[#141418] border-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {r.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-9 py-2 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs tracking-wide transition duration-150 disabled:opacity-50 mt-1 shadow-sm"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : isSignUp ? (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-2 text-center">
              1-Click Demo Accounts
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {demoAccounts.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleQuickLogin(demo.email, demo.pass)}
                  className="p-2 text-left rounded-lg bg-[#141418] hover:bg-[#1a1a20] border border-white/[0.05] hover:border-white/[0.12] transition"
                >
                  <div className="font-medium text-zinc-200 text-xs truncate">{demo.label}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{demo.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-zinc-500">
          Standard JWT Tokens • Role-Based Access Control • PostgreSQL 16
        </div>
      </div>
    </div>
  );
};
