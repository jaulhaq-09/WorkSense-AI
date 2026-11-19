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
  ChevronDown
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
      addToast('Failed to load personal workspace.', 'error');
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
      addToast(`Logged ${hoursSpent}h for "${selectedTask.task_name}"`, 'success');
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
      addToast(`Task marked as ${newStatus.replace('_', ' ')}!`, 'success');
      fetchPersonalData();
    } catch (err) {
      console.error('Failed to update task status', err);
      addToast('Error updating status.', 'error');
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', dotColor: 'bg-slate-400' },
    { value: 'in_progress', label: 'In Progress', dotColor: 'bg-indigo-400' },
    { value: 'blocked', label: 'Blocked', dotColor: 'bg-rose-500' },
    { value: 'completed', label: 'Completed', dotColor: 'bg-emerald-400' },
  ];

  return (
    <DashboardLayout title="My Engineering Workspace" onRefresh={fetchPersonalData}>
      {/* Developer Hero Card */}
      <div className="p-5 rounded-2xl bg-dark-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center font-bold text-white text-lg shadow-lg">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{profile?.name}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {profile?.role || 'Developer'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {profile?.email} • Weekly Target: {workload?.available_hours || 40}h
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {workload && <WorkloadBadge status={workload.workload_status} utilization={workload.utilization_percentage} />}
          </div>
        </div>

        {/* Capacity Gauges */}
        {workload && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
            <div className="p-3 rounded-xl bg-dark-950 border border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Capacity</div>
              <div className="text-xl font-bold font-mono text-white mt-1">{workload.available_hours}h / wk</div>
            </div>

            <div className="p-3 rounded-xl bg-dark-950 border border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Remaining Effort</div>
              <div className="text-xl font-bold font-mono text-white mt-1">{workload.weighted_remaining_effort}h</div>
            </div>

            <div className="p-3 rounded-xl bg-dark-950 border border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Utilization</div>
              <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
                {workload.utilization_percentage.toFixed(1)}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-dark-950 border border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Tasks</div>
              <div className="text-xl font-bold font-mono text-white mt-1">{workload.total_active_tasks}</div>
            </div>
          </div>
        )}
      </div>

      {/* Assigned Tasks Pipeline */}
      <div className="p-5 rounded-2xl bg-dark-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Assigned Deliverables</h3>
            <p className="text-xs text-slate-400">Click Status cell to update your progress or click Log Hours</p>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {tasks.length} active
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            You currently have no active tasks assigned. Enjoy your available bandwidth!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Task Title</th>
                  <th className="py-2.5 px-3">Project</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Effort (Est / Rem)</th>
                  <th className="py-2.5 px-3">Status (Click to toggle)</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-dark-850/60 transition group">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{t.task_name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{t.description || 'No description'}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{t.project_name || 'General'}</td>
                    <td className="py-3 px-3"><PriorityBadge priority={t.priority} /></td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      <div><span className="font-bold text-white">{t.remaining_hours}h</span> rem / {t.estimated_hours}h</div>
                      <div className="text-[10px] text-slate-500">Logged: {t.actual_hours_logged}h</div>
                    </td>
                    <td className="py-3 px-3">
                      <CellDropdown
                        value={t.status}
                        options={statusOptions}
                        onChange={(newStatus) => handleStatusChange(t.id, newStatus)}
                        renderTrigger={() => <TaskStatusBadge status={t.status} />}
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => openLogModal(t)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-indigo-300 hover:text-white border border-slate-700/80 font-semibold text-[11px] transition shadow-sm"
                      >
                        <Clock className="w-3 h-3 text-indigo-400" />
                        <span>Log Hours</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Time Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title={`Log Working Hours: ${selectedTask?.task_name}`}
      >
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Hours Spent Today</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              required
              className="w-full px-3 py-2 bg-dark-950 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Work Description (Optional)</label>
            <textarea
              rows={2}
              value={logDesc}
              onChange={(e) => setLogDesc(e.target.value)}
              placeholder="e.g. Unit testing endpoints and fixing transaction rollbacks"
              className="w-full px-3 py-2 bg-dark-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition"
            >
              Record Time Log
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
