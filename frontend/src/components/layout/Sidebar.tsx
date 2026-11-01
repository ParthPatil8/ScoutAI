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
  User,
  Activity,
  Upload,
  TrendingUp,
  LogOut,
  RefreshCw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

interface NavItem {
  tab: ScreenTab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    backendStatus, 
    isDemoMode, 
    setIsDemoMode, 
    shortlistIds,
    switchPortal,
    logout
  } = useApp();

  const isPlayer = currentUser?.role === 'PLAYER';

  // Role-specific navigation items
  const scoutNavItems: NavItem[] = [
    { tab: 'dashboard', label: 'Command Hub', icon: <LayoutDashboard className="w-4 h-4" /> },
    { tab: 'players', label: 'Talent Roster', icon: <Users className="w-4 h-4" /> },
    { tab: 'assessment', label: 'AI Assessment Lab', icon: <Crosshair className="w-4 h-4" /> },
    { tab: 'compare', label: 'Biometrics Compare', icon: <GitCompare className="w-4 h-4" /> },
    { tab: 'scouting', label: 'Watchlist & Ratings', icon: <BookmarkCheck className="w-4 h-4" />, badge: shortlistIds.length },
    { tab: 'datasets', label: 'Datasets & System', icon: <Database className="w-4 h-4" /> },
  ];

  const playerNavItems: NavItem[] = [
    { tab: 'player-portal', label: 'My Dossier', icon: <User className="w-4 h-4" /> },
    { tab: 'player-technique', label: 'Technique Radar', icon: <Activity className="w-4 h-4" /> },
    { tab: 'player-upload', label: 'Upload Net Session', icon: <Upload className="w-4 h-4" /> },
    { tab: 'player-progress', label: 'Progression History', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const navItems = isPlayer ? playerNavItems : scoutNavItems;

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#0a0c10] border-r border-white/5 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header with Official Logo */}
      <div className="h-20 flex items-center px-5 border-b border-white/5 bg-[#0e1015]/60">
        <div className="flex items-center gap-3 w-full overflow-hidden">
          <img
            src="/logo.png"
            alt="ScoutAI Logo"
            className="h-9 w-auto object-contain flex-shrink-0"
          />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-[9px] uppercase tracking-widest text-scout-neon font-bold leading-none">
                Intelligence Engine
              </span>
              <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                {isPlayer ? 'Player Portal' : 'Scout & Coach'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Role Pill Header */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
            isPlayer 
              ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' 
              : 'bg-scout-neon/10 border-scout-neon/20 text-scout-neon'
          }`}>
            <div className="flex items-center gap-2 truncate">
              {isPlayer ? <User size={13} /> : <ShieldCheck size={13} />}
              <span className="font-bold uppercase tracking-wider text-[11px] truncate">
                {isPlayer ? 'Player Mode' : 'Coach Mode'}
              </span>
            </div>
            <button
              onClick={switchPortal}
              className="text-[10px] underline hover:opacity-80 flex items-center gap-1 font-mono uppercase"
              title="Switch between Scout and Player views"
            >
              <RefreshCw size={10} /> Switch
            </button>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 py-3 px-3 space-y-1.5 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-gray-500 font-bold">
            {isPlayer ? 'Personal Workspace' : 'Scout Analytics'}
          </div>
        )}

        {navItems.map(item => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 font-mono text-xs font-medium tracking-wide uppercase transition-all duration-150 rounded-xl relative text-left ${
                isActive
                  ? 'bg-scout-neon/15 text-scout-neon font-bold border border-scout-neon/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-scout-neon' : 'text-gray-500'}`}>
                {item.icon}
              </span>

              {!collapsed && (
                <span className="flex-1 truncate">
                  {item.label}
                </span>
              )}

              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-scout-neon text-black rounded-md">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile & System Status */}
      <div className="p-3 border-t border-white/5 bg-[#0a0c10] space-y-2.5">
        {/* User Mini Profile Card */}
        {currentUser && (
          <div className="p-2.5 rounded-xl bg-[#12141a] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt=""
                className="w-8 h-8 rounded-lg object-cover border border-white/10 flex-shrink-0"
              />
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-white font-bold truncate text-xs font-mono leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono truncate">
                    {currentUser.title || currentUser.role}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        {/* Live Backend Connection Indicator */}
        <div className={`p-2 rounded-xl border text-[11px] font-mono flex items-center gap-2 ${
          backendStatus.isOnline
            ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-400'
            : 'bg-[#12141a] border-white/5 text-gray-500'
        }`}>
          {backendStatus.isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 animate-pulse" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          )}

          {!collapsed && (
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <span className="truncate">{backendStatus.isOnline ? 'FastAPI Connected' : 'Local Demo Sandbox'}</span>
              {backendStatus.isOnline && (
                <span className="text-[10px] text-emerald-400/80">{backendStatus.latencyMs}ms</span>
              )}
            </div>
          )}
        </div>

        {/* Expand/Collapse Toggle */}
        <div className="flex justify-end">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>
    </aside>
  );
};
