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
  Scale
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black text-xl">
              ⚡
            </div>
            <div className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              WorkSense <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-400 transition">How It Works</a>
            <a href="#engine" className="hover:text-indigo-400 transition">Intelligence Engine</a>
            <a href="#ml" className="hover:text-indigo-400 transition">Machine Learning</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(user?.role === 'developer' ? '/personal' : '/dashboard')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 active:scale-95"
              >
                Go to Workspace <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 active:scale-95"
                >
                  Launch Demo <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Next-Generation Developer Workload Imbalance Detector
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none">
            Stop Guessing Team Bandwidth.<br />
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent">
              Balance Engineering Workload With AI.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Traditional project trackers count tasks, not effort. WorkSense AI combines{' '}
            <strong className="text-slate-200">cognitive complexity weights</strong>,{' '}
            <strong className="text-slate-200">technical skill matrices</strong>,{' '}
            <strong className="text-slate-200">actual logged hours</strong>, and{' '}
            <strong className="text-slate-200">machine learning effort prediction</strong> to eliminate burnout
            and recommend feasible task redistributions.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition active:scale-95"
            >
              Start Free Demo Workspace <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-sm transition"
            >
              Explore Calculation Logic
            </a>
          </div>

          {/* Interactive Live Scenario Simulation Card */}
          <div className="mt-16 text-left max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live Imbalance Scenario • Section 10 Demo Benchmark
                </span>
              </div>
              <span className="text-xs font-mono text-indigo-400">Status: Imbalance Detected</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Developer A */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 relative">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-white">Alex Rivera</span>
                  <span className="text-rose-400 font-mono">92.5%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Senior Backend Engineer</div>
                <div className="mt-3 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Remaining Weighted:</span> <span className="text-slate-200">37.0 hrs</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Available Capacity:</span> <span className="text-slate-200">40.0 hrs</span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[92.5%]" />
                </div>
                <div className="mt-2 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  &bull; Overloaded (Burnout Risk)
                </div>
              </div>

              {/* Developer B */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-white">Blake Chen</span>
                  <span className="text-emerald-400 font-mono">45.0%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Mid Frontend Engineer</div>
                <div className="mt-3 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Remaining Weighted:</span> <span className="text-slate-200">18.0 hrs</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Available Capacity:</span> <span className="text-slate-200">40.0 hrs</span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[45%]" />
                </div>
                <div className="mt-2 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  &bull; Balanced Zone
                </div>
              </div>

              {/* Developer C */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-white">Casey Morgan</span>
                  <span className="text-amber-400 font-mono">27.5%</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Full Stack Engineer</div>
                <div className="mt-3 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Remaining Weighted:</span> <span className="text-slate-200">11.0 hrs</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Available Capacity:</span> <span className="text-slate-200">40.0 hrs</span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[27.5%]" />
                </div>
                <div className="mt-2 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  &bull; Underutilized (Capacity Available)
                </div>
              </div>
            </div>

            {/* Simulated Recommendation Pill */}
            <div className="mt-4 p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-slate-300">
                  <strong className="text-white">AI Suggestion:</strong> Reassign "Distributed Query Cache Optimization" (12.0 weighted hrs) from Alex to Casey. Both achieve optimal balanced utilization (62.5% & 57.5%).
                </span>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shrink-0 transition"
              >
                Test Reassignment
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section id="how-it-works" className="py-20 border-t border-slate-900 bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">The Engineering Flaw</h2>
            <h3 className="text-3xl font-extrabold text-white">Why Task Counts Lie to Project Managers</h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Traditional project management tools display Developer B as the busiest simply because they have 6 assigned tasks,
              even though they are trivial UI adjustments. Developer A has 3 distributed database clustering tasks and is burning out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-rose-950/15 border border-rose-900/30 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Traditional Task Trackers</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">&times;</span> Treats a 1-hour CSS fix the same as a 30-hour distributed cache refactor.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">&times;</span> Ignores developer technical skill proficiencies and experience disparities.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">&times;</span> Blind to blocked dependency bottlenecks that lock developer capacity.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">&times;</span> Results in developer burnout, delayed sprints, and skewed velocity reports.
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">WorkSense AI Solution</h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">&check;</span> <strong>Cognitive Multipliers:</strong> Weighs tasks by complexity (1.0x to 2.0x).
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">&check;</span> <strong>Remaining Hours Formula:</strong> Real-time deduction of logged hours.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">&check;</span> <strong>Skill-Matched Redistribution:</strong> Finds underutilized engineers who match skill requirements.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">&check;</span> <strong>ML Effort Prediction:</strong> Random Forest model forecasts completion variance.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 border-t border-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Platform Capabilities</h2>
            <h3 className="text-3xl font-extrabold text-white">Engineered For Modern Engineering Squads</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Workload Intelligence Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates remaining effort, nominal capacity utilization %, and normalized workload scores (0 to 100)
                across every developer and engineering squad.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Random Forest Effort Prediction</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trained machine learning regressor predicts actual completion hours and risk confidence intervals based on complexity,
                priority, and skill proficiencies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">AI Redistribution Cockpit</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatic recommendations proposing task reassignments from overloaded developers to qualified available peers
                with 1-click managerial approvals.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Team Variance & Concentration</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tracks squad workload standard deviation, variance, and contributor concentration share to detect persistent
                overload patterns early.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Blocked Dependency Isolation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Separates blocked work and prerequisite bottlenecks from active immediate capacity calculations, preventing false
                availability assumptions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Multi-Role RBAC Governance</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strict backend-enforced roles for Admins, Project Managers, and Developers with dedicated cockpits for logging
                and workload tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 border-t border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Balance Your Engineering Squad?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Experience real-time workload calculation, machine learning effort estimation, and intelligent task redistribution.
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition active:scale-95 flex items-center gap-2"
            >
              Sign In to WorkSense AI <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">WorkSense AI</span> &bull; 
            <span>Developer Workload Imbalance Detector</span>
          </div>
          <div className="text-[11px] text-slate-600">
            PostgreSQL &bull; FastAPI &bull; React.js &bull; Scikit-Learn
          </div>
        </div>
      </footer>
    </div>
  );
};
