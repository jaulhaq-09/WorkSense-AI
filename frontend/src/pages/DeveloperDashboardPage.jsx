import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  TrendingUp,
  AlertCircle,
  Plus,
  Briefcase
} from 'lucide-react';
import api from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { WorkloadBadge, TaskStatusBadge, PriorityBadge, ComplexityBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const DeveloperDashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [workload, setWorkload] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Log Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [hoursSpent, setHoursSpent] = useState('2.0');
  const [logDesc, setLogDesc] = useState('');

  const fetchPersonalData = async () => {
    try {
      setLoading(true);
      const meRes = await api.get('/auth/me');
      setProfile(meRes.data);

      if (meRes.data.developer_id) {
        const [workloadRes, tasksRes] = await Promise.all([
          api.get(`/workload/developers/${meRes.data.developer_id}`),
          api.get(`/tasks?developer_id=${meRes.data.developer_id}`)
        ]);
        setWorkload(workloadRes.data);
        setTasks(tasksRes.data);
      }
    } catch (err) {
      console.error('Failed to load personal workspace', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalData();
  }, []);

  const openLogModal = (t) => {
    setSelectedTask(t);
    setHoursSpent('2.0');
    setLogDesc('');
    setIsLogModalOpen(true);
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask || !hoursSpent) return;
    try {
      await api.post('/time-logs', {
        task_id: selectedTask.id,
        developer_id: profile.developer_id,
        hours_spent: parseFloat(hoursSpent),
        description: logDesc
      });
      setIsLogModalOpen(false);
      fetchPersonalData();
    } catch (err) {
      console.error('Failed to log time', err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchPersonalData();
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Developer Cockpit">
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Loading your developer telemetry...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <DashboardLayout title={`Developer Cockpit • ${user?.name}`} onRefresh={fetchPersonalData}>
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{profile?.email}</span>
              <span>•</span>
              <span className="capitalize">{workload?.experience_level || 'Mid'} Engineer</span>
              <span>•</span>
              <span>{workload?.team_name || 'Engineering Squad'}</span>
            </div>
          </div>
        </div>

        {workload && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Your Workload</div>
              <div className="text-base font-bold text-slate-900 font-mono">
                {workload.utilization_percentage.toFixed(1)}% Capacity
              </div>
            </div>
            <WorkloadBadge status={workload.workload_status} />
          </div>
        )}
      </div>

      {/* KPI Cards */}
      {workload && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remaining Effort</div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {workload.weighted_remaining_effort.toFixed(1)} <span className="text-xs font-normal text-slate-400">weighted hrs</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Raw unweighted: {workload.raw_remaining_hours.toFixed(1)} hrs</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Weekly Available Hours</div>
            <div className="text-2xl font-bold font-mono text-indigo-600 mt-1">
              {workload.available_hours.toFixed(1)} <span className="text-xs font-normal text-slate-400">hrs/wk</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Configured baseline capacity</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Tasks</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {workload.total_active_tasks} <span className="text-xs font-normal text-slate-400">in sprint</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {workload.in_progress_tasks} in progress • {workload.blocked_tasks} blocked
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Tasks</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {workload.completed_tasks} <span className="text-xs font-normal text-slate-400">done</span>
            </div>
            <div className="text-[11px] text-emerald-600 mt-1">Successfully closed out</div>
          </div>
        </div>
      )}

      {/* Active Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">My Active Tasks ({activeTasks.length})</h3>
          <span className="text-xs text-slate-400">Update status or record hours spent</span>
        </div>

        <div className="divide-y divide-slate-100">
          {activeTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No active tasks assigned to you right now. You are ready to accept new work.
            </div>
          ) : (
            activeTasks.map((t) => (
              <div key={t.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{t.task_name}</span>
                    <ComplexityBadge complexity={t.complexity} />
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>{t.project_name || 'Project'}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-700">
                      Est: {t.estimated_hours}h | Logged: {t.actual_hours_logged}h | Rem: {t.remaining_hours}h
                    </span>
                    {t.deadline && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Calendar className="w-3 h-3" /> Due {t.deadline}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.id, e.target.value)}
                    className="text-xs font-semibold rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    onClick={() => openLogModal(t)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Log Hours
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Hours Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title={`Log Hours • ${selectedTask?.task_name}`}
      >
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Hours Logged
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description of Work Done
            </label>
            <textarea
              value={logDesc}
              onChange={(e) => setLogDesc(e.target.value)}
              rows="3"
              placeholder="Commit references, PR links, or debugging notes..."
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Record Log
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
