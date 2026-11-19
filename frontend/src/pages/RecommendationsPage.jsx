import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingDown,
  Award,
  Layers,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import api from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const { role } = useAuth();
  const { addToast } = useToast();
  const canApprove = role === 'admin' || role === 'project_manager';

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recommendations');
      setRecommendations(res.data);
    } catch (err) {
      console.error('Failed to load recommendations', err);
      addToast('Failed to load redistribution recommendations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await api.post('/recommendations/generate');
      addToast(res.data.message || 'Scanned team capacity and generated new redistribution plans.', 'success');
      fetchRecommendations();
    } catch (err) {
      console.error('Failed to generate recommendations', err);
      addToast('Error generating redistribution plans.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoadingId(id);
      await api.post(`/recommendations/${id}/approve`);
      addToast('Task redistribution approved! Reassigned and recalculated.', 'success');
      fetchRecommendations();
    } catch (err) {
      console.error('Failed to approve recommendation', err);
      addToast(err.response?.data?.detail || 'Error approving transfer.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoadingId(id);
      await api.post(`/recommendations/${id}/reject`);
      addToast('Recommendation rejected. Assignment remains unchanged.', 'warning');
      fetchRecommendations();
    } catch (err) {
      console.error('Failed to reject recommendation', err);
      addToast(err.response?.data?.detail || 'Error rejecting transfer.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  return (
    <DashboardLayout title="AI Task Redistribution Cockpit" onRefresh={fetchRecommendations}>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-dark-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">Workload Rebalancing Engine</h2>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              OPTIMIZER
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Detects overloaded engineers and pairs tasks with teammates possessing matching skills and available hours.
          </p>
        </div>

        {canApprove && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 border border-indigo-500/30"
          >
            <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Scanning Capacity...' : 'Scan & Rebalance Workload'}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {['all', 'pending', 'applied', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
              filterStatus === tab
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            {tab}
            <span className="ml-1.5 text-[10px] opacity-75 font-mono">
              ({recommendations.filter((r) => tab === 'all' || r.status === tab).length})
            </span>
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Evaluating team distribution...</span>
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-dark-900/40 border border-slate-800">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">Team Workload is Well Balanced</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            No critical overload or severe imbalance detected. If you add heavy tasks or team bandwidth shifts, click Scan & Rebalance.
          </p>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Run Fresh Imbalance Scan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRecs.map((rec) => {
            const isPending = rec.status === 'pending';
            const isApplied = rec.status === 'applied';
            const isRejected = rec.status === 'rejected';

            return (
              <div
                key={rec.id}
                className={`p-5 rounded-2xl bg-dark-900/80 border transition-all duration-200 backdrop-blur-md shadow-xl ${
                  isPending
                    ? 'border-indigo-500/30 hover:border-indigo-500/60'
                    : isApplied
                    ? 'border-emerald-500/30 opacity-85'
                    : 'border-slate-800 opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: Reassignment Graphic */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-white">{rec.task_name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-dark-950 text-slate-400 border border-slate-800">
                        Task #{rec.task_id}
                      </span>
                      {isApplied && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Applied
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          Rejected
                        </span>
                      )}
                    </div>

                    {/* From -> To Transfer Route */}
                    <div className="flex items-center gap-3 my-3">
                      {/* From Dev */}
                      <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <div>
                          <div className="font-semibold text-rose-200">{rec.from_developer_name}</div>
                          <div className="text-[10px] text-rose-300/70 font-mono">Overloaded</div>
                        </div>
                      </div>

                      <div className="flex items-center text-slate-500 px-1">
                        <ArrowRight className="w-4 h-4 text-indigo-400" />
                      </div>

                      {/* To Dev */}
                      <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-cyan-200">{rec.suggested_developer_name}</div>
                          <div className="text-[10px] text-cyan-300/70 font-mono">Available Capacity</div>
                        </div>
                      </div>

                      {/* Skill Match Badge */}
                      {rec.skill_match_percentage && (
                        <div className="hidden sm:flex items-center gap-1.5 p-2 px-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
                          <Award className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{rec.skill_match_percentage}% Skill Match</span>
                        </div>
                      )}
                    </div>

                    {/* AI Reasoning */}
                    <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                      {rec.recommendation_reason}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  {isPending && canApprove && (
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                      <button
                        type="button"
                        disabled={actionLoadingId === rec.id}
                        onClick={() => handleReject(rec.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-dark-800 border border-slate-700/80 transition"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId === rec.id}
                        onClick={() => handleApprove(rec.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition active:scale-95 border border-emerald-500/30"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Transfer</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};
