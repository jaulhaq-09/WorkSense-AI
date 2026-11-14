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
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import api from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { WorkloadBadge, TaskStatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDev, setSelectedDev] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, devsRes, historyRes] = await Promise.all([
        api.get('/workload/overview'),
        api.get('/workload/developers'),
        api.get('/workload/history?limit=30')
      ]);
      setData(overviewRes.data);
      setDevelopers(devsRes.data);
      setHistory(historyRes.data);
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
      <DashboardLayout title="Operational Dashboard">
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Calculating workload metrics...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { summary, analysis } = data;

  // Chart data formatting
  const devChartData = developers.map((d) => ({
    name: d.name.split(' ')[0],
    utilization: d.utilization_percentage,
    remaining_hours: d.weighted_remaining_effort,
    capacity: d.available_hours,
    status: d.workload_status
  }));

  const taskStatusData = [
    { name: 'In Progress', value: summary.in_progress_tasks || 0, color: '#3b82f6' },
    { name: 'Pending', value: summary.pending_tasks || 0, color: '#94a3b8' },
    { name: 'Blocked', value: summary.blocked_tasks || 0, color: '#ef4444' },
    { name: 'Completed', value: summary.completed_tasks || 0, color: '#10b981' },
  ].filter(item => item.value > 0);

  return (
    <DashboardLayout title="System Workload Dashboard" onRefresh={fetchDashboardData}>
      {/* Imbalance Alert Banner */}
      {analysis.imbalance_detected && (
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border-l-4 border-rose-500 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>Workload Imbalance Detected Across Engineering Team</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    Variance: {analysis.team_variance.toFixed(1)}%²
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-600 space-y-1">
                  {analysis.explanations.slice(0, 2).map((exp, idx) => (
                    <p key={idx}>• {exp}</p>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/recommendations')}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm ml-4"
            >
              <Sparkles className="w-3.5 h-3.5" />
              View Recommendations
            </button>
          </div>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Developers */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Developers</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 flex items-baseline justify-between">
            {summary.total_developers}
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active team capacity</div>
        </div>

        {/* Overloaded */}
        <div className="bg-white rounded-xl p-4 border border-rose-200 shadow-sm bg-rose-50/20">
          <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Overloaded</div>
          <div className="text-2xl font-bold text-rose-700 mt-1 flex items-baseline justify-between">
            {summary.overloaded_count}
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-[11px] text-rose-600 mt-1">&gt; 80% capacity utilization</div>
        </div>

        {/* Balanced */}
        <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm bg-emerald-50/20">
          <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Balanced</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 flex items-baseline justify-between">
            {summary.balanced_count}
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">40% - 80% optimal zone</div>
        </div>

        {/* Underutilized */}
        <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm bg-amber-50/20">
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Underutilized</div>
          <div className="text-2xl font-bold text-amber-700 mt-1 flex items-baseline justify-between">
            {summary.underutilized_count}
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-[11px] text-amber-600 mt-1">&lt; 40% capacity available</div>
        </div>

        {/* Average Utilization */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Utilization</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            {summary.average_utilization.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Std Dev: {summary.team_stdev.toFixed(1)}%</div>
        </div>

        {/* Active Projects & Tasks */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Tasks</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 flex items-baseline justify-between">
            {summary.total_tasks}
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{summary.active_projects} active projects</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Developer Workload Utilization Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Developer Capacity Utilization</h3>
              <p className="text-xs text-slate-500">Weighted remaining effort relative to 40h weekly capacity</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Overloaded (&gt;80%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Balanced</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> Underutilized (&lt;40%)</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={devChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val, name, item) => [`${val.toFixed(1)}%`, 'Utilization']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Bar dataKey="utilization" radius={[6, 6, 0, 0]}>
                  {devChartData.map((entry, index) => {
                    let fill = '#10b981';
                    if (entry.status === 'overloaded' || entry.status === 'high') fill = '#f43f5e';
                    else if (entry.status === 'underutilized') fill = '#f59e0b';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Distribution Donut Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Task Execution Status</h3>
            <p className="text-xs text-slate-500">Distribution of active and blocked sprint items</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} tasks`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Developer Workload Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Developer Workload Distribution Table</h3>
            <p className="text-xs text-slate-500">Granular calculation showing remaining effort, complexity weights, and utilization</p>
          </div>
          <button
            onClick={() => navigate('/analytics')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
          >
            Deep Analytics <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Developer</th>
                <th className="px-6 py-3">Team</th>
                <th className="px-6 py-3 text-center">Active Tasks</th>
                <th className="px-6 py-3 text-right">Weighted Effort</th>
                <th className="px-6 py-3 text-right">Available Capacity</th>
                <th className="px-6 py-3 text-right">Utilization %</th>
                <th className="px-6 py-3">Workload Status</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {developers.map((dev) => (
                <tr key={dev.developer_id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                        {dev.name.charAt(0)}
                      </div>
                      <div>
                        <div>{dev.name}</div>
                        <div className="text-[11px] text-slate-400 capitalize">{dev.experience_level} Engineer</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">{dev.team_name}</td>
                  <td className="px-6 py-4 text-center font-medium">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-bold">
                      {dev.total_active_tasks}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium text-slate-900">
                    {dev.weighted_remaining_effort.toFixed(1)} hrs
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-500">
                    {dev.available_hours.toFixed(1)} hrs
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-mono font-bold text-sm ${
                      dev.workload_status === 'overloaded' || dev.workload_status === 'high'
                        ? 'text-rose-600'
                        : dev.workload_status === 'underutilized'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}>
                      {dev.utilization_percentage.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <WorkloadBadge status={dev.workload_status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedDev(dev)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      Inspect
                    </button>
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
          title={`Workload Breakdown • ${selectedDev.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Top stats bar */}
            <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Capacity</div>
                <div className="text-base font-bold text-slate-800">{selectedDev.available_hours} hrs/wk</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Weighted Effort</div>
                <div className="text-base font-bold text-slate-800">{selectedDev.weighted_remaining_effort} hrs</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Utilization</div>
                <div className="text-base font-bold text-indigo-600">{selectedDev.utilization_percentage}%</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Workload Score</div>
                <div className="text-base font-bold text-slate-800">{selectedDev.workload_score} / 100</div>
              </div>
            </div>

            {/* Assigned Tasks breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                Active Assigned Tasks ({selectedDev.tasks.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedDev.tasks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">No active tasks assigned to this developer.</p>
                ) : (
                  selectedDev.tasks.map((t) => (
                    <div
                      key={t.task_id}
                      className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900">{t.task_name}</div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <TaskStatusBadge status={t.status} />
                          <span>Est: {t.estimated_hours}h</span>
                          <span>•</span>
                          <span>Logged: {t.actual_hours_logged}h</span>
                          <span>•</span>
                          <span className="font-medium text-slate-700">Rem: {t.remaining_hours}h</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">{t.weighted_effort} weighted hrs</div>
                        <div className="text-[10px] text-slate-400">{t.complexity} ({t.complexity_weight}x)</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedDev(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
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
