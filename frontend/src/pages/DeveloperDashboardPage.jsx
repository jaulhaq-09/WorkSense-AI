import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  TrendingUp,
  AlertCircle,
  Plus,
  Briefcase,
  Check,
  ChevronDown,
  Zap
} from 'lucide-react';
import api from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { WorkloadBadge, TaskStatusBadge, PriorityBadge, ComplexityBadge } from '../components/StatusBadge';
import { CellDropdown } from '../components/CellDropdown';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const DeveloperDashboardPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
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
      addToast('Failed to load workspace.', 'error');
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

  const handleQuickAddHours = async (task, hours) => {
    try {
      await api.post('/time-logs', {
        task_id: task.id,
        developer_id: profile.developer_id,
        hours_spent: parseFloat(hours),
        description: `Logged ${hours}h sprint work`
      });
      addToast(`+${hours}h recorded on "${task.task_name}".`, 'success');
      fetchPersonalData();
    } catch (err) {
      console.error('Failed to log time', err);
      addToast('Error logging time.', 'error');
    }
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
      addToast(`Logged ${hoursSpent}h on "${selectedTask.task_name}"`, 'success');
      setIsLogModalOpen(false);
      fetchPersonalData();
    } catch (err) {
      console.error('Failed to log time', err);
      addToast('Failed to log working hours.', 'error');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      addToast(`Task marked as ${newStatus.replace('_', ' ')}.`, 'success');
      fetchPersonalData();
    } catch (err) {
      console.error('Failed to update task status', err);
      addToast('Error updating status.', 'error');
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', dotColor: 'bg-zinc-500' },
    { value: 'in_progress', label: 'In Progress', dotColor: 'bg-indigo-400' },
    { value: 'blocked', label: 'Blocked', dotColor: 'bg-rose-400' },
    { value: 'completed', label: 'Completed', dotColor: 'bg-emerald-400' },
  ];

  return (
    <DashboardLayout title="Developer Workspace" onRefresh={fetchPersonalData}>
      {/* Focus Cockpit Bar */}
      <div className="p-4 rounded-xl bg-[#111115] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white text-sm shadow-sm">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'D'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">{profile?.name}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-white/[0.06]">
                Weekly Target: {workload?.available_hours || 40}h
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">{profile?.email}</p>
          </div>
        </div>

        {workload && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-zinc-500 uppercase font-medium">Personal Load</div>
              <div className="text-sm font-mono font-bold text-white">
                {workload.weighted_remaining_effort}h remaining
              </div>
            </div>
            <WorkloadBadge status={workload.workload_status} utilization={workload.utilization_percentage} />
          </div>
        )}
      </div>

      {/* Capacity Metrics */}
      {workload && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#111115] border border-white/[0.06]">
            <div className="text-[10px] text-zinc-500 uppercase font-medium">Weekly Capacity</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">{workload.available_hours}h</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111115] border border-white/[0.06]">
            <div className="text-[10px] text-zinc-500 uppercase font-medium">Weighted Effort</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">{workload.weighted_remaining_effort}h</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111115] border border-white/[0.06]">
            <div className="text-[10px] text-zinc-500 uppercase font-medium">Utilization</div>
            <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5">
              {workload.utilization_percentage.toFixed(0)}%
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111115] border border-white/[0.06]">
            <div className="text-[10px] text-zinc-500 uppercase font-medium">Active Deliverables</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">{workload.total_active_tasks}</div>
          </div>
        </div>
      )}

      {/* Active Deliverables Pipeline */}
      <div className="p-5 rounded-xl bg-[#111115] border border-white/[0.06]">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] mb-3">
          <div>
            <h3 className="text-xs font-semibold text-white">Assigned Deliverables</h3>
            <p className="text-[11px] text-zinc-400">Click status to toggle, or use quick time buttons</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-white/[0.06]">
            {tasks.length} tasks
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="py-10 text-center text-xs text-zinc-500">
            No active deliverables currently assigned. All deliverables completed!
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-lg bg-[#141418] border border-white/[0.05] hover:border-white/[0.10] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CellDropdown
                      value={t.status}
                      options={statusOptions}
                      onChange={(newStatus) => handleStatusChange(t.id, newStatus)}
                      renderTrigger={() => <TaskStatusBadge status={t.status} />}
                    />
                    <span className="text-xs font-medium text-white truncate">{t.task_name}</span>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                    <span>Project: {t.project_name || 'General'}</span>
                    <span>•</span>
                    <span className="font-mono text-zinc-400">
                      Remaining: <strong className="text-zinc-200">{t.remaining_hours}h</strong> / {t.estimated_hours}h
                    </span>
                    <span>•</span>
                    <span>Logged: {t.actual_hours_logged}h</span>
                  </div>
                </div>

                {/* 1-Click Quick Time Logging Pills */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleQuickAddHours(t, 1.0)}
                    className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-mono text-zinc-300 border border-white/[0.06] transition"
                    title="Quick log 1 hour"
                  >
                    +1h
                  </button>
                  <button
                    onClick={() => handleQuickAddHours(t, 2.0)}
                    className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-mono text-zinc-300 border border-white/[0.06] transition"
                    title="Quick log 2 hours"
                  >
                    +2h
                  </button>
                  <button
                    onClick={() => openLogModal(t)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Custom Log</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Time Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title={`Log Working Hours: ${selectedTask?.task_name}`}
      >
        <form onSubmit={handleLogSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Hours Spent</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              required
              className="w-full px-3 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Work Description (Optional)</label>
            <textarea
              rows={2}
              value={logDesc}
              onChange={(e) => setLogDesc(e.target.value)}
              placeholder="What did you work on?"
              className="w-full px-3 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
            >
              Record Log
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
