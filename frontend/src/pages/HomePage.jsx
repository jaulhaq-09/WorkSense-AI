import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Scale,
  BrainCircuit,
  Lock,
  GitPullRequest,
  Sliders,
  Activity,
  Layers,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LogoMark } from '../components/Sidebar';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState('manager');

  // Interactive cockpit demo slider in hero
  const [demoAlexTasks, setDemoAlexTasks] = useState(3);
  const alexLoad = Math.min(140, Math.round(demoAlexTasks * 37.5));
  const danaLoad = Math.max(20, Math.round(100 - (demoAlexTasks * 20)));

  return (
    <div className="min-h-screen bg-[#09090b] text-[#ededed] font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Subtle top ambient radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-indigo-500/[0.07] via-violet-500/[0.03] to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#09090b]/80 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <LogoMark />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">WorkSense</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                AI
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#engine" className="hover:text-white transition">Intelligence Engine</a>
            <a href="#roles" className="hover:text-white transition">Role Experience</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(user?.role === 'developer' ? '/personal' : '/dashboard')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm active:scale-95"
              >
                Go to Workspace <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold transition border border-white/[0.08]"
                >
                  Launch Demo <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>AI-Driven Engineering Workload Telemetry</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-5">
            Stop counting tickets. <br />
            Measure <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-zinc-400">real cognitive effort</span>.
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed mb-8">
            Traditional issue trackers mislead managers by treating all tasks equally. WorkSense AI calculates actual effort load, spots chronic burnout, and recommends precision task redistribution.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-600/25 transition active:scale-95"
            >
              Explore Live Cockpit <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <a
              href="#engine"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white font-medium text-xs border border-white/[0.08] transition"
            >
              See the Math
            </a>
          </div>

          {/* Interactive Live Browser Mockup */}
          <div className="mt-14 rounded-2xl bg-[#111115] border border-white/[0.08] shadow-2xl overflow-hidden text-left backdrop-blur-xl">
            {/* Window Chrome Header */}
            <div className="h-10 bg-[#0c0c10] border-b border-white/[0.06] px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="ml-2 text-[11px] font-mono text-zinc-500">worksense-cockpit // core-team-telemetry</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Intelligence Feed</span>
              </div>
            </div>

            {/* Interactive Mockup Body */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-5 border-b border-white/[0.06] gap-3">
                <div>
                  <div className="text-xs font-semibold text-white">Interactive Load Simulator</div>
                  <div className="text-[11px] text-zinc-400">Drag tasks to watch the intelligence engine recalculate in real-time</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400">Tasks assigned to Alex:</span>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={demoAlexTasks}
                    onChange={(e) => setDemoAlexTasks(parseInt(e.target.value))}
                    className="w-24 accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-zinc-800">
                    {demoAlexTasks}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Alex Rivera (Lead) */}
                <div className={`p-4 rounded-xl border transition-colors ${
                  alexLoad > 100
                    ? 'bg-rose-500/[0.04] border-rose-500/25'
                    : 'bg-white/[0.02] border-white/[0.06]'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-[10px] text-white">
                        AR
                      </div>
                      <span className="text-xs font-semibold text-zinc-200">Alex Rivera (Lead Architect)</span>
                    </div>
                    <span className={`text-xs font-mono font-bold ${alexLoad > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {alexLoad}% Capacity
                    </span>
                  </div>

                  <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden mb-2">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        alexLoad > 100 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, alexLoad)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>{demoAlexTasks} Critical Backend Deliverables</span>
                    <span className={alexLoad > 100 ? 'text-rose-400 font-medium' : 'text-zinc-400'}>
                      {alexLoad > 100 ? 'Overload Threshold Exceeded' : 'Balanced Load'}
                    </span>
                  </div>
                </div>

                {/* Dana White (Available) */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-[10px] text-white">
                        DW
                      </div>
                      <span className="text-xs font-semibold text-zinc-200">Dana White (DB Specialist)</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-sky-400">
                      {danaLoad}% Capacity
                    </span>
                  </div>

                  <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden mb-2">
                    <div
                      className="bg-sky-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${danaLoad}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>1 Active Deliverable</span>
                    <span className="text-sky-400 font-medium">Available Bandwidth</span>
                  </div>
                </div>
              </div>

              {alexLoad > 100 && (
                <div className="mt-4 p-3 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/20 flex items-center justify-between text-xs text-zinc-300 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>
                      AI Recommendation: Reassign Task #104 to Dana White (<strong className="text-white">95% Skill Match</strong>, load reduces to 82%).
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    className="shrink-0 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                  >
                    Open Cockpit <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Core Capabilities */}
      <section id="engine" className="py-20 border-t border-white/[0.06] bg-[#0c0c10]/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2.5">
              The Workload Intelligence Architecture
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              A hybrid deterministic engine and supervised machine learning model.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bento Card 1: Math */}
            <div className="p-5 rounded-2xl bg-[#111115] border border-white/[0.06] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3.5">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">Remaining Effort Weighting</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Subtracts logged time from estimates and applies dynamic multipliers (Easy 1.0x, Medium 1.2x, Hard 1.5x, Critical 2.0x).
                </p>
              </div>
              <div className="mt-4 p-2.5 rounded-lg bg-zinc-900/80 font-mono text-[11px] text-indigo-300 border border-white/[0.04]">
                Effort = (Est - Logged) × Weight
              </div>
            </div>

            {/* Bento Card 2: ML Regressor */}
            <div className="p-5 rounded-2xl bg-[#111115] border border-white/[0.06] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3.5">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">Random Forest Regressor</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Predicts actual task completion hours based on ticket priority, complexity, and historical team velocity.
                </p>
              </div>
              <div className="mt-4 p-2.5 rounded-lg bg-zinc-900/80 font-mono text-[11px] text-violet-300 border border-white/[0.04]">
                RandomForestRegressor(n=100)
              </div>
            </div>

            {/* Bento Card 3: AI Redistribution */}
            <div className="p-5 rounded-2xl bg-[#111115] border border-white/[0.06] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">Redistribution Optimizer</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Matches tasks from overloaded engineers with teammates who possess matching technical skill proficiencies.
                </p>
              </div>
              <div className="mt-4 p-2.5 rounded-lg bg-zinc-900/80 font-mono text-[11px] text-emerald-300 border border-white/[0.04]">
                Score = Match% × AvailBandwidth
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Workflows: Clean Tabs */}
      <section id="roles" className="py-20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2.5">
              Designed for Every Engineering Role
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Role-based authorization guarantees focused experiences for each persona.
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-xl bg-[#111115] p-1 border border-white/[0.08]">
              <button
                onClick={() => setActiveRoleTab('manager')}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeRoleTab === 'manager'
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Project Managers
              </button>
              <button
                onClick={() => setActiveRoleTab('developer')}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeRoleTab === 'developer'
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Developers
              </button>
              <button
                onClick={() => setActiveRoleTab('admin')}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeRoleTab === 'admin'
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Administrators
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111115] border border-white/[0.06] text-left">
            {activeRoleTab === 'manager' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-emerald-400">Project Manager Cockpit</div>
                <h3 className="text-base font-bold text-white">Full Team Telemetry & One-Click Rebalancing</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Project managers get instant alerts when any developer crosses 100% capacity utilization. Review skill-matched rebalancing suggestions, compare before/after workload distributions, and approve task transfers with a single click.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">✓ Team Imbalance Variance Score</div>
                  <div className="flex items-center gap-2">✓ 1-Click Task Transfer Approval</div>
                  <div className="flex items-center gap-2">✓ Live Random Forest Effort Prediction</div>
                  <div className="flex items-center gap-2">✓ Weekly Capacity Adjustments</div>
                </div>
              </div>
            )}

            {activeRoleTab === 'developer' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-sky-400">Developer Personal Workspace</div>
                <h3 className="text-base font-bold text-white">High-Focus Deliverables & Quick Hours Logging</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Developers see their personal cognitive load gauge, remaining hours, and active assignments without distracting administrative clutter. Log actual working hours in seconds to keep capacity metrics synchronized.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">✓ Real-time Personal Utilization Meter</div>
                  <div className="flex items-center gap-2">✓ Quick Time Logging (Effort auto-decrements)</div>
                  <div className="flex items-center gap-2">✓ 1-Click Deliverable Status Toggle</div>
                  <div className="flex items-center gap-2">✓ Technical Skills & Availability Profile</div>
                </div>
              </div>
            )}

            {activeRoleTab === 'admin' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-purple-400">Administrator Governance</div>
                <h3 className="text-base font-bold text-white">System-Wide Teams, Users & Skill Matrices</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Admins govern user accounts, create engineering squads, configure skills with 1–5 proficiency scales, and retrain machine learning models directly on live PostgreSQL production records.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">✓ User Provisioning & Role Assignments</div>
                  <div className="flex items-center gap-2">✓ Enterprise Skill Matrix Definition</div>
                  <div className="flex items-center gap-2">✓ Live Database ML Retraining Trigger</div>
                  <div className="flex items-center gap-2">✓ Isolation Forest Anomaly Telemetry</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-white/[0.06] text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Experience Intelligent Workload Balancing
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mb-6">
            Ready to test WorkSense AI with real PostgreSQL data?
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-600/25 transition active:scale-95"
          >
            Launch Platform Cockpit <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-white/[0.06] text-center text-xs text-zinc-600">
        WorkSense AI • Production Stack • PostgreSQL 16 • FastAPI • React 18
      </footer>
    </div>
  );
};
