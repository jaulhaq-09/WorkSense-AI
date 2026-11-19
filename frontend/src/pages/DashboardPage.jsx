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
  Clock,
  ArrowRight,
  Activity,
  X
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
  const [alertDismissed, setAlertDismissed] = useState(false);
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
      <DashboardLayout title="Overview">
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-zinc-500">Calculating workload telemetry...</span>
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
      case 'underutilized': return '#38bdf8';
      default: return '#6366f1';
    }
  };

  return (
    <DashboardLayout title="Overview & Workload Telemetry" onRefresh={fetchDashboardData}>
      {/* Sleek Intelligence Notification Strip */}
      {analysis.imbalance_detected && !alertDismissed && (
        <div className="px-4 py-2.5 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 backdrop-blur-md flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
            <span className="font-semibold text-rose-200">Imbalance Alert:</span>
            <span className="text-zinc-300 truncate">{analysis.explanation}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/recommendations')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 font-semibold text-[11px] transition"
            >
              <span>Auto-Rebalance</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setAlertDismissed(true)}
              className="text-zinc-500 hover:text-zinc-300 p-0.5"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* KPI Ribbons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#111115] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
            <span>Team Capacity</span>
            <Users className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {summary.total_capacity_hours}
            <span className="text-xs text-zinc-400 font-sans font-normal ml-1">h/wk</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{summary.active_developers} active engineers</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111115] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
            <span>Weighted Workload</span>
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {summary.total_weighted_effort}
            <span className="text-xs text-zinc-400 font-sans font-normal ml-1">h eff</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>{summary.total_tasks} active tasks</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111115] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
            <span>Avg Utilization</span>
            <Activity className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            {summary.average_utilization_percentage}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Target: 70–80%</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111115] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
            <span>Variance Disparity</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${analysis.imbalance_detected ? 'text-rose-400' : 'text-emerald-400'}`} />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">
            ±{analysis.workload_variance || 0}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${analysis.imbalance_detected ? 'bg-rose-400' : 'bg-emerald-400'}`} />
            <span className={analysis.imbalance_detected ? 'text-rose-300 font-medium' : 'text-emerald-300'}>
              {analysis.imbalance_detected ? 'Overload present' : 'Balanced'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Capacity vs Workload Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#111115] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-white">Capacity Utilization (%)</h3>
              <p className="text-[11px] text-zinc-400">Target safe operating band: 40% – 80%</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;100%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> 40–80%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> &lt;40%
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 11 }} domain={[0, 140]} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-lg bg-[#141418] border border-white/[0.10] shadow-xl text-xs space-y-0.5">
                          <div className="font-semibold text-white">{d.fullName}</div>
                          <div className="text-zinc-300">Utilization: <span className="font-mono font-bold">{d.utilization}%</span></div>
                          <div className="text-zinc-400 text-[11px]">Workload: {d.remaining_hours}h / {d.capacity}h capacity</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={100} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.6} />
                <Bar dataKey="utilization" radius={[4, 4, 0, 0]} maxBarSize={45}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Pipeline Health */}
        <div className="p-5 rounded-xl bg-[#111115] border border-white/[0.06] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-white mb-0.5">Task Pipeline</h3>
            <p className="text-[11px] text-zinc-400 mb-4">Distribution by current execution state</p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> In Progress
                  </span>
                  <span className="font-mono text-zinc-300 text-xs">{summary.in_progress_tasks || 0}</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-1 rounded-full"
                    style={{ width: `${((summary.in_progress_tasks || 0) / (summary.total_tasks || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" /> Pending
                  </span>
                  <span className="font-mono text-zinc-400 text-xs">{summary.pending_tasks || 0}</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-zinc-600 h-1 rounded-full"
                    style={{ width: `${((summary.pending_tasks || 0) / (summary.total_tasks || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-rose-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Blocked
                  </span>
                  <span className="font-mono text-rose-300 text-xs">{summary.blocked_tasks || 0}</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-rose-500 h-1 rounded-full"
                    style={{ width: `${((summary.blocked_tasks || 0) / (summary.total_tasks || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Completed
                  </span>
                  <span className="font-mono text-emerald-300 text-xs">{summary.completed_tasks || 0}</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1 rounded-full"
                    style={{ width: `${((summary.completed_tasks || 0) / (summary.total_tasks || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] mt-4">
            <button
              onClick={() => navigate('/tasks')}
              className="w-full py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition border border-white/[0.06]"
            >
              <span>View Task Board</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Developer Roster Workload Table */}
      <div className="p-5 rounded-xl bg-[#111115] border border-white/[0.06]">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] mb-3">
          <div>
            <h3 className="text-xs font-semibold text-white">Engineering Roster & Capacity</h3>
            <p className="text-[11px] text-zinc-400">Live breakdown of individual cognitive load</p>
          </div>
          <button
            onClick={() => navigate('/developers')}
            className="text-xs text-zinc-400 hover:text-white font-medium flex items-center gap-1 transition"
          >
            Manage Skills <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-400 text-[11px] font-medium">
                <th className="py-2 px-2.5">Developer</th>
                <th className="py-2 px-2.5">Weekly Cap</th>
                <th className="py-2 px-2.5">Active Tickets</th>
                <th className="py-2 px-2.5">Weighted Effort</th>
                <th className="py-2 px-2.5">Utilization</th>
                <th className="py-2 px-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {developers.map((dev) => (
                <tr
                  key={dev.id}
                  onClick={() => setSelectedDev(dev)}
                  className="hover:bg-white/[0.02] transition cursor-pointer group"
                >
                  <td className="py-2.5 px-2.5">
                    <div className="font-medium text-zinc-200 group-hover:text-white transition">
                      {dev.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 capitalize">{dev.experience_level} Engineer</div>
                  </td>
                  <td className="py-2.5 px-2.5 font-mono text-zinc-400">{dev.available_hours}h</td>
                  <td className="py-2.5 px-2.5 font-mono text-zinc-400">{dev.total_active_tasks}</td>
                  <td className="py-2.5 px-2.5 font-mono text-zinc-400">{dev.weighted_remaining_effort}h</td>
                  <td className="py-2.5 px-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-zinc-900 rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-1 rounded-full ${
                            dev.utilization_percentage > 100
                              ? 'bg-rose-500'
                              : dev.utilization_percentage >= 80
                              ? 'bg-amber-500'
                              : dev.utilization_percentage >= 40
                              ? 'bg-emerald-500'
                              : 'bg-sky-400'
                          }`}
                          style={{ width: `${Math.min(100, dev.utilization_percentage)}%` }}
                        />
                      </div>
                      <span className="font-mono text-zinc-300 text-[11px]">{dev.utilization_percentage.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5">
                    <WorkloadBadge status={dev.workload_status} size="xs" />
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
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-[#141418] border border-white/[0.06]">
                <div className="text-[10px] text-zinc-500 uppercase font-medium">Capacity</div>
                <div className="text-sm font-semibold font-mono text-white mt-0.5">{selectedDev.available_hours}h / wk</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141418] border border-white/[0.06]">
                <div className="text-[10px] text-zinc-500 uppercase font-medium">Remaining Effort</div>
                <div className="text-sm font-semibold font-mono text-white mt-0.5">{selectedDev.weighted_remaining_effort}h</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141418] border border-white/[0.06]">
                <div className="text-[10px] text-zinc-500 uppercase font-medium">Utilization</div>
                <div className="text-sm font-semibold font-mono text-indigo-400 mt-0.5">{selectedDev.utilization_percentage.toFixed(0)}%</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#141418] border border-white/[0.06]">
                <div className="text-[10px] text-zinc-500 uppercase font-medium">Status</div>
                <div className="mt-0.5"><WorkloadBadge status={selectedDev.workload_status} size="xs" /></div>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-zinc-400 mb-2">Technical Skills & Proficiency</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedDev.skills && selectedDev.skills.length > 0 ? (
                  selectedDev.skills.map((sk) => (
                    <span
                      key={sk.skill_id}
                      className="px-2 py-0.5 rounded-md bg-[#141418] border border-white/[0.06] text-xs text-zinc-300 flex items-center gap-1.5"
                    >
                      <span>{sk.skill_name}</span>
                      <span className="text-[10px] text-indigo-400 font-mono">Lv.{sk.proficiency_level}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-zinc-500">No skills registered</span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedDev(null)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-white text-xs font-medium transition"
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
