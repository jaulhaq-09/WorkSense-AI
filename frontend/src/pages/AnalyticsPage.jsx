import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  Layers,
  ShieldCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts';
import api from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { WorkloadBadge, TaskStatusBadge } from '../components/StatusBadge';

export const AnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [history, setHistory] = useState([]);
  const [blockedTasks, setBlockedTasks] = useState([]);
  const [anomalyResult, setAnomalyResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewRes, devsRes, historyRes, tasksRes] = await Promise.all([
        api.get('/workload/overview'),
        api.get('/workload/developers'),
        api.get('/workload/history?limit=30'),
        api.get('/tasks?status_filter=blocked')
      ]);
      setOverview(overviewRes.data);
      setDevelopers(devsRes.data);
      setHistory(historyRes.data);
      setBlockedTasks(tasksRes.data);

      // Check ML anomaly for the highest utilized developer
      if (devsRes.data.length > 0) {
        const topDev = [...devsRes.data].sort((a, b) => b.utilization_percentage - a.utilization_percentage)[0];
        const anomalyRes = await api.post('/ml/detect-anomaly', {
          utilization_percentage: topDev.utilization_percentage,
          weighted_remaining_effort: topDev.weighted_remaining_effort,
          active_tasks_count: topDev.total_active_tasks
        });
        setAnomalyResult({ ...anomalyRes.data, dev_name: topDev.name });
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !overview) {
    return (
      <DashboardLayout title="Workload Analytics Engine">
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Aggregating telemetry & running variance models...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { analysis, summary } = overview;

  // Format historical trend lines by developer
  const historyDates = [...new Set(history.map((h) => h.calculated_at.slice(5, 10)))];
  const trendData = historyDates.map((dateStr) => {
    const item = { date: dateStr };
    history
      .filter((h) => h.calculated_at.slice(5, 10) === dateStr)
      .forEach((h) => {
        const devShort = h.developer_name.split(' ')[0];
        item[devShort] = h.utilization_percentage;
      });
    return item;
  });

  return (
    <DashboardLayout title="Workload Intelligence Analytics" onRefresh={fetchData}>
      {/* Distinction Card: Capacity Utilization vs Normalized Workload Score */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              Understanding Workload Metrics: Capacity Utilization vs. Normalized Score
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Capacity Utilization (%):</strong> Represents the exact ratio of active weighted remaining effort
              relative to configured weekly capacity (e.g. 37.0h remaining / 40.0h capacity = <strong>92.5%</strong>).
              Values above 100% indicate an overloaded developer whose commitments exceed weekly hours.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Normalized Workload Score (0 - 100):</strong> A standardized score bounded between 0 and 100 for
              cross-team benchmarking and comparative dashboard ranking, capped at maximum nominal saturation.
            </p>
          </div>
        </div>
      </div>

      {/* Variance & Concentration Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Team Workload Variance</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {analysis.team_variance.toFixed(1)} <span className="text-sm font-normal text-slate-400">%²</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Dispersion across engineering squad</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Standard Deviation</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 mt-1">
            &plusmn;{analysis.team_stdev.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Spread around team mean ({analysis.average_utilization.toFixed(1)}%)</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Workload Concentration</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {analysis.concentration?.top_contributor_share_pct || 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            Held by {analysis.concentration?.top_contributor_name || 'N/A'}
          </div>
        </div>

        {/* Machine Learning Anomaly Detection Callout */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm bg-gradient-to-br from-white to-indigo-50/40">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-indigo-700">
            <span>ML Anomaly Check</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            {anomalyResult?.is_anomaly ? (
              <span className="text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Outlier Pattern
              </span>
            ) : (
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Normal Pattern
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            Isolation Forest model on {anomalyResult?.dev_name || 'Squad'}
          </div>
        </div>
      </div>

      {/* Historical Trend Lines & Developer Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Workload Trends Line Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Historical Workload Trends</h3>
            <p className="text-xs text-slate-500">5-day utilization telemetry trajectory per developer</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val, name) => [`${val.toFixed(1)}%`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Alex" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Blake" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Casey" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Individual Developer Capacity vs Weighted Effort Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Remaining Effort vs Available Capacity</h3>
            <p className="text-xs text-slate-500">Comparison of weighted hours remaining against 40h standard capacity</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={developers.map((d) => ({
                  name: d.name.split(' ')[0],
                  'Weighted Effort': d.weighted_remaining_effort,
                  'Available Capacity': d.available_hours,
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis unit="h" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val, name) => [`${val} hrs`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Weighted Effort" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Available Capacity" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Blocked Tasks & Dependency Bottlenecks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Blocked Tasks & Dependency Bottlenecks
            </h3>
            <p className="text-xs text-slate-500">
              Tasks isolated from active redistribution until prerequisite dependencies are unblocked
            </p>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
            {blockedTasks.length} Blocked Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Blocked Task</th>
                <th className="px-6 py-3">Project</th>
                <th className="px-6 py-3">Assigned Developer</th>
                <th className="px-6 py-3">Blocked Reason / Dependency</th>
                <th className="px-6 py-3 text-right">Blocked Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blockedTasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-6 text-center text-xs text-slate-400">
                    No blocked tasks currently recorded. All pipeline workflows flowing smoothly.
                  </td>
                </tr>
              ) : (
                blockedTasks.map((bt) => (
                  <tr key={bt.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{bt.task_name}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">{bt.project_name}</td>
                    <td className="px-6 py-4 text-xs">
                      {bt.assigned_developers.map((d) => d.name).join(', ') || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-xs text-rose-600 font-medium">
                      {bt.dependencies.length > 0
                        ? `Waiting on: ${bt.dependencies.map((d) => d.task_name).join(', ')}`
                        : 'Blocked on external DevOps / security approval'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                      {bt.estimated_hours} hrs
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
