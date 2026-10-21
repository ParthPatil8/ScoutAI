import React from 'react';
import { useApp, ScreenTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Crosshair,
  GitCompare,
  BookmarkCheck,
  Database,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { activeTab, setActiveTab, backendStatus, isDemoMode, setIsDemoMode, shortlistIds } = useApp();

  const navItems: { tab: ScreenTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'dashboard', label: 'Telemetry Hub', icon: <LayoutDashboard className="w-5 h-5" /> },
    { tab: 'players', label: 'Talent Roster', icon: <Users className="w-5 h-5" /> },
    { tab: 'assessment', label: 'AI Assessment', icon: <Crosshair className="w-5 h-5" /> },
    { tab: 'compare', label: 'Biometrics Compare', icon: <GitCompare className="w-5 h-5" /> },
    { tab: 'scouting', label: 'Scout Workspace', icon: <BookmarkCheck className="w-5 h-5" />, badge: shortlistIds.length },
    { tab: 'datasets', label: 'Datasets & System', icon: <Database className="w-5 h-5" /> },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-scout-bg border-r border-scout-border flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header with Official Logo */}
      <div className="h-20 flex items-center px-4 border-b border-scout-border/80 bg-scout-surface/40">
        <div className="flex items-center gap-3 w-full overflow-hidden">
          <img
            src="/logo.png"
            alt="ScoutAI Logo"
            className="h-10 w-auto object-contain flex-shrink-0"
          />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-[9px] uppercase tracking-widest text-scout-neon font-bold leading-none">
                Intelligence Engine
              </span>
              <span className="font-mono text-[10px] text-scout-dim uppercase tracking-wider mt-1">
                v1.0.0 Pro
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-scout-dim font-bold">
            Analytics & Scouting
          </div>
        )}

        {navItems.map(item => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3.5 px-3 py-3 font-mono text-xs font-semibold tracking-wider uppercase transition-all duration-150 rounded-none relative group text-left ${
                isActive
                  ? 'bg-scout-surface text-scout-neon border-l-2 border-scout-neon shadow-neon-sm'
                  : 'text-scout-muted hover:text-white hover:bg-scout-surface/50 border-l-2 border-transparent'
              }`}
            >
              <span className={`flex-shrink-0 transition-transform duration-150 ${isActive ? 'text-scout-neon scale-105' : 'text-scout-muted group-hover:text-white'}`}>
                {item.icon}
              </span>

              {!collapsed && (
                <span className="flex-1 truncate">
                  {item.label}
                </span>
              )}

              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-scout-neon text-black rounded-none">
                  {item.badge}
                </span>
              )}

              {/* Hover indicator on right */}
              {isActive && (
                <span className="absolute right-2 w-1.5 h-1.5 bg-scout-neon rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* System Status & Sandbox Toggle */}
      <div className="p-3 border-t border-scout-border bg-scout-surface/30 space-y-2.5">
        {/* Live Backend Connection Indicator */}
        <div className={`p-2.5 border transition-all text-xs font-mono flex items-center gap-2.5 ${
          backendStatus.isOnline
            ? 'bg-scout-darkGreen/50 border-scout-neon/30 text-scout-neon'
            : 'bg-scout-card border-scout-border text-scout-muted'
        }`}>
          {backendStatus.isOnline ? (
            <Wifi className="w-4 h-4 text-scout-neon flex-shrink-0 animate-pulse" />
          ) : (
            <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
          )}

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-bold flex items-center justify-between">
                <span>{backendStatus.isOnline ? 'BACKEND LIVE' : 'SANDBOX MODE'}</span>
                {backendStatus.isOnline && (
                  <span className="text-[10px] text-scout-neon/80 font-normal">{backendStatus.latencyMs}ms</span>
                )}
              </div>
              <p className="text-[10px] text-scout-dim truncate">
                {backendStatus.isOnline 
                  ? `Dialect: ${backendStatus.dialect?.toUpperCase()}` 
                  : 'FastAPI Offline / Local'}
              </p>
            </div>
          )}
        </div>

        {/* Demo Mode Toggle */}
        {!collapsed && (
          <div className="flex items-center justify-between px-2 py-1.5 bg-scout-card/60 border border-scout-border/60 text-[11px] font-mono">
            <span className="text-scout-muted">Demo Sandbox</span>
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                isDemoMode ? 'bg-scout-neon' : 'bg-scout-border'
              }`}
            >
              <div
                className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isDemoMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* User Mini Profile */}
        <div className="pt-1 flex items-center justify-between text-xs font-mono text-scout-dim">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 bg-scout-border border border-scout-neon/40 flex items-center justify-center text-scout-neon flex-shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-white font-bold truncate text-[11px]">Senior Scout</p>
                <p className="text-[9px] text-scout-dim truncate">BCCI / NCA Portal</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-scout-muted hover:text-white hover:bg-scout-surface border border-scout-border flex-shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
