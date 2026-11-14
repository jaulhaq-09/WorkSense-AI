import React, { useState } from 'react';
import { RefreshCw, Clock, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';

export const Navbar = ({ title, onRefresh }) => {
  const { user } = useAuth();
  const [recalculating, setRecalculating] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [hoursSpent, setHoursSpent] = useState('');
  const [logDesc, setLogDesc] = useState('');
  const [logging, setLogging] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      await api.post('/workload/recalculate');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to recalculate workloads', err);
    } finally {
      setTimeout(() => setRecalculating(false), 600);
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
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask || !hoursSpent) return;
    try {
      setLogging(true);
      await api.post('/time-logs', {
        task_id: parseInt(selectedTask),
        hours_spent: parseFloat(hoursSpent),
        description: logDesc
      });
      setSuccessMsg('Hours logged successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        setLogModalOpen(false);
        setHoursSpent('');
        setLogDesc('');
        if (onRefresh) onRefresh();
      }, 900);
    } catch (err) {
      console.error('Failed to log time', err);
    } finally {
      setLogging(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Log Time Button */}
          <button
            onClick={openLogModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition border border-slate-200"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Log Hours
          </button>

          {/* Recalculate Engine Workload Button */}
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition shadow-sm disabled:opacity-50"
            title="Trigger intelligent workload recalculation across all developers and tasks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
            {recalculating ? 'Recalculating...' : 'Recalculate Workload'}
          </button>
        </div>
      </header>

      {/* Log Time Modal */}
      <Modal isOpen={logModalOpen} onClose={() => setLogModalOpen(false)} title="Log Working Hours">
        {successMsg ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2 animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900">{successMsg}</h4>
            <p className="text-xs text-slate-500 mt-1">Workload metrics updating automatically...</p>
          </div>
        ) : (
          <form onSubmit={handleLogSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Active Task
              </label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.task_name} ({t.project_name || 'Project'} • {t.estimated_hours}h est)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hours Spent Today
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={hoursSpent}
                onChange={(e) => setHoursSpent(e.target.value)}
                placeholder="e.g. 4.0"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Description / Notes
              </label>
              <textarea
                value={logDesc}
                onChange={(e) => setLogDesc(e.target.value)}
                placeholder="Brief summary of work completed..."
                rows="3"
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLogModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={logging}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {logging ? 'Submitting...' : 'Record Time Log'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};
