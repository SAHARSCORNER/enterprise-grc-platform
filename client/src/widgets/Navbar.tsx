import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, Shield, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore';
import { useThemeStore } from '../shared/stores/themeStore';
import { UserRole } from '@grc/shared';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const { user, switchRole } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roles = Object.values(UserRole);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Trigger */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-3 px-4 py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-400 hover:text-slate-200 text-sm transition-all w-72"
        >
          <Search className="w-4 h-4 text-cyan-400" />
          <span>Search employees, assets, risks...</span>
          <kbd className="ml-auto bg-slate-900 border border-slate-700 px-1.5 py-0.5 text-xs text-slate-500 rounded">Ctrl+K</kbd>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Dark/Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-cyan-400" />}
        </button>

        {/* Real-time Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="font-semibold text-sm text-slate-200">System Notifications</span>
                <span className="text-xs text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/50">Real-time</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800">
                  <p className="font-medium text-slate-200">Asset AST-20042 Assigned</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Assigned to Victoria Vance in Executive Leadership</p>
                </div>
                <div className="p-2.5 bg-slate-850 rounded-xl border border-slate-800">
                  <p className="font-medium text-amber-300">ISO 27001 Control A.5.1 Review Due</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Owner: Elena Compliance Lead</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher & Profile */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center space-x-3 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-200">{user?.name}</div>
              <div className="text-[10px] text-cyan-400 font-mono uppercase">{user?.role}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Switch Role Context</div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    user?.role === r ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{r.replace('_', ' ')}</span>
                  {user?.role === r && <Shield className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
