import React, { useState } from 'react';
import { RefreshCw, Clock, Sparkles, Menu, Shield, User, Briefcase } from 'lucide-react';
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
      addToast('Engine recalculated workload scores & capacity utilization.', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to recalculate workloads', err);
      addToast('Failed to trigger workload recalculation.', 'error');
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
      addToast('Could not load active tasks for time logging.', 'error');
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
      addToast(`Logged ${hoursSpent}h successfully! Remaining effort updated.`, 'success');
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

  const roleStyles = {
    admin: { label: 'Admin', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
    project_manager: { label: 'Project Manager', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    developer: { label: 'Developer', color: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  };

  const rolePill = roleStyles[user?.role] || { label: user?.role || 'User', color: 'bg-slate-700/50 text-slate-300 border-slate-600' };

  return (
    <>
      <header className="h-16 bg-dark-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          {onToggleMobile && (
            <button
              onClick={onToggleMobile}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-800"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{title}</span>
              <span className={`hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${rolePill.color}`}>
                {rolePill.label}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Log Time Button */}
          <button
            onClick={openLogModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-200 transition border border-slate-700/80 shadow-sm active:scale-95"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Log Hours</span>
          </button>

          {/* Recalculate Engine Workload Button */}
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white transition shadow-lg shadow-indigo-600/25 border border-indigo-500/30 disabled:opacity-50"
            title="Trigger intelligent workload recalculation across all developers and tasks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{recalculating ? 'Syncing...' : 'Recalculate'}</span>
          </button>
        </div>
      </header>

      {/* Log Time Modal */}
      <Modal isOpen={logModalOpen} onClose={() => setLogModalOpen(false)} title="Log Working Hours">
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Task</label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Hours Spent</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              required
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Work Description (Optional)</label>
            <textarea
              rows={2}
              value={logDesc}
              onChange={(e) => setLogDesc(e.target.value)}
              placeholder="e.g. Profiling database indexes & refactoring ORM joins"
              className="w-full px-3 py-2 bg-dark-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setLogModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={logging || !selectedTask}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {logging ? 'Recording...' : 'Record Time Log'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
