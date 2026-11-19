import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Users,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  TrendingDown,
  Clock,
  ChevronRight,
  Scale,
  BrainCircuit,
  Lock,
  GitPullRequest
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-indigo-600/15 via-violet-600/10 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[400px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-dark-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black text-lg">
              ⚡
            </div>
            <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              WorkSense <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
            <a href="#problem" className="hover:text-indigo-400 transition">The Problem</a>
            <a href="#features" className="hover:text-indigo-400 transition">Platform Capabilities</a>
            <a href="#engine" className="hover:text-indigo-400 transition">Intelligence Engine</a>
            <a href="#roles" className="hover:text-indigo-400 transition">Role Workflows</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(user?.role === 'developer' ? '/personal' : '/dashboard')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 active:scale-95"
              >
                Go to Workspace <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/25 active:scale-95 border border-indigo-500/30"
                >
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Powered Developer Workload Imbalance Detector</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Stop counting tickets. <br />
            Measure <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">real cognitive effort</span>.
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed mb-8">
            Traditional issue trackers mislead managers: 3 critical architectural tasks often weigh far more than 8 simple cosmetic tickets. WorkSense AI balances workloads based on complexity, remaining hours, skills, and capacities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition active:scale-95"
            >
              Launch Platform Cockpit <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#engine"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-dark-900 hover:bg-dark-850 text-slate-300 hover:text-white font-semibold text-sm border border-slate-800 transition"
            >
              How Engine Calculates
            </a>
          </div>

          {/* Interactive Live Preview Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-dark-900/90 border border-slate-700/80 p-5 sm:p-7 shadow-2xl backdrop-blur-xl text-left">
            <div className="flex flex-wrap items-center justify-between pb-4 mb-5 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-bold text-slate-200">Live Team Telemetry: Core Engineering</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                  1 Overloaded
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                  2 Balanced
                </span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                  1 Underutilized
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-dark-950/80 border border-rose-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-xs text-rose-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Alex Rivera (Senior Backend)
                  </div>
                  <span className="text-xs font-bold text-rose-400 font-mono">112.5% Load</span>
                </div>
                <div className="w-full bg-dark-900 rounded-full h-2 mb-2 overflow-hidden">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>3 Complex Backend Tasks</span>
                  <span className="text-rose-400 font-semibold">Overloaded by 5.0h</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-dark-950/80 border border-cyan-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-xs text-cyan-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Dana White (Database Specialist)
                  </div>
                  <span className="text-xs font-bold text-cyan-400 font-mono">28.5% Load</span>
                </div>
                <div className="w-full bg-dark-900 rounded-full h-2 mb-2 overflow-hidden">
                  <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '28.5%' }} />
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Available Bandwidth</span>
                  <span className="text-cyan-400 font-semibold">25.0h Available</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Recommendation: Reassign Task #104 to Dana White (95% Skill Match)</span>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition"
              >
                Inspect in Cockpit <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Problem */}
      <section id="problem" className="py-20 border-t border-slate-800/80 bg-dark-900/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
              Why Traditional Task Trackers Fail
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Counting tickets creates an illusion of balance while critical developers silently burn out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-dark-900/80 border border-slate-800 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Hidden Overload & Burnout</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A single developer with 2 critical distributed transaction tasks can be working 60h/week while appearing less busy than someone with 6 UI label changes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-900/80 border border-slate-800 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Underutilized Bandwidth</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Qualified teammates sit with low cognitive loads simply because managers lack real-time visibility into skill proficiencies and remaining hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-900/80 border border-slate-800 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Project Delivery Delays</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When overloaded key engineers become single points of failure, dependent tasks get blocked, cascading delays throughout the entire roadmap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence Engine */}
      <section id="engine" className="py-20 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
              The WorkSense Intelligence Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Deterministic workload formulas combined with supervised machine learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">1. Remaining Effort Weighting</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Subtracts actual logged hours from estimates and scales by task complexity multipliers (Easy 1.0x, Medium 1.2x, Hard 1.5x, Critical 2.0x).
                </p>
              </div>
              <div className="p-3 rounded-lg bg-dark-950 font-mono text-[11px] text-indigo-300 border border-slate-800">
                Effort = (Est - Logged) × Weight
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">2. ML Effort Predictor</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  A Random Forest Regressor predicts realistic task duration based on complexity, priority, and team completion histories.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-dark-950 font-mono text-[11px] text-violet-300 border border-slate-800">
                RandomForestRegressor(n=100)
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">3. Rebalancing Optimizer</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Matches tasks from overloaded engineers to teammates with available capacity and required technical skill proficiencies.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-dark-950 font-mono text-[11px] text-emerald-300 border border-slate-800">
                Score = Match% × CapacityAvail
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Workflows */}
      <section id="roles" className="py-20 border-t border-slate-800/80 bg-dark-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
              Tailored for Every Role
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Role-based access ensures engineers focus on execution while managers maintain balance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Role: Administrator</div>
              <h3 className="text-base font-bold text-white mb-2">Organization Governance</h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  Manage enterprise teams & engineers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  Define technical skill matrix & proficiencies
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  Configure weekly capacities & accounts
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Role: Project Manager</div>
              <h3 className="text-base font-bold text-white mb-2">Workload Operations</h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  View real-time team imbalance & variance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  1-Click task redistribution approval
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Predict task effort using ML regression
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-dark-900 border border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2">Role: Developer</div>
              <h3 className="text-base font-bold text-white mb-2">Personal Cockpit</h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  Track personal capacity & active tasks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  Quickly log actual hours spent on tickets
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  Update progress status without PM friction
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 border-t border-slate-800/80 bg-gradient-to-b from-dark-950 to-dark-900 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to eliminate developer burnout?
          </h2>
          <p className="text-sm text-slate-400 mb-8 max-w-xl mx-auto">
            Experience real-time workload balancing with PostgreSQL, FastAPI, and React.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition active:scale-95"
          >
            Launch Demo Cockpit <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>WorkSense AI • Production Architecture • PostgreSQL 16 • FastAPI • React 18</p>
      </footer>
    </div>
  );
};
