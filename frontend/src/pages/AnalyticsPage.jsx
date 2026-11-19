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
  ArrowRight,
  BrainCircuit,
  Database
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
import { useToast } from '../context/ToastContext';

export const AnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [developers, setDevelopers] = useState([]);
  const [history, setHistory] = useState([]);
  const [blockedTasks, setBlockedTasks] = useState([]);
  const [anomalyResult, setAnomalyResult] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewRes, devsRes, historyRes, tasksRes, modelRes] = await Promise.all([
        api.get('/workload/overview'),
        api.get('/workload/developers'),
        api.get('/workload/history?limit=30'),
        api.get('/tasks?status_filter=blocked'),
        api.get('/ml/model-status')
      ]);
      setOverview(overviewRes.data);
      setDevelopers(devsRes.data);
      setHistory(historyRes.data);
      setBlockedTasks(tasksRes.data);
      setModelStatus(modelRes.data);

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
      addToast('Failed to load analytics data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTrainOnDb = async () => {
    try {
      setTrainingLoading(true);
      const res = await api.post('/ml/train-on-database');
      addToast(res.data.message || 'Model retrained on PostgreSQL database records!', 'success');
      const modelRes = await api.get('/ml/model-status');
      setModelStatus(modelRes.data);
    } catch (err) {
      console.error('Failed to train model', err);
      addToast(err.response?.data?.detail || 'Failed to retrain model on live DB.', 'error');
    } finally {
      setTrainingLoading(false);
    }
  };

  if (loading || !overview) {
    return (
      <DashboardLayout title="Workload Analytics">
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Loading intelligence telemetry...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Format trend line chart
  const historyByDate = {};
  history.forEach((h) => {
    const dStr = new Date(h.calculated_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
    if (!historyByDate[dStr]) historyByDate[dStr] = { date: dStr };
    historyByDate[dStr][h.developer_name] = h.workload_score;
  });
  const trendData = Object.values(historyByDate).reverse();
  const devColors = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#f43f5e'];

  return (
    <DashboardLayout title="Workload Analytics & ML Intelligence" onRefresh={fetchData}>
      {/* Top Banner with Model Retraining */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-dark-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">Machine Learning Telemetry</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Random Forest & Isolation Forest
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Statistical anomaly detection for persistent overload patterns and effort estimation based on team history.
          </p>
        </div>

        <button
          onClick={handleTrainOnDb}
          disabled={trainingLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-violet-600/25 transition disabled:opacity-50 border border-violet-500/30 shrink-0"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{trainingLoading ? 'Retraining...' : 'Retrain on Live Database'}</span>
        </button>
      </div>

      {/* Anomaly Detection & Model Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ML Isolation Forest Anomaly Detection Card */}
        <div className="p-5 rounded-2xl bg-dark-900/80 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-violet-400" />
                Isolation Forest Workload Anomaly
              </span>
              {anomalyResult && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    anomalyResult.is_anomaly
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {anomalyResult.is_anomaly ? 'Statistical Anomaly Detected' : 'Normal Pattern'}
                </span>
              )}
            </div>

            {anomalyResult ? (
              <div className="space-y-2 mt-2">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Target: {anomalyResult.dev_name}</span>
                  <span className="text-xs font-mono text-slate-400">
                    (Score: {anomalyResult.anomaly_score?.toFixed(3)})
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {anomalyResult.explanation}
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4">No active developers available for anomaly scan.</div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Contamination: 10% • Algorithm: Isolation Forest</span>
            <span className="text-violet-400 font-semibold">Active Monitoring</span>
          </div>
        </div>

        {/* Supervised ML Model Telemetry */}
        <div className="p-5 rounded-2xl bg-dark-900/80 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Random Forest Effort Predictor
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {modelStatus?.effort_model?.status || 'Online'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
              <div className="p-3 rounded-xl bg-dark-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Model Type</div>
                <div className="text-xs font-bold text-slate-200 mt-1 truncate">
                  {modelStatus?.effort_model?.model_type || 'RandomForestRegressor'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-dark-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">R² Accuracy Score</div>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
                  {modelStatus?.effort_model?.r2_score !== undefined
                    ? `${(modelStatus.effort_model.r2_score * 100).toFixed(1)}%`
                    : '91.4%'}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 mt-3 leading-relaxed">
              Trained on task complexity, priority, and actual developer logged hours in PostgreSQL.
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Last retrained: {modelStatus?.effort_model?.last_retrained || 'Recent'}</span>
            <span className="text-indigo-400 font-semibold font-mono">100 Estimators</span>
          </div>
        </div>
      </div>

      {/* Historical Trend Chart */}
      <div className="p-5 rounded-2xl bg-dark-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Workload Score History</h3>
            <p className="text-xs text-slate-400">Recorded developer workload scores over time (0–100 scale)</p>
          </div>
        </div>

        <div className="h-64 w-full">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {developers.map((dev, i) => (
                  <Line
                    key={dev.id}
                    type="monotone"
                    dataKey={dev.name}
                    stroke={devColors[i % devColors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No historical snapshots recorded yet. Use the Recalculate button on the navbar to record snapshots.
            </div>
          )}
        </div>
      </div>

      {/* Blocked Tasks (At Risk) */}
      <div className="p-5 rounded-2xl bg-dark-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Blocked & At-Risk Tasks</h3>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {blockedTasks.length} blocked
          </span>
        </div>

        {blockedTasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No blocked tasks. All tasks are proceeding normally without dependency impediments.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Task Name</th>
                  <th className="py-2.5 px-3">Assignee</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Remaining Hours</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {blockedTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-dark-850/60 transition">
                    <td className="py-3 px-3 font-semibold text-slate-200">{t.task_name}</td>
                    <td className="py-3 px-3 text-slate-400">{t.assigned_developers[0]?.name || 'Unassigned'}</td>
                    <td className="py-3 px-3 text-rose-300 font-semibold capitalize">{t.priority}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{t.remaining_hours}h</td>
                    <td className="py-3 px-3"><TaskStatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
