import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Award,
  Layers,
  RefreshCw,
  AlertCircle,
  Check
} from 'lucide-react';
import api from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';

export const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const { role } = useAuth();
  const canApprove = role === 'admin' || role === 'project_manager';

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recommendations');
      setRecommendations(res.data);
    } catch (err) {
      console.error('Failed to load recommendations', err);
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
      setFeedbackMsg(res.data.message || 'Scanned team capacity and generated new redistribution plans.');
      fetchRecommendations();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error('Failed to generate recommendations', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoadingId(id);
      const res = await api.post(`/recommendations/${id}/approve`);
      setFeedbackMsg('Task redistribution approved! Task reassigned and workloads recalculated.');
      fetchRecommendations();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error('Failed to approve recommendation', err);
      alert(err.response?.data?.detail || 'Error approving recommendation');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoadingId(id);
      await api.post(`/recommendations/${id}/reject`);
      setFeedbackMsg('Recommendation rejected. Task assignment remained unchanged.');
      fetchRecommendations();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error('Failed to reject recommendation', err);
      alert(err.response?.data?.detail || 'Error rejecting recommendation');
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
      {/* Header and Generator Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Intelligent Capacity Balancing Engine
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">AI-Assisted Task Redistribution</h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Identifies overloaded engineers, checks required technical skill matrices, simulates projected post-assignment
            utilization, and suggests balanced redistribution with human-in-the-loop managerial approval.
          </p>
        </div>

        {canApprove && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition shrink-0 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Scanning Capacity...' : 'Scan & Generate Plans'}
          </button>
        )}
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {st} ({recommendations.filter((r) => st === 'all' || r.status === st).length})
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Manager approval required before database task reassignment occurs.
        </span>
      </div>

      {/* Recommendations Listing */}
      <div className="space-y-4">
        {filteredRecs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Pending Redistribution Required</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Workloads are currently well-balanced or all redistribution recommendations have been processed.
              Click "Scan & Generate Plans" to trigger a fresh engine evaluation.
            </p>
          </div>
        ) : (
          filteredRecs.map((rec) => {
            const isPending = rec.status === 'pending';
            const isApproved = rec.status === 'approved';
            const isRejected = rec.status === 'rejected';

            return (
              <div
                key={rec.id}
                className={`bg-white rounded-xl border p-6 shadow-sm transition ${
                  isPending
                    ? 'border-indigo-200 hover:border-indigo-300'
                    : isApproved
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-slate-200 opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Task & Transfer Flow */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-indigo-100 text-indigo-700">
                        {rec.project_name || 'Project Work'}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-700'
                          : isRejected
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        Status: {rec.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {rec.task_name}
                    </h3>

                    {/* Developer transfer pill */}
                    <div className="flex items-center gap-3 pt-1 text-xs">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>{rec.from_developer_name}</span>
                        <span className="text-[10px] text-rose-500 font-normal">(Current • Overloaded)</span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{rec.suggested_developer_name}</span>
                        <span className="text-[10px] text-emerald-500 font-normal">(Suggested • Available)</span>
                      </div>
                    </div>

                    {/* Rationale Text */}
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                      {rec.recommendation_reason}
                    </p>
                  </div>

                  {/* Actions Column */}
                  {isPending && canApprove && (
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                      <button
                        onClick={() => handleReject(rec.id)}
                        disabled={actionLoadingId === rec.id}
                        className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 text-slate-400" />
                        Reject
                      </button>

                      <button
                        onClick={() => handleApprove(rec.id)}
                        disabled={actionLoadingId === rec.id}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm active:scale-95 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {actionLoadingId === rec.id ? 'Reassigning...' : 'Approve Reassignment'}
                      </button>
                    </div>
                  )}

                  {isApproved && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Reassignment Executed
                    </div>
                  )}

                  {isRejected && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 shrink-0">
                      <XCircle className="w-4 h-4 text-slate-400" />
                      Proposal Rejected
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
};
