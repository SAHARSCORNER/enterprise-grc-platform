import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  HardDrive,
  Network,
  FileSearch,
  LifeBuoy,
  Shield,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navItems = [
    { label: 'Executive Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Employees', path: '/employees', icon: Users },
    { label: 'Assets', path: '/assets', icon: HardDrive },
    { label: 'Network Diagram', path: '/graph', icon: Network },
    { label: 'Audits', path: '/audits', icon: FileSearch },
    { label: 'Ticket Raise', path: '/tickets', icon: LifeBuoy, highlight: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand */}
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-sm tracking-wide">ENTERPRISE GRC</div>
            <div className="text-[10px] text-cyan-400 font-mono tracking-wider">ADMIN PANEL</div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-950/40'
                      : item.highlight
                      ? 'text-cyan-400 hover:bg-slate-800/80 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`
                }
              >
                <Icon className={`w-4 h-4 ${item.highlight ? 'text-cyan-400' : ''}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-slate-800 m-3 bg-slate-950/80 rounded-2xl border space-y-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-800">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Admin User'}</p>
            <p className="text-[10px] font-mono text-cyan-400 truncate">{user?.role || 'ADMINISTRATOR'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-1.5 px-3 bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-xs rounded-xl border border-slate-800 flex items-center justify-center space-x-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
