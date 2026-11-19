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
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LogoMark = ({ className = "w-7 h-7" }) => (
  <div className={`${className} rounded-lg bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0`}>
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M6 15v-6" />
      <path d="M9 18h6" />
      <path d="M15 6h-6" />
      <path d="M9 6a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3" />
    </svg>
  </div>
);

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'project_manager', 'developer'] },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare, roles: ['admin', 'project_manager', 'developer'] },
    { label: 'AI Rebalance', path: '/recommendations', icon: Sparkles, roles: ['admin', 'project_manager'], badge: 'AI' },
    { label: 'Analytics & ML', path: '/analytics', icon: BarChart3, roles: ['admin', 'project_manager', 'developer'] },
    { label: 'Developers & Skills', path: '/developers', icon: Users, roles: ['admin', 'project_manager'] },
    { label: 'Projects', path: '/projects', icon: FolderKanban, roles: ['admin', 'project_manager'] },
    { label: 'My Workspace', path: '/personal', icon: UserCircle2, roles: ['developer', 'admin', 'project_manager'] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role || ''));

  const roleLabels = {
    admin: 'Admin',
    project_manager: 'Manager',
    developer: 'Developer',
  };

  const content = (
    <div className="flex flex-col h-full justify-between bg-[#0c0c10] border-r border-white/[0.07] text-zinc-300 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <LogoMark />
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white font-sans">WorkSense</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                AI
              </span>
            </div>
          </div>
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-3 space-y-0.5">
          <div className="px-2.5 py-1.5 text-[10px] font-medium tracking-wider uppercase text-zinc-500 flex items-center justify-between">
            <span>Workspace</span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {roleLabels[user?.role] || 'User'}
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
                  `group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-white/[0.08] text-white font-semibold shadow-inner'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-white/[0.06] bg-[#09090b]/40">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] mb-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-zinc-200 truncate">{user?.name}</div>
            <div className="text-[10px] text-zinc-500 truncate">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-500/[0.08] transition duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-60 shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-150">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
