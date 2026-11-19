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
  X,
  Layers,
  Shield,
  Briefcase,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'project_manager', 'developer'] },
    { label: 'Workload Analytics', path: '/analytics', icon: BarChart3, roles: ['admin', 'project_manager', 'developer'] },
    { label: 'AI Redistribution', path: '/recommendations', icon: Sparkles, roles: ['admin', 'project_manager'], badge: 'AI' },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare, roles: ['admin', 'project_manager', 'developer'] },
    { label: 'Projects', path: '/projects', icon: FolderKanban, roles: ['admin', 'project_manager'] },
    { label: 'Developers & Skills', path: '/developers', icon: Users, roles: ['admin', 'project_manager'] },
    { label: 'My Workspace', path: '/personal', icon: UserCircle2, roles: ['developer', 'admin', 'project_manager'] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role || ''));

  const roleStyles = {
    admin: { label: 'Administrator', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
    project_manager: { label: 'Project Manager', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    developer: { label: 'Developer', badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  };

  const currentRoleInfo = roleStyles[user?.role] || { label: user?.role || 'User', badge: 'bg-slate-700/50 text-slate-300 border-slate-600' };

  const content = (
    <div className="flex flex-col h-full justify-between bg-dark-900 border-r border-slate-800 text-slate-300 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-dark-950/60">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black text-lg">
              ⚡
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                WorkSense <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Workload Imbalance Cockpit</div>
            </div>
          </div>
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Navigation</span>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${currentRoleInfo.badge}`}>
              {currentRoleInfo.label}
            </span>
          </div>

          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/25 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-dark-800/80'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 border border-indigo-400/30 shadow-sm">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-dark-950/40">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-dark-850/60 border border-slate-800/80 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center font-bold text-white text-xs shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-100 truncate">{user?.name}</div>
            <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
