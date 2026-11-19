import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Award,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import api from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const DevelopersPage = () => {
  const [developers, setDevelopers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);

  // In-place capacity editing state
  const [editingCapacityId, setEditingCapacityId] = useState(null);
  const [capacityInput, setCapacityInput] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDevId, setCurrentDevId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Dev123!');
  const [teamId, setTeamId] = useState('');
  const [expLevel, setExpLevel] = useState('mid');
  const [availableHours, setAvailableHours] = useState('40.0');
  const [selectedSkills, setSelectedSkills] = useState([]);

  const { role } = useAuth();
  const { addToast } = useToast();
  const canManage = role === 'admin' || role === 'project_manager';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [devsRes, teamsRes, skillsRes] = await Promise.all([
        api.get('/developers'),
        api.get('/teams'),
        api.get('/skills')
      ]);
      setDevelopers(devsRes.data);
      setTeams(teamsRes.data);
      setSkills(skillsRes.data);
    } catch (err) {
      console.error('Failed to fetch developer data', err);
      addToast('Failed to load developers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveCapacity = async (devId) => {
    const hours = parseFloat(capacityInput);
    if (isNaN(hours) || hours <= 0 || hours > 168) {
      addToast('Please enter a valid weekly capacity between 1 and 168 hours.', 'error');
      return;
    }
    try {
      const res = await api.patch(`/developers/${devId}/capacity`, { available_hours_per_week: hours });
      setDevelopers((prev) => prev.map((d) => (d.id === devId ? { ...d, available_hours_per_week: hours } : d)));
      setEditingCapacityId(null);
      addToast(`Updated weekly capacity to ${hours}h/wk!`, 'success');
    } catch (err) {
      console.error('Failed to update capacity', err);
      addToast('Failed to update capacity hours.', 'error');
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentDevId(null);
    setName('');
    setEmail('');
    setPassword('Dev123!');
    setTeamId(teams[0]?.id || '');
    setExpLevel('mid');
    setAvailableHours('40.0');
    setSelectedSkills([]);
    setIsModalOpen(true);
  };

  const openEditModal = (dev) => {
    setIsEditing(true);
    setCurrentDevId(dev.id);
    setName(dev.name);
    setEmail(dev.email);
    setTeamId(dev.team_id || '');
    setExpLevel(dev.experience_level || 'mid');
    setAvailableHours(String(dev.available_hours_per_week || 40.0));
    setSelectedSkills(
      dev.skills.map((s) => ({
        skill_id: s.skill_id,
        proficiency_level: s.proficiency_level
      }))
    );
    setIsModalOpen(true);
  };

  const handleSkillToggle = (skillId) => {
    const exists = selectedSkills.find((s) => s.skill_id === skillId);
    if (exists) {
      setSelectedSkills(selectedSkills.filter((s) => s.skill_id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, { skill_id: skillId, proficiency_level: 3 }]);
    }
  };

  const handleProficiencyChange = (skillId, level) => {
    setSelectedSkills(
      selectedSkills.map((s) => (s.skill_id === skillId ? { ...s, proficiency_level: parseInt(level) } : s))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/developers/${currentDevId}`, {
          team_id: teamId ? parseInt(teamId) : null,
          experience_level: expLevel,
          available_hours_per_week: parseFloat(availableHours),
          skills: selectedSkills
        });
        addToast('Developer updated successfully!', 'success');
      } else {
        // Register user first
        const userRes = await api.post('/auth/register', {
          name,
          email,
          password,
          role: 'developer'
        });
        // Create developer profile if needed or update existing
        const devs = await api.get('/developers');
        const createdDev = devs.data.find((d) => d.email === email);
        if (createdDev) {
          await api.put(`/developers/${createdDev.id}`, {
            team_id: teamId ? parseInt(teamId) : null,
            experience_level: expLevel,
            available_hours_per_week: parseFloat(availableHours),
            skills: selectedSkills
          });
        }
        addToast('New developer created and added to team!', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save developer', err);
      addToast(err.response?.data?.detail || 'Error saving developer profile', 'error');
    }
  };

  const handleDelete = async (devId) => {
    if (!window.confirm('Are you sure you want to deactivate this developer profile?')) return;
    try {
      await api.delete(`/developers/${devId}`);
      addToast('Developer deactivated.', 'success');
      fetchData();
    } catch (err) {
      console.error('Failed to deactivate developer', err);
      addToast('Error deactivating developer.', 'error');
    }
  };

  const filteredDevs = developers.filter((d) => {
    if (search) {
      const matchName = d.name.toLowerCase().includes(search.toLowerCase());
      const matchEmail = d.email.toLowerCase().includes(search.toLowerCase());
      const matchSkill = d.skills.some((s) => s.skill_name.toLowerCase().includes(search.toLowerCase()));
      if (!matchName && !matchEmail && !matchSkill) return false;
    }
    if (selectedTeam && d.team_id !== parseInt(selectedTeam)) return false;
    return true;
  });

  return (
    <DashboardLayout title="Engineering Roster & Skill Matrix" onRefresh={fetchData}>
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-dark-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">Active Engineers</h2>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {filteredDevs.length} members
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage weekly working capacities, experience levels, and technical skill proficiencies. Click capacity to quick-edit.
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition border border-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Developer</span>
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or skill (e.g. React, Python)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-dark-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="w-full sm:w-60 px-3 py-2 bg-dark-900/90 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.team_name}</option>
          ))}
        </select>
      </div>

      {/* Developers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDevs.map((dev) => (
          <div
            key={dev.id}
            className="p-5 rounded-2xl bg-dark-900/80 border border-slate-800/80 hover:border-slate-700 transition shadow-xl backdrop-blur-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center font-bold text-white text-sm shadow-md">
                    {dev.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{dev.name}</h3>
                    <p className="text-[11px] text-slate-400">{dev.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-dark-950 text-slate-300 border border-slate-800">
                    {dev.experience_level}
                  </span>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => openEditModal(dev)}
                      className="p-1 text-slate-400 hover:text-white transition"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Weekly Capacity (with 1-click in-place editing) */}
              <div className="p-3 rounded-xl bg-dark-950 border border-slate-800/80 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Weekly Available Capacity:</span>
                </div>

                {editingCapacityId === dev.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="168"
                      value={capacityInput}
                      onChange={(e) => setCapacityInput(e.target.value)}
                      className="w-16 px-1.5 py-0.5 bg-dark-900 border border-indigo-500 rounded text-xs font-mono text-white text-center"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveCapacity(dev.id)}
                      className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition"
                      title="Save Capacity"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCapacityId(null)}
                      className="text-xs text-slate-400 hover:text-white px-1"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      if (canManage) {
                        setEditingCapacityId(dev.id);
                        setCapacityInput(String(dev.available_hours_per_week || 40.0));
                      }
                    }}
                    className={`font-mono text-xs font-bold text-white px-2 py-0.5 rounded ${
                      canManage ? 'cursor-pointer hover:bg-dark-850 hover:text-indigo-300' : ''
                    }`}
                    title={canManage ? 'Click to edit capacity' : ''}
                  >
                    {dev.available_hours_per_week || 40.0}h / week
                  </div>
                )}
              </div>

              {/* Skills Matrix */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Skills & Proficiency Levels
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dev.skills.length === 0 ? (
                    <span className="text-xs text-slate-500">No skills assigned yet</span>
                  ) : (
                    dev.skills.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-950 border border-slate-800 text-xs text-slate-300"
                      >
                        <span className="font-semibold text-slate-200">{s.skill_name}</span>
                        <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1 rounded">
                          Lv.{s.proficiency_level}
                        </span>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>Team: {dev.team_name || 'Engineering'}</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Developer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Edit Developer Profile: ${name}` : 'Add New Engineering Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full px-3 py-2 bg-dark-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@company.com"
                  className="w-full px-3 py-2 bg-dark-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Default Password</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Experience Tier</label>
              <select
                value={expLevel}
                onChange={(e) => setExpLevel(e.target.value)}
                className="w-full px-3 py-2 bg-dark-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="junior">Junior Engineer</option>
                <option value="mid">Mid-Level Engineer</option>
                <option value="senior">Senior Engineer</option>
                <option value="lead">Lead Architect</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Weekly Available Hours</label>
              <input
                type="number"
                step="1"
                min="5"
                max="80"
                value={availableHours}
                onChange={(e) => setAvailableHours(e.target.value)}
                required
                className="w-full px-3 py-2 bg-dark-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Technical Skills & Proficiency (1-5)</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-dark-950 border border-slate-800">
              {skills.map((s) => {
                const selected = selectedSkills.find((item) => item.skill_id === s.id);
                return (
                  <div
                    key={s.id}
                    className={`p-2 rounded-lg border text-xs flex flex-col justify-between gap-1 transition ${
                      selected
                        ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                        : 'bg-dark-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{s.skill_name}</span>
                      <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={() => handleSkillToggle(s.id)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                      />
                    </div>
                    {selected && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-slate-400">Level:</span>
                        <select
                          value={selected.proficiency_level}
                          onChange={(e) => handleProficiencyChange(s.id, e.target.value)}
                          className="bg-dark-950 border border-slate-700 rounded px-1 text-[11px] text-white"
                        >
                          <option value="1">1 - Novice</option>
                          <option value="2">2 - Basic</option>
                          <option value="3">3 - Competent</option>
                          <option value="4">4 - Proficient</option>
                          <option value="5">5 - Expert</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
              Save Profile
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
