import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Plus,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Briefcase,
  Users
} from 'lucide-react';
import api from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProjId, setCurrentProjId] = useState(null);

  // Form State
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [teamId, setTeamId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectStatus, setProjectStatus] = useState('active');

  const { role } = useAuth();
  const { addToast } = useToast();
  const canManage = role === 'admin' || role === 'project_manager';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, teamsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/teams')
      ]);
      setProjects(projRes.data);
      setTeams(teamsRes.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
      addToast('Failed to load projects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentProjId(null);
    setProjectName('');
    setDescription('');
    setTeamId(teams[0]?.id || '');
    setStartDate('');
    setEndDate('');
    setProjectStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (proj) => {
    setIsEditing(true);
    setCurrentProjId(proj.id);
    setProjectName(proj.project_name);
    setDescription(proj.description || '');
    setTeamId(proj.team_id || '');
    setStartDate(proj.start_date || '');
    setEndDate(proj.end_date || '');
    setProjectStatus(proj.status || 'active');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName) return;

    const payload = {
      project_name: projectName,
      description,
      team_id: teamId ? parseInt(teamId) : null,
      start_date: startDate || null,
      end_date: endDate || null,
      status: projectStatus
    };

    try {
      if (isEditing) {
        await api.put(`/projects/${currentProjId}`, payload);
        addToast('Project updated successfully!', 'success');
      } else {
        await api.post('/projects', payload);
        addToast('New engineering project created!', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save project', err);
      addToast(err.response?.data?.detail || 'Error saving project', 'error');
    }
  };

  const handleDelete = async (projId) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${projId}`);
      addToast('Project deleted.', 'success');
      fetchData();
    } catch (err) {
      console.error('Failed to delete project', err);
      addToast('Error deleting project.', 'error');
    }
  };

  return (
    <DashboardLayout title="Engineering Projects" onRefresh={fetchData}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Active Workstreams</h2>
          <p className="text-[11px] text-zinc-400">Track delivery velocity across engineering squads</p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-4 rounded-xl bg-[#111115] border border-white/[0.06] hover:border-white/[0.12] transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">{proj.project_name}</h3>
                    <p className="text-[10px] text-zinc-500">{proj.team_name || 'Core Engineering'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${
                      proj.status === 'active'
                        ? 'bg-emerald-500/[0.08] text-emerald-300 border-emerald-500/25'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {proj.status}
                  </span>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => openEditModal(proj)}
                      className="p-1 text-zinc-500 hover:text-white transition"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-zinc-400 my-2.5 line-clamp-2 leading-relaxed">
                {proj.description || 'No project description provided.'}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs p-2 rounded-lg bg-[#141418] border border-white/[0.04] mb-1">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">
                    {proj.start_date ? `${proj.start_date} to ${proj.end_date || 'Ongoing'}` : 'Dates unassigned'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-end text-zinc-300 text-[11px] font-mono">
                  <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{proj.task_count || 0} tickets</span>
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-zinc-500">
              <span>Created {new Date(proj.created_at).toLocaleDateString()}</span>
              {canManage && (
                <button
                  type="button"
                  onClick={() => handleDelete(proj.id)}
                  className="text-zinc-500 hover:text-rose-400 transition"
                  title="Delete Project"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Project' : 'Create Engineering Workstream'}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Project Name</label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Distributed Consensus Engine"
              className="w-full px-3 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Assigned Team</label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">No Team Assigned</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.team_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Target Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Milestones and objectives..."
              className="w-full px-3 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
            >
              {isEditing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
