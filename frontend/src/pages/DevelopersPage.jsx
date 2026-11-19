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
  Check,
  LayoutGrid,
  List
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
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
      addToast('Enter a valid weekly capacity between 1 and 168h.', 'error');
      return;
    }
    try {
      await api.patch(`/developers/${devId}/capacity`, { available_hours_per_week: hours });
      setDevelopers((prev) => prev.map((d) => (d.id === devId ? { ...d, available_hours_per_week: hours } : d)));
      setEditingCapacityId(null);
      addToast(`Updated capacity to ${hours}h/wk.`, 'success');
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
        await api.post('/auth/register', {
          name,
          email,
          password,
          role: 'developer'
        });
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
        addToast('New developer created and added to roster!', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save developer', err);
      addToast(err.response?.data?.detail || 'Error saving developer profile', 'error');
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
    <DashboardLayout title="Engineering Roster" onRefresh={fetchData}>
      {/* Search & Actions Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#111115] border border-white/[0.08] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-2.5 py-1.5 bg-[#111115] border border-white/[0.08] rounded-lg text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Team: All</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.team_name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg bg-[#111115] p-0.5 border border-white/[0.08]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition ${
                viewMode === 'grid' ? 'bg-white/[0.08] text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition ${
                viewMode === 'table' ? 'bg-white/[0.08] text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {canManage && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Engineer</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredDevs.map((dev) => (
            <div
              key={dev.id}
              className="p-4 rounded-xl bg-[#111115] border border-white/[0.06] hover:border-white/[0.12] transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                      {dev.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-white">{dev.name}</h3>
                      <p className="text-[10px] text-zinc-500">{dev.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/[0.06]">
                      {dev.experience_level}
                    </span>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => openEditModal(dev)}
                        className="p-1 text-zinc-500 hover:text-white transition"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Capacity Row */}
                <div className="p-2 rounded-lg bg-[#141418] border border-white/[0.05] mb-2.5 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 text-[11px]">Weekly Capacity:</span>

                  {editingCapacityId === dev.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max="168"
                        value={capacityInput}
                        onChange={(e) => setCapacityInput(e.target.value)}
                        className="w-14 px-1 py-0.5 bg-[#09090b] border border-indigo-500 rounded text-xs font-mono text-white text-center"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveCapacity(dev.id)}
                        className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCapacityId(null)}
                        className="text-xs text-zinc-500 hover:text-white px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => {
                        if (canManage) {
                          setEditingCapacityId(dev.id);
                          setCapacityInput(String(dev.available_hours_per_week || 40.0));
                        }
                      }}
                      className={`font-mono text-zinc-200 text-xs px-1.5 py-0.5 rounded ${
                        canManage ? 'cursor-pointer hover:bg-white/[0.06] hover:text-white' : ''
                      }`}
                      title={canManage ? 'Click to edit' : ''}
                    >
                      {dev.available_hours_per_week || 40.0}h / week
                    </span>
                  )}
                </div>

                {/* Skills with Mini-Bar Proficiency Dots */}
                <div>
                  <div className="text-[10px] uppercase font-medium text-zinc-500 mb-1.5">
                    Skills & Proficiency
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dev.skills.length === 0 ? (
                      <span className="text-xs text-zinc-500">No skills assigned</span>
                    ) : (
                      dev.skills.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#141418] border border-white/[0.05] text-[11px] text-zinc-300"
                        >
                          <span>{s.skill_name}</span>
                          {/* 5-dot proficiency level visualizer */}
                          <span className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((dot) => (
                              <span
                                key={dot}
                                className={`w-1 h-1 rounded-full ${
                                  dot <= s.proficiency_level ? 'bg-indigo-400' : 'bg-zinc-700'
                                }`}
                              />
                            ))}
                          </span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-zinc-500">
                <span>Team: {dev.team_name || 'Engineering'}</span>
                <span className="text-emerald-400 font-medium">Active</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl bg-[#111115] border border-white/[0.06] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-400 text-[11px] font-medium bg-[#0e0e12]/60">
                <th className="py-2.5 px-3">Developer</th>
                <th className="py-2.5 px-3">Team</th>
                <th className="py-2.5 px-3">Experience</th>
                <th className="py-2.5 px-3">Weekly Capacity</th>
                <th className="py-2.5 px-3">Skills</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredDevs.map((dev) => (
                <tr key={dev.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-2.5 px-3 font-medium text-white">{dev.name}</td>
                  <td className="py-2.5 px-3 text-zinc-400">{dev.team_name || 'General'}</td>
                  <td className="py-2.5 px-3 capitalize text-zinc-400">{dev.experience_level}</td>
                  <td className="py-2.5 px-3 font-mono text-zinc-300">{dev.available_hours_per_week || 40}h</td>
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {dev.skills.slice(0, 3).map((s) => (
                        <span key={s.id} className="px-1.5 py-0.5 rounded bg-[#141418] text-[10px] text-zinc-400">
                          {s.skill_name}
                        </span>
                      ))}
                      {dev.skills.length > 3 && (
                        <span className="text-[10px] text-zinc-500">+{dev.skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => openEditModal(dev)}
                        className="text-xs text-zinc-400 hover:text-white"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Developer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Edit Developer Profile: ${name}` : 'Add Engineering Team Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isEditing && (
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Hayes"
                  className="w-full px-3 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@company.com"
                  className="w-full px-3 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Experience Tier</label>
              <select
                value={expLevel}
                onChange={(e) => setExpLevel(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="junior">Junior Engineer</option>
                <option value="mid">Mid-Level Engineer</option>
                <option value="senior">Senior Engineer</option>
                <option value="lead">Lead Architect</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Weekly Available Hours</label>
              <input
                type="number"
                step="1"
                min="5"
                max="80"
                value={availableHours}
                onChange={(e) => setAvailableHours(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-white/[0.08] rounded-lg text-xs font-mono text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Technical Skills Matrix (1–5)</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto p-2 rounded-lg bg-[#141418] border border-white/[0.06]">
              {skills.map((s) => {
                const selected = selectedSkills.find((item) => item.skill_id === s.id);
                return (
                  <div
                    key={s.id}
                    className={`p-1.5 rounded-md border text-xs flex flex-col justify-between gap-1 transition ${
                      selected
                        ? 'bg-indigo-600/10 border-indigo-500/30 text-white'
                        : 'bg-[#0e0e12] border-white/[0.04] text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[11px]">{s.skill_name}</span>
                      <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={() => handleSkillToggle(s.id)}
                        className="rounded border-zinc-700 text-indigo-600 focus:ring-0"
                      />
                    </div>
                    {selected && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-zinc-500">Lv:</span>
                        <select
                          value={selected.proficiency_level}
                          onChange={(e) => handleProficiencyChange(s.id, e.target.value)}
                          className="bg-[#141418] border border-white/[0.08] rounded px-1 text-[10px] text-zinc-200"
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
              Save Profile
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
