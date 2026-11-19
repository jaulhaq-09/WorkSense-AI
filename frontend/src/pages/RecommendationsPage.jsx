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
  Check,
  ArrowDownRight,
  ArrowUpRight
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
      addToast('Task reassigned! Workloads updated across the team.', 'success');
      fetchRecommendations();
    } catch (err) {
      console.error('Failed to approve recommendation', err);
      addToast(err.response?.data?.detail || 'Error approving transfer.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApproveAll = async () => {
    const pending = recommendations.filter((r) => r.status === 'pending');
    if (pending.length === 0) return;
    try {
      setActionLoadingId('all');
      for (const rec of pending) {
        await api.post(`/recommendations/${rec.id}/approve`);
      }
      addToast(`Approved and applied all ${pending.length} task rebalancing plans!`, 'success');
      fetchRecommendations();
    } catch (err) {
      console.error('Failed to batch approve', err);
      addToast('Error applying some rebalancing plans.', 'error');
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

  const pendingCount = recommendations.filter((r) => r.status === 'pending').length;

  return (
    <DashboardLayout title="AI Task Redistribution" onRefresh={fetchRecommendations}>
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-[#111115] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Workload Redistribution Engine</h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              Automated Rebalance
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Detects overloaded engineers and pairs tasks with teammates possessing matching skills and available hours.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canApprove && pendingCount > 1 && (
            <button
              onClick={handleApproveAll}
              disabled={actionLoadingId === 'all'}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-sm disabled:opacity-50"
            >
              {actionLoadingId === 'all' ? 'Applying...' : `Approve All (${pendingCount})`}
            </button>
          )}

          {canApprove && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-sm disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Scanning Team...' : 'Scan & Rebalance'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] pb-2">
        {['all', 'pending', 'applied', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition ${
              filterStatus === tab
                ? 'bg-white/[0.08] text-white font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {tab}
            <span className="ml-1.5 text-[10px] text-zinc-500 font-mono">
              ({recommendations.filter((r) => tab === 'all' || r.status === tab).length})
            </span>
          </button>
        ))}
      </div>

      {/* Recommendations Cards */}
      {loading ? (
        <div className="py-16 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Evaluating team distribution...</span>
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="p-10 text-center rounded-xl bg-[#111115] border border-white/[0.06]">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-xs font-semibold text-white mb-1">Team Workload is Well Balanced</h3>
          <p className="text-[11px] text-zinc-400 max-w-sm mx-auto mb-4">
            No critical overload or severe disparity detected. If you add heavy tasks or team bandwidth shifts, run a fresh scan.
          </p>
          <button
            onClick={handleGenerate}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 text-xs font-medium border border-white/[0.08] transition"
          >
            Run Imbalance Scan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredRecs.map((rec) => {
            const isPending = rec.status === 'pending';
            const isApplied = rec.status === 'applied';
            const isRejected = rec.status === 'rejected';

            return (
              <div
                key={rec.id}
                className={`p-4 rounded-xl bg-[#111115] border transition ${
                  isPending
                    ? 'border-indigo-500/30'
                    : isApplied
                    ? 'border-emerald-500/25 opacity-85'
                    : 'border-white/[0.06] opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: Reassignment Graphic */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-white">{rec.task_name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/[0.06]">
                        #{rec.task_id}
                      </span>
                      {isApplied && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/[0.08] text-emerald-300 border border-emerald-500/25">
                          Applied
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Rejected
                        </span>
                      )}
                    </div>

                    {/* From -> To Transfer Route with Impact Preview */}
                    <div className="flex flex-wrap items-center gap-3 my-2.5">
                      {/* From Dev */}
                      <div className="flex items-center gap-2 p-2 px-2.5 rounded-lg bg-rose-500/[0.04] border border-rose-500/20 text-xs">
                        <div className="w-6 h-6 rounded bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-[10px]">
                          {rec.from_developer_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-rose-200">{rec.from_developer_name}</div>
                          <div className="text-[10px] text-rose-400/80 font-mono flex items-center gap-1">
                            <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                            <span>Relieves overload</span>
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />

                      {/* To Dev */}
                      <div className="flex items-center gap-2 p-2 px-2.5 rounded-lg bg-sky-500/[0.04] border border-sky-500/20 text-xs">
                        <div className="w-6 h-6 rounded bg-sky-500/20 text-sky-300 font-bold flex items-center justify-center text-[10px]">
                          {rec.suggested_developer_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sky-200">{rec.suggested_developer_name}</div>
                          <div className="text-[10px] text-sky-400/80 font-mono flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3 text-sky-400" />
                            <span>Utilizes idle bandwidth</span>
                          </div>
                        </div>
                      </div>

                      {/* Skill Match Badge */}
                      {rec.skill_match_percentage && (
                        <div className="flex items-center gap-1.5 p-2 px-2.5 rounded-lg bg-indigo-500/[0.06] border border-indigo-500/20 text-xs font-medium text-indigo-300">
                          <Award className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{rec.skill_match_percentage}% Skill Compatibility</span>
                        </div>
                      )}
                    </div>

                    {/* AI Reasoning */}
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
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
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-white/[0.06] transition"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId === rec.id}
                        onClick={() => handleApprove(rec.id)}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-sm"
                      >
                        <Check className="w-3 h-3" />
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
