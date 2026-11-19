import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Briefcase,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import api from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { WorkloadBadge, TaskStatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDev, setSelectedDev] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, devsRes] = await Promise.all([
        api.get('/workload/overview'),
        api.get('/workload/developers'),
      ]);
      setData(overviewRes.data);
      setDevelopers(devsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <DashboardLayout title="Workload Cockpit">
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Loading workload telemetry...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { summary, analysis } = data;

  const chartData = developers.map((d) => ({
    name: d.name.split(' ')[0],
    fullName: d.name,
    utilization: Math.round(d.utilization_percentage),
    remaining_hours: Math.round(d.weighted_remaining_effort),
    capacity: d.available_hours,
    status: d.workload_status
  }));

  const getBarColor = (status) => {
    switch (status) {
      case 'overloaded': return '#f43f5e';
      case 'high': return '#f59e0b';
      case 'balanced': return '#10b981';
      case 'underutilized': return '#06b6d4';
      default: return '#6366f1';
    }
  };

  return (
    <DashboardLayout title="Executive Workload Cockpit" onRefresh={fetchDashboardData}>
      {/* Actionable Overload Alert */}
      {analysis.imbalance_detected && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-rose-500/5 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Severe Workload Imbalance Detected</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {analysis.overloaded_developers?.length || 1} Overloaded
                </span>
              </div>
              <p className="text-xs text-rose-200/80 mt-1 max-w-2xl leading-relaxed">
                {analysis.explanation || 'Significant variance detected across developer capacities. Key engineers are overloaded while others have idle bandwidth.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/recommendations')}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rebalance Workload</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Ribbons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-dark-900/80 border border-slate-800/80 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Team Capacity</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {summary.total_capacity_hours}
            <span className="text-xs text-slate-400 font-sans font-normal ml-1">h/wk</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{summary.active_developers} active engineers</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-dark-900/80 border border-slate-800/80 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Active Workload</span>
            <Layers className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {summary.total_weighted_effort}
            <span className="text-xs text-slate-400 font-sans font-normal ml-1">h eff</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>{summary.total_tasks} active tasks</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-dark-900/80 border border-slate-800/80 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Team Utilization</span>
            <Briefcase className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {summary.average_utilization_percentage}%
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Target benchmark: 70–80%</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-dark-900/80 border border-slate-800/80 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Load Imbalance</span>
            <AlertTriangle className={`w-4 h-4 ${analysis.imbalance_detected ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            ±{analysis.workload_variance || 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${analysis.imbalance_detected ? 'bg-rose-400' : 'bg-emerald-400'}`} />
            <span className={analysis.imbalance_detected ? 'text-rose-300 font-semibold' : 'text-emerald-300'}>
              {analysis.imbalance_detected ? 'High disparity' : 'Healthy balance'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Workload Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Capacity vs Workload Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-dark-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Developer Capacity Utilization (%)</h3>
              <p className="text-xs text-slate-400">Threshold: Red &gt;100% (Overload), Green 40–80% (Balanced)</p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Overload
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Balanced
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> Idle
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 140]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-dark-950 border border-slate-700 shadow-xl text-xs space-y-1">
                          <div className="font-bold text-white">{d.fullName}</div>
                          <div className="text-slate-300">Utilization: <span className="font-bold font-mono">{d.utilization}%</span></div>
                          <div className="text-slate-400">Effort: <span className="font-mono">{d.remaining_hours}h</span> / {d.capacity}h cap</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={100} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: '100% Overload Cap', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
                <Bar dataKey="utilization" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Health Breakdown */}
        <div className="p-5 rounded-2xl bg-dark-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight mb-1">Task Pipeline Status</h3>
            <p className="text-xs text-slate-400 mb-4">Real-time status of all scheduled work</p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" /> In Progress
                  </span>
                  <span className="font-mono text-slate-200">{summary.in_progress_tasks || 0} tasks</span>
                </div>
                <div className="w-full bg-dark-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full"
                    style={{ width: `${((summary.in_progress_tasks || 0) / (summary.total_tasks || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" /> Pending
                  </span>
                  <span className="font-mono text-slate-200">{summary.pending_tasks || 0} tasks</span>
                </div>
                <div className="w-full bg-dark-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-slate-500 h-1.5 rounded-full"
                    style={{ width: `${((summary.pending_tasks || 0) / (summary.total_tasks || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-rose-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Blocked (At Risk)
                  </span>
                  <span className="font-mono text-rose-300">{summary.blocked_tasks || 0} tasks</span>
                </div>
                <div className="w-full bg-dark-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-1.5 rounded-full"
                    style={{ width: `${((summary.blocked_tasks || 0) / (summary.total_tasks || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Completed
                  </span>
                  <span className="font-mono text-slate-200">{summary.completed_tasks || 0} tasks</span>
                </div>
                <div className="w-full bg-dark-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${((summary.completed_tasks || 0) / (summary.total_tasks || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => navigate('/tasks')}
              className="w-full py-2 px-3 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <span>Manage Task Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Developer Roster Workload Table */}
      <div className="p-5 rounded-2xl bg-dark-900/80 border border-slate-800/80 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Active Engineering Roster</h3>
            <p className="text-xs text-slate-400">Live breakdown of assigned cognitive loads</p>
          </div>
          <button
            onClick={() => navigate('/developers')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition"
          >
            Manage Capacities <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Developer</th>
                <th className="py-2.5 px-3">Weekly Cap</th>
                <th className="py-2.5 px-3">Active Tickets</th>
                <th className="py-2.5 px-3">Weighted Effort</th>
                <th className="py-2.5 px-3">Utilization</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {developers.map((dev) => (
                <tr
                  key={dev.id}
                  onClick={() => setSelectedDev(dev)}
                  className="hover:bg-dark-850/60 transition cursor-pointer group"
                >
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition">
                      {dev.name}
                    </div>
                    <div className="text-[11px] text-slate-500 capitalize">{dev.experience_level} Engineer</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">{dev.available_hours}h</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{dev.total_active_tasks}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{dev.weighted_remaining_effort}h</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-dark-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            dev.utilization_percentage > 100
                              ? 'bg-rose-500'
                              : dev.utilization_percentage >= 80
                              ? 'bg-amber-500'
                              : dev.utilization_percentage >= 40
                              ? 'bg-emerald-500'
                              : 'bg-cyan-500'
                          }`}
                          style={{ width: `${Math.min(100, dev.utilization_percentage)}%` }}
                        />
                      </div>
                      <span className="font-mono text-slate-300">{dev.utilization_percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <WorkloadBadge status={dev.workload_status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-indigo-400 group-hover:text-indigo-300 font-semibold text-[11px] inline-flex items-center gap-1">
                      Inspect <ChevronRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Developer Detail Modal */}
      {selectedDev && (
        <Modal
          isOpen={!!selectedDev}
          onClose={() => setSelectedDev(null)}
          title={`Workload Profile: ${selectedDev.name}`}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-dark-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Capacity</div>
                <div className="text-lg font-bold font-mono text-white mt-1">{selectedDev.available_hours}h / wk</div>
              </div>
              <div className="p-3 rounded-xl bg-dark-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Remaining Effort</div>
                <div className="text-lg font-bold font-mono text-white mt-1">{selectedDev.weighted_remaining_effort}h</div>
              </div>
              <div className="p-3 rounded-xl bg-dark-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Utilization</div>
                <div className="text-lg font-bold font-mono text-indigo-400 mt-1">{selectedDev.utilization_percentage.toFixed(1)}%</div>
              </div>
              <div className="p-3 rounded-xl bg-dark-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Status</div>
                <div className="mt-1"><WorkloadBadge status={selectedDev.workload_status} /></div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Technical Skills & Proficiency</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDev.skills && selectedDev.skills.length > 0 ? (
                  selectedDev.skills.map((sk) => (
                    <span
                      key={sk.skill_id}
                      className="px-2.5 py-1 rounded-lg bg-dark-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
                    >
                      <span className="font-semibold">{sk.skill_name}</span>
                      <span className="text-[10px] text-indigo-400 font-mono">Lv.{sk.proficiency_level}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No skills registered</span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedDev(null)}
                className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 text-white text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};
