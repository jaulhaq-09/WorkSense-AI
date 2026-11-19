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
    if (!window.confirm('Are you sure you want to delete this project?')) return;
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
    <DashboardLayout title="Projects & Engineering Workstreams" onRefresh={fetchData}>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-dark-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">Active Workstreams</h2>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Track multi-team engineering deliverables, milestones, and timelines.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition border border-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-5 rounded-2xl bg-dark-900/80 border border-slate-800/80 hover:border-slate-700 transition shadow-xl backdrop-blur-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{proj.project_name}</h3>
                    <p className="text-[11px] text-slate-500">{proj.team_name || 'Core Engineering Team'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${
                      proj.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {proj.status}
                  </span>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => openEditModal(proj)}
                      className="p-1 text-slate-400 hover:text-white transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-400 my-3 line-clamp-2 leading-relaxed">
                {proj.description || 'No project description provided.'}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 p-2.5 rounded-xl bg-dark-950 border border-slate-800/80 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] text-slate-400 truncate">
                    {proj.start_date ? `${proj.start_date} to ${proj.end_date || 'Ongoing'}` : 'Dates unassigned'}
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px] font-mono font-semibold text-slate-200">
                    {proj.task_count || 0} active tickets
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>Created {new Date(proj.created_at).toLocaleDateString()}</span>
              {canManage && (
                <button
                  type="button"
                  onClick={() => handleDelete(proj.id)}
                  className="text-slate-500 hover:text-rose-400 transition"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
        title={isEditing ? 'Edit Project Specifications' : 'Create Engineering Workstream'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Distributed Consensus Engine"
              className="w-full px-3 py-2 bg-dark-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Engineering Team</label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full px-3 py-2 bg-dark-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">No Team Assigned</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.team_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-dark-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Delivery Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-dark-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="High-level engineering deliverable objectives and milestones..."
              className="w-full px-3 py-2 bg-dark-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition"
            >
              {isEditing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
