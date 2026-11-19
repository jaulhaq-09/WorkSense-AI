import React, { useState } from 'react';
import { RefreshCw, Clock, Sparkles, Menu } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';

export const Navbar = ({ title, onRefresh, onToggleMobile }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [recalculating, setRecalculating] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [hoursSpent, setHoursSpent] = useState('2.0');
  const [logDesc, setLogDesc] = useState('');
  const [logging, setLogging] = useState(false);

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      await api.post('/workload/recalculate');
      addToast('Workload recalculated successfully across team.', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to recalculate workloads', err);
      addToast('Workload recalculation failed.', 'error');
    } finally {
      setTimeout(() => setRecalculating(false), 500);
    }
  };

  const openLogModal = async () => {
    try {
      const res = await api.get('/tasks?status_filter=in_progress');
      setTasks(res.data);
      if (res.data.length > 0) {
        setSelectedTask(res.data[0].id);
      }
      setLogModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
      addToast('Could not load active tasks.', 'error');
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask || !hoursSpent) return;
    try {
      setLogging(true);
      await api.post('/time-logs', {
        task_id: parseInt(selectedTask),
        developer_id: user?.developer_id || null,
        hours_spent: parseFloat(hoursSpent),
        description: logDesc
      });
      addToast(`Logged ${hoursSpent}h successfully!`, 'success');
      setLogModalOpen(false);
      setHoursSpent('2.0');
      setLogDesc('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to log time', err);
      addToast('Error logging time.', 'error');
    } finally {
      setLogging(false);
    }
  };

  return (
    <>
      <header className="h-14 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          {onToggleMobile && (
            <button
              onClick={onToggleMobile}
              className="md:hidden text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/[0.04]"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Log Time Button */}
          <button
            onClick={openLogModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 transition border border-white/[0.08] shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Log Hours</span>
          </button>

          {/* Recalculate Engine Workload Button */}
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm border border-indigo-500/30 disabled:opacity-50"
            title="Recalculate workload engine metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{recalculating ? 'Syncing...' : 'Sync Engine'}</span>
          </button>
        </div>
      </header>

      {/* Log Time Modal */}
      <Modal isOpen={logModalOpen} onClose={() => setLogModalOpen(false)} title="Log Working Hours">
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Select Task</label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full px-3 py-2 bg-[#121216] border border-white/[0.08] rounded-lg text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              {tasks.length === 0 ? (
                <option value="">No in-progress tasks found</option>
              ) : (
                tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.task_name} (Est: {t.estimated_hours}h • Rem: {t.remaining_hours}h)
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Hours Spent</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#121216] border border-white/[0.08] rounded-lg text-xs text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Description (Optional)</label>
            <textarea
              rows={2}
              value={logDesc}
              onChange={(e) => setLogDesc(e.target.value)}
              placeholder="What did you work on?"
              className="w-full px-3 py-2 bg-[#121216] border border-white/[0.08] rounded-lg text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setLogModalOpen(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={logging || !selectedTask}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition disabled:opacity-50"
            >
              {logging ? 'Recording...' : 'Record Time'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
