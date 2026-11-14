import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Award,
  Clock,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const DevelopersPage = () => {
  const [developers, setDevelopers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDevId, setCurrentDevId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamId, setTeamId] = useState('');
  const [expLevel, setExpLevel] = useState('mid');
  const [availableHours, setAvailableHours] = useState('40.0');
  const [selectedSkills, setSelectedSkills] = useState([]); // [{ skill_id, proficiency_level }]

  const { role } = useAuth();
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentDevId(null);
    setName('');
    setEmail('');
    setPassword('Password123!');
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
    setPassword('');
    setTeamId(dev.team_id || '');
    setExpLevel(dev.experience_level);
    setAvailableHours(dev.available_hours_per_week.toString());
    setSelectedSkills(
      dev.skills.map((s) => ({ skill_id: s.skill_id, proficiency_level: s.proficiency_level }))
    );
    setIsModalOpen(true);
  };

  const handleSkillToggle = (skillId) => {
    const existing = selectedSkills.find((s) => s.skill_id === skillId);
    if (existing) {
      setSelectedSkills(selectedSkills.filter((s) => s.skill_id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, { skill_id: skillId, proficiency_level: 3 }]);
    }
  };

  const handleProficiencyChange = (skillId, level) => {
    setSelectedSkills(
      selectedSkills.map((s) =>
        s.skill_id === skillId ? { ...s, proficiency_level: parseInt(level) } : s
      )
    );
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/developers/${currentDevId}`, {
          team_id: teamId ? parseInt(teamId) : null,
          experience_level: expLevel,
          available_hours_per_week: parseFloat(availableHours),
          skills: selectedSkills
        });
      } else {
        // First create user
        const userRes = await api.post('/auth/register', {
          name,
          email,
          password: password || 'Password123!',
          role: 'developer'
        });
        const userId = userRes.data.id;

        // Find or update developer profile
        const devRes = await api.get(`/developers`);
        const devProfile = devRes.data.find(d => d.user_id === userId);

        if (devProfile) {
          await api.put(`/developers/${devProfile.id}`, {
            team_id: teamId ? parseInt(teamId) : null,
            experience_level: expLevel,
            available_hours_per_week: parseFloat(availableHours),
            skills: selectedSkills
          });
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to save developer', err);
      alert(err.response?.data?.detail || 'Error saving developer profile');
    }
  };

  const filteredDevelopers = developers.filter((dev) => {
    const matchesSearch =
      dev.name.toLowerCase().includes(search.toLowerCase()) ||
      dev.email.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = !selectedTeam || dev.team_id === parseInt(selectedTeam);
    return matchesSearch && matchesTeam;
  });

  return (
    <DashboardLayout title="Developers & Technical Skills" onRefresh={fetchData}>
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search developers by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Engineering Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.team_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm w-full sm:w-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Developer
          </button>
        )}
      </div>

      {/* Developer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevelopers.map((dev) => (
          <div
            key={dev.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-700">
                    {dev.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{dev.name}</h4>
                    <p className="text-xs text-slate-400">{dev.email}</p>
                  </div>
                </div>
                {canManage && (
                  <button
                    onClick={() => openEditModal(dev)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Team:</span>
                  <span className="font-semibold text-slate-800">{dev.team_name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Experience:</span>
                  <span className="font-semibold text-slate-800 capitalize">{dev.experience_level}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Weekly Capacity:</span>
                  <span className="font-semibold font-mono text-slate-800">{dev.available_hours_per_week} hrs/wk</span>
                </div>
              </div>

              {/* Technical Skills List */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Technical Skills & Proficiency
                </div>
                {dev.skills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No skills registered</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {dev.skills.map((sk) => (
                      <span
                        key={sk.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        <span>{sk.skill_name}</span>
                        <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1 rounded">
                          Lv.{sk.proficiency_level}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Developer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Edit Developer Profile • ${name}` : 'Add New Developer'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {!isEditing && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@company.com"
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Team
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No Team Assigned</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.team_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Experience Level
              </label>
              <select
                value={expLevel}
                onChange={(e) => setExpLevel(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="junior">Junior Engineer</option>
                <option value="mid">Mid-Level Engineer</option>
                <option value="senior">Senior Engineer</option>
                <option value="lead">Staff / Lead Engineer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Available Weekly Working Hours
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="168"
              value={availableHours}
              onChange={(e) => setAvailableHours(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
            <span className="text-[11px] text-slate-400 mt-1 block">Default standard capacity is 40.0 hours per week.</span>
          </div>

          {/* Technical Skills Selection */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Technical Skills & Proficiency (Level 1 to 5)
            </label>
            <div className="space-y-2 border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto">
              {skills.map((sk) => {
                const isChecked = selectedSkills.some((s) => s.skill_id === sk.id);
                const currentProf = selectedSkills.find((s) => s.skill_id === sk.id)?.proficiency_level || 3;

                return (
                  <div key={sk.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSkillToggle(sk.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      {sk.skill_name}
                    </label>

                    {isChecked && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">Proficiency:</span>
                        <select
                          value={currentProf}
                          onChange={(e) => handleProficiencyChange(sk.id, e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                        >
                          <option value="1">1 (Beginner)</option>
                          <option value="2">2 (Elementary)</option>
                          <option value="3">3 (Intermediate)</option>
                          <option value="4">4 (Advanced)</option>
                          <option value="5">5 (Expert)</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
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
              {isEditing ? 'Save Changes' : 'Create Developer Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
