import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { TaskStatusBadge, PriorityBadge, ComplexityBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterDeveloper, setFilterDeveloper] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  // Form State
  const [projectId, setProjectId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState('medium');
  const [priority, setPriority] = useState('medium');
  const [estimatedHours, setEstimatedHours] = useState('10.0');
  const [taskStatus, setTaskStatus] = useState('pending');
  const [deadline, setDeadline] = useState('');
  const [assignedDevId, setAssignedDevId] = useState('');
  const [requiredSkillId, setRequiredSkillId] = useState('');
  const [minProficiency, setMinProficiency] = useState('2');
  const [dependsOnTaskId, setDependsOnTaskId] = useState('');

  // Machine Learning Live Prediction Assistant State
  const [mlPrediction, setMlPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  // Quick Log Time Modal State
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [activeTaskForLog, setActiveTaskForLog] = useState(null);
  const [hoursSpent, setHoursSpent] = useState('');
  const [logDesc, setLogDesc] = useState('');

  const { role } = useAuth();
  const canManage = role === 'admin' || role === 'project_manager';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projRes, devsRes, skillsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/developers'),
        api.get('/skills')
      ]);
      setTasks(tasksRes.data);
      setProjects(projRes.data);
      setDevelopers(devsRes.data);
      setSkills(skillsRes.data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Live ML prediction trigger when complexity, priority, or hours change
  const triggerMLPrediction = async (comp, prio, hours) => {
    if (!hours || parseFloat(hours) <= 0) return;
    try {
      setPredicting(true);
      const res = await api.post('/ml/predict-effort', {
        complexity: comp,
        priority: prio,
        estimated_hours: parseFloat(hours),
        dev_experience: 'mid',
        required_skills_count: 2,
        avg_skill_proficiency: 3.5
      });
      setMlPrediction(res.data);
    } catch (err) {
      console.error('Failed to predict effort', err);
    } finally {
      setPredicting(false);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentTaskId(null);
    setProjectId(projects[0]?.id || '');
    setTaskName('');
    setDescription('');
    setComplexity('medium');
    setPriority('medium');
    setEstimatedHours('10.0');
    setTaskStatus('pending');
    setDeadline('');
    setAssignedDevId(developers[0]?.id || '');
    setRequiredSkillId(skills[0]?.id || '');
    setMinProficiency('2');
    setDependsOnTaskId('');
    setMlPrediction(null);
    triggerMLPrediction('medium', 'medium', '10.0');
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setIsEditing(true);
    setCurrentTaskId(t.id);
    setProjectId(t.project_id);
    setTaskName(t.task_name);
    setDescription(t.description || '');
    setComplexity(t.complexity);
    setPriority(t.priority);
    setEstimatedHours(t.estimated_hours.toString());
    setTaskStatus(t.status);
    setDeadline(t.deadline || '');
    setAssignedDevId(t.assigned_developers[0]?.developer_id || '');
    setRequiredSkillId(t.required_skills[0]?.skill_id || '');
    setMinProficiency(t.required_skills[0]?.minimum_proficiency || '2');
    setDependsOnTaskId(t.dependencies[0]?.depends_on_task_id || '');
    triggerMLPrediction(t.complexity, t.priority, t.estimated_hours);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        project_id: parseInt(projectId),
        task_name: taskName,
        description,
        complexity,
        priority,
        estimated_hours: parseFloat(estimatedHours),
        status: taskStatus,
        deadline: deadline || null,
        assigned_developer_ids: assignedDevId ? [parseInt(assignedDevId)] : [],
        required_skills: requiredSkillId
          ? [{ skill_id: parseInt(requiredSkillId), minimum_proficiency: parseInt(minProficiency) }]
          : [],
        depends_on_task_ids: dependsOnTaskId ? [parseInt(dependsOnTaskId)] : []
      };

      if (isEditing) {
        await api.put(`/tasks/${currentTaskId}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save task', err);
      alert(err.response?.data?.detail || 'Error saving task');
    }
  };

  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Failed to change status', err);
    }
  };

  const openQuickLogModal = (task) => {
    setActiveTaskForLog(task);
    setHoursSpent('2.0');
    setLogDesc('');
    setLogModalOpen(true);
  };

  const handleQuickLogSubmit = async (e) => {
    e.preventDefault();
    if (!activeTaskForLog || !hoursSpent) return;
    try {
      await api.post('/time-logs', {
        task_id: activeTaskForLog.id,
        hours_spent: parseFloat(hoursSpent),
        description: logDesc
      });
      setLogModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to log time', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.task_name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesProject = !filterProject || t.project_id === parseInt(filterProject);
    const matchesDev =
      !filterDeveloper ||
      t.assigned_developers.some((d) => d.developer_id === parseInt(filterDeveloper));
    const matchesStatus = !filterStatus || t.status === filterStatus;
    const matchesPriority = !filterPriority || t.priority === filterPriority;

    return matchesSearch && matchesProject && matchesDev && matchesStatus && matchesPriority;
  });

  return (
    <DashboardLayout title="Engineering Tasks & Assignments" onRefresh={fetchData}>
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks by title, component, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {canManage && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm shrink-0 w-full sm:w-auto justify-center"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Task
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.project_name}</option>
            ))}
          </select>

          <select
            value={filterDeveloper}
            onChange={(e) => setFilterDeveloper(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Developers</option>
            {developers.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Task Name</th>
                <th className="px-6 py-3">Project</th>
                <th className="px-6 py-3">Assigned To</th>
                <th className="px-6 py-3">Complexity & Priority</th>
                <th className="px-6 py-3 text-right">Est / Logged / Rem</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-xs text-slate-400">
                    No tasks match the active filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 leading-tight">{t.task_name}</div>
                      {t.dependencies.length > 0 && (
                        <div className="text-[10px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                          <span>Blocked on:</span> {t.dependencies.map((d) => d.task_name).join(', ')}
                        </div>
                      )}
                      {t.deadline && (
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Due {t.deadline}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {t.project_name || 'Unassigned'}
                    </td>

                    <td className="px-6 py-4">
                      {t.assigned_developers.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      ) : (
                        <div className="space-y-1">
                          {t.assigned_developers.map((d) => (
                            <div key={d.developer_id} className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                              <span className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-[10px] text-indigo-700">
                                {d.name.charAt(0)}
                              </span>
                              <span>{d.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <ComplexityBadge complexity={t.complexity} />
                        <PriorityBadge priority={t.priority} />
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right font-mono text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{t.remaining_hours}h</span>
                        <span className="text-slate-400"> rem</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t.estimated_hours}h est • {t.actual_hours_logged}h logged
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleQuickStatusChange(t.id, e.target.value)}
                        className="text-xs font-semibold rounded-lg border border-slate-200 bg-white px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="blocked">Blocked</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openQuickLogModal(t)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Log hours on this task"
                        >
                          <Clock className="w-3 h-3" />
                        </button>
                        {canManage && (
                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Task Modal with LIVE ML PREDICTIONS */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Edit Task • ${taskName}` : 'Create New Engineering Task'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.project_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Developer
              </label>
              <select
                value={assignedDevId}
                onChange={(e) => setAssignedDevId(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Unassigned</option>
                {developers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.team_name || 'No team'})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Name / Title
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Implement Distributed Lock Manager"
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & Acceptance Criteria
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              placeholder="Technical specifics and deliverables..."
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Complexity
              </label>
              <select
                value={complexity}
                onChange={(e) => {
                  setComplexity(e.target.value);
                  triggerMLPrediction(e.target.value, priority, estimatedHours);
                }}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 capitalize"
              >
                <option value="easy">Easy (1.0x)</option>
                <option value="medium">Medium (1.2x)</option>
                <option value="hard">Hard (1.5x)</option>
                <option value="critical">Critical (2.0x)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  triggerMLPrediction(complexity, e.target.value, estimatedHours);
                }}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 capitalize"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={estimatedHours}
                onChange={(e) => {
                  setEstimatedHours(e.target.value);
                  triggerMLPrediction(complexity, priority, e.target.value);
                }}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Machine Learning Effort Predictor Callout Box */}
          {mlPrediction && (
            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-indigo-900">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Random Forest ML Effort Prediction
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${
                  mlPrediction.risk_level === 'high'
                    ? 'bg-rose-100 text-rose-700'
                    : mlPrediction.risk_level === 'moderate'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  Risk: {mlPrediction.risk_level}
                </span>
              </div>
              <div className="text-slate-700 flex items-center justify-between">
                <span>
                  Predicted actual completion time:{' '}
                  <strong className="text-indigo-950 font-mono text-sm">{mlPrediction.predicted_actual_hours} hrs</strong>
                  <span className="text-slate-500 ml-1">
                    ({mlPrediction.variance_hours > 0 ? `+${mlPrediction.variance_hours}` : mlPrediction.variance_hours}h vs estimate)
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  95% CI: [{mlPrediction.confidence_interval_hours[0]}h - {mlPrediction.confidence_interval_hours[1]}h]
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Trained Random Forest Regressor evaluates complexity risk, priority factor, and skill mismatch penalties.
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial Status
              </label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Required Technical Skill
              </label>
              <select
                value={requiredSkillId}
                onChange={(e) => setRequiredSkillId(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">None Required</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>{s.skill_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Minimum Proficiency (1-5)
              </label>
              <select
                value={minProficiency}
                onChange={(e) => setMinProficiency(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">1 (Basic Knowledge)</option>
                <option value="2">2 (Elementary)</option>
                <option value="3">3 (Working Proficiency)</option>
                <option value="4">4 (Advanced)</option>
                <option value="5">5 (Expert)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Log Time Modal */}
      <Modal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        title={`Log Hours Spent • ${activeTaskForLog?.task_name}`}
      >
        <form onSubmit={handleQuickLogSubmit} className="space-y-4">
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
              Work Description
            </label>
            <textarea
              value={logDesc}
              onChange={(e) => setLogDesc(e.target.value)}
              rows="3"
              placeholder="Details on code commits or debugging done..."
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
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
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Record Time Log
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
