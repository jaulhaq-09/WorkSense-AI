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
  Calendar,
  Layers,
  ChevronDown,
  X
} from 'lucide-react';
import api from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { TaskStatusBadge, PriorityBadge, ComplexityBadge } from '../components/StatusBadge';
import { CellDropdown } from '../components/CellDropdown';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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

  // ML Effort Prediction
  const [mlPrediction, setMlPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  // Quick Log Time Modal State
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [activeTaskForLog, setActiveTaskForLog] = useState(null);
  const [hoursSpent, setHoursSpent] = useState('2.0');
  const [logDesc, setLogDesc] = useState('');

  const { role } = useAuth();
  const { addToast } = useToast();
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
      addToast('Failed to load tasks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ML Effort Prediction trigger
  const triggerMLPrediction = async (comp, prio, hours) => {
    if (!hours || parseFloat(hours) <= 0) return;
    try {
      setPredicting(true);
      const res = await api.post('/ml/predict-effort', {
        complexity: comp,
        priority: prio,
        estimated_hours: parseFloat(hours),
        required_skill_proficiency: parseInt(minProficiency) || 2
      });
      setMlPrediction(res.data);
    } catch (err) {
      console.error('ML Prediction error', err);
    } finally {
      setPredicting(false);
    }
  };

  // CELL CRUD: Patch task field
  const handleCellPatch = async (taskId, patchPayload, successMsg) => {
    try {
      const res = await api.patch(`/tasks/${taskId}`, patchPayload);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
      addToast(successMsg, 'success');
    } catch (err) {
      console.error('Failed to update cell', err);
      addToast(err.response?.data?.detail || 'Failed to update field.', 'error');
    }
  };

  const handleOpenCreateModal = () => {
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
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setIsEditing(true);
    setCurrentTaskId(task.id);
    setProjectId(task.project_id);
    setTaskName(task.task_name);
    setDescription(task.description || '');
    setComplexity(task.complexity);
    setPriority(task.priority);
    setEstimatedHours(String(task.estimated_hours));
    setTaskStatus(task.status);
    setDeadline(task.deadline || '');
    setAssignedDevId(task.assigned_developers[0]?.developer_id || '');
    setRequiredSkillId(task.required_skills[0]?.skill_id || '');
    setMinProficiency(String(task.required_skills[0]?.minimum_proficiency || 2));
    setDependsOnTaskId(task.dependencies[0]?.depends_on_task_id || '');
    setIsModalOpen(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!taskName || !projectId) return;

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

    try {
      if (isEditing) {
        await api.put(`/tasks/${currentTaskId}`, payload);
        addToast('Task updated successfully!', 'success');
      } else {
        await api.post('/tasks', payload);
        addToast('Task created and scheduled!', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save task', err);
      addToast(err.response?.data?.detail || 'Error saving task', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      addToast('Task deleted.', 'success');
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task', err);
      addToast('Failed to delete task.', 'error');
    }
  };

  const handleQuickLogTime = async (e) => {
    e.preventDefault();
    if (!activeTaskForLog || !hoursSpent) return;
    try {
      await api.post('/time-logs', {
        task_id: activeTaskForLog.id,
        developer_id: activeTaskForLog.assigned_developers[0]?.developer_id || null,
        hours_spent: parseFloat(hoursSpent),
        description: logDesc
      });
      addToast(`Logged ${hoursSpent}h on "${activeTaskForLog.task_name}"`, 'success');
      setLogModalOpen(false);
      setHoursSpent('2.0');
      setLogDesc('');
      fetchData();
    } catch (err) {
      console.error('Failed to log time', err);
      addToast('Error logging time.', 'error');
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (search) {
      const matchName = t.task_name.toLowerCase().includes(search.toLowerCase());
      const matchDesc = (t.description || '').toLowerCase().includes(search.toLowerCase());
      if (!matchName && !matchDesc) return false;
    }
    if (filterProject && t.project_id !== parseInt(filterProject)) return false;
    if (filterDeveloper && !t.assigned_developers.some((d) => d.developer_id === parseInt(filterDeveloper))) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending', dotColor: 'bg-zinc-500' },
    { value: 'in_progress', label: 'In Progress', dotColor: 'bg-indigo-400' },
    { value: 'blocked', label: 'Blocked', dotColor: 'bg-rose-400' },
    { value: 'completed', label: 'Completed', dotColor: 'bg-emerald-400' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', dotColor: 'bg-zinc-500' },
    { value: 'medium', label: 'Medium', dotColor: 'bg-zinc-400' },
    { value: 'high', label: 'High', dotColor: 'bg-amber-400' },
    { value: 'urgent', label: 'Urgent', dotColor: 'bg-rose-400' },
  ];

  const devOptions = [
    { value: 0, label: 'Unassigned', sublabel: 'No engineer allocated' },
    ...developers.map((d) => ({
      value: d.id,
      label: d.name,
      sublabel: `${d.experience_level} • ${d.available_hours_per_week || 40}h cap`
    }))
  ];

  const activeFilterCount = [filterProject, filterDeveloper, filterStatus, filterPriority].filter(Boolean).length;

  return (
    <DashboardLayout title="Engineering Tasks" onRefresh={fetchData}>
      {/* Search & Filter Header (Linear-Style) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#111115] border border-white/[0.08] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Quick Filter Selectors */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-[#111115] border border-white/[0.08] rounded-lg text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Status: All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-[#111115] border border-white/[0.08] rounded-lg text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 hidden sm:inline-block"
          >
            <option value="">Priority: All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={filterDeveloper}
            onChange={(e) => setFilterDeveloper(e.target.value)}
            className="px-2.5 py-1.5 bg-[#111115] border border-white/[0.08] rounded-lg text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 hidden md:inline-block"
          >
            <option value="">Assignee: All</option>
            {developers.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setFilterProject('');
                setFilterDeveloper('');
                setFilterStatus('');
                setFilterPriority('');
                setSearch('');
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-sm shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Main Streamlined Table */}
      <div className="rounded-xl bg-[#111115] border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-400 text-[11px] font-medium bg-[#0e0e12]/60">
                <th className="py-2.5 px-3.5">Task</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Complexity</th>
                <th className="py-2.5 px-3">Effort</th>
                <th className="py-2.5 px-3">Assignee</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                    No matching tasks found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const currentDev = t.assigned_developers[0];
                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition group">
                      {/* Task Name & Project */}
                      <td className="py-2.5 px-3.5 max-w-xs">
                        <div
                          onClick={() => canManage && handleOpenEditModal(t)}
                          className={`font-medium text-zinc-200 truncate ${
                            canManage ? 'cursor-pointer hover:text-white' : ''
                          }`}
                          title={t.task_name}
                        >
                          {t.task_name}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">
                          {t.project_name || 'General'}
                        </div>
                      </td>

                      {/* 1-Click Status Cell */}
                      <td className="py-2.5 px-3">
                        <CellDropdown
                          value={t.status}
                          options={statusOptions}
                          onChange={(newStatus) =>
                            handleCellPatch(
                              t.id,
                              { status: newStatus },
                              `Status set to ${newStatus.replace('_', ' ')}`
                            )
                          }
                          renderTrigger={() => <TaskStatusBadge status={t.status} />}
                        />
                      </td>

                      {/* 1-Click Priority Cell */}
                      <td className="py-2.5 px-3">
                        <CellDropdown
                          value={t.priority}
                          options={priorityOptions}
                          disabled={!canManage}
                          onChange={(newPrio) =>
                            handleCellPatch(t.id, { priority: newPrio }, `Priority set to ${newPrio}`)
                          }
                          renderTrigger={() => <PriorityBadge priority={t.priority} />}
                        />
                      </td>

                      {/* Complexity */}
                      <td className="py-2.5 px-3">
                        <ComplexityBadge complexity={t.complexity} />
                      </td>

                      {/* Effort */}
                      <td className="py-2.5 px-3 font-mono text-zinc-300 text-[11px]">
                        <div>
                          <span className="font-semibold text-white">{t.remaining_hours}h</span>
                          <span className="text-zinc-500"> / {t.estimated_hours}h</span>
                        </div>
                      </td>

                      {/* 1-Click Developer Assignee Cell */}
                      <td className="py-2.5 px-3">
                        <CellDropdown
                          value={currentDev?.developer_id || 0}
                          options={devOptions}
                          disabled={!canManage}
                          onChange={(newDevId) =>
                            handleCellPatch(
                              t.id,
                              { assigned_developer_id: newDevId },
                              newDevId > 0 ? 'Reassigned developer.' : 'Unassigned task.'
                            )
                          }
                          renderTrigger={() => (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#141418] border border-white/[0.06] text-zinc-300 hover:text-white transition">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                              <span className="truncate max-w-[100px] text-xs">
                                {currentDev?.name || 'Unassigned'}
                              </span>
                              {canManage && <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />}
                            </div>
                          )}
                        />
                      </td>

                      {/* Action Buttons */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTaskForLog(t);
                              setHoursSpent('2.0');
                              setLogDesc('');
                              setLogModalOpen(true);
                            }}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition"
                            title="Log Hours"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(t)}
                                className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition"
                                title="Edit Task"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(t.id)}
                                className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-500/[0.08] transition"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Task Modal with Smart ML Predictor */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Task Specifications' : 'Create Engineering Task'}
      >
        <form onSubmit={handleSubmitTask} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Task Title</label>
            <input
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Distributed Lock Mechanism"
              className="w-full px-3 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.project_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Assigned Engineer</label>
              <select
                value={assignedDevId}
                onChange={(e) => setAssignedDevId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Unassigned</option>
                {developers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.experience_level})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Complexity</label>
              <select
                value={complexity}
                onChange={(e) => {
                  setComplexity(e.target.value);
                  triggerMLPrediction(e.target.value, priority, estimatedHours);
                }}
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="easy">Easy (1.0x)</option>
                <option value="medium">Medium (1.2x)</option>
                <option value="hard">Hard (1.5x)</option>
                <option value="critical">Critical (2.0x)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  triggerMLPrediction(complexity, e.target.value, estimatedHours);
                }}
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Estimated Hours</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="200"
                value={estimatedHours}
                onChange={(e) => {
                  setEstimatedHours(e.target.value);
                  triggerMLPrediction(complexity, priority, e.target.value);
                }}
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs font-mono text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Machine Learning Smart Suggestion Widget */}
          <div className="p-3 rounded-lg bg-indigo-500/[0.06] border border-indigo-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div>
                <span className="text-zinc-300">ML Predicted Actual Effort: </span>
                <span className="font-mono text-white font-semibold">
                  {predicting
                    ? 'Predicting...'
                    : mlPrediction
                    ? `${mlPrediction.predicted_actual_hours}h`
                    : `${estimatedHours}h baseline`}
                </span>
                {mlPrediction && (
                  <span className="text-[10px] text-zinc-500 ml-2">
                    ({(mlPrediction.confidence_score * 100).toFixed(0)}% confidence)
                  </span>
                )}
              </div>
            </div>

            {mlPrediction && (
              <button
                type="button"
                onClick={() => setEstimatedHours(String(mlPrediction.predicted_actual_hours))}
                className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] transition"
              >
                Use ML Hours
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Required Skill</label>
              <select
                value={requiredSkillId}
                onChange={(e) => setRequiredSkillId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">None</option>
                {skills.map((s) => (
                  <option key={s.id} value={s.id}>{s.skill_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Requirements and architecture notes..."
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
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Time Log Modal */}
      <Modal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        title={`Log Hours: ${activeTaskForLog?.task_name}`}
      >
        <form onSubmit={handleQuickLogTime} className="space-y-3.5">
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
              placeholder="What progress was made?"
              className="w-full px-3 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
