import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Sparkles,
  UserCircle2,
  LogOut,
  Layers,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'project_manager', 'developer'] },
    { label: 'Workload Analytics', path: '/analytics', icon: BarChart3, roles: ['admin', 'project_manager', 'developer'] },
    { label: 'AI Redistribution', path: '/recommendations', icon: Sparkles, roles: ['admin', 'project_manager'] },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare, roles: ['admin', 'project_manager', 'developer'] },
    { label: 'Projects', path: '/projects', icon: FolderKanban, roles: ['admin', 'project_manager'] },
    { label: 'Developers & Skills', path: '/developers', icon: Users, roles: ['admin', 'project_manager'] },
    { label: 'My Workspace', path: '/personal', icon: UserCircle2, roles: ['developer'] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role || ''));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none text-slate-300">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl">
            ⚡
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              WorkSense <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Workload Imbalance Engine</div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Core Modules
          </div>
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.label === 'AI Redistribution' && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-200 text-sm border border-slate-700">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-200 truncate">{user?.name}</div>
            <div className="text-xs text-slate-400 truncate capitalize flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {user?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition border border-transparent hover:border-slate-700"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
