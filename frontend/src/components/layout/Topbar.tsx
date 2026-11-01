import React from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Plus,
  Crosshair,
  Upload,
  RefreshCw,
  LogOut,
  User,
  ShieldCheck,
  Menu,
} from 'lucide-react';

interface TopbarProps {
  onOpenNewPlayerModal: () => void;
  onToggleMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenNewPlayerModal, onToggleMobileSidebar }) => {
  const { 
    currentUser, 
    activeTab, 
    backendStatus, 
    isDemoMode, 
    navigateToAssessment,
    switchPortal,
    logout 
  } = useApp();

  const isPlayer = currentUser?.role === 'PLAYER';

  const titles: Record<string, { main: string; subtitle: string }> = {
    // Scout screens
    dashboard: { main: 'Scout Command Hub', subtitle: 'Real-time talent tracking & cohort technique benchmarks' },
    players: { main: 'Talent Roster Directory', subtitle: 'Searchable database of tracked cricketers, profiles & metrics' },
    profile: { main: 'Cricketer Biomechanical Dossier', subtitle: 'Detailed joint kinematics, timeline progression & scout reviews' },
    assessment: { main: 'AI Performance Workspace', subtitle: '17-Point pose estimation, stroke phase segmentation & scoring' },
    compare: { main: 'Biometrics Comparison Engine', subtitle: 'Head-to-head cohort differential analysis & coaching gap identification' },
    scouting: { main: 'Scout Workspace & Watchlist', subtitle: 'Coach evaluations, 4-pillar ratings & recruitment decisions' },
    datasets: { main: 'Datasets & System Telemetry', subtitle: 'Ingested research archives, adapter pipelines & ML model registry' },
    // Player screens
    'player-portal': { main: 'My Performance Dossier', subtitle: 'Your personal technique metrics, coaching advice, and latest scores' },
    'player-technique': { main: 'My Biomechanical Breakdown', subtitle: 'Radar angular kinematics (knee flexion, stride ratio, head lock)' },
    'player-upload': { main: 'Upload Net Session', subtitle: 'Submit a training clip for automated kinematic scoring' },
    'player-progress': { main: 'My Practice Progression', subtitle: 'Session-by-session technical progress trajectory' },
  };

  const current = titles[activeTab] || (isPlayer ? titles['player-portal'] : titles.dashboard);

  return (
    <header className="h-20 bg-[#08090b]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-30 px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile trigger & Clean Screen Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg border border-white/10 bg-[#12141a]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-mono text-base font-bold text-white tracking-tight">
              {current.main}
            </h1>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
              isPlayer 
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' 
                : 'bg-scout-neon/15 text-scout-neon border border-scout-neon/30'
            }`}>
              {isPlayer ? 'Player Portal' : 'Scout Portal'}
            </span>
          </div>
          <p className="text-xs text-gray-400 hidden sm:block mt-0.5 truncate max-w-lg">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick Switcher, Actions, and User Info */}
      <div className="flex items-center gap-3">
        {/* Switch Portal Button */}
        <button
          onClick={switchPortal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-[#12141a] text-xs font-mono text-gray-300 hover:text-white transition-colors"
          title={`Switch to ${isPlayer ? 'Scout' : 'Player'} Mode`}
        >
          <RefreshCw size={12} className="text-scout-neon" />
          <span>Switch to {isPlayer ? 'Coach View' : 'Player View'}</span>
        </button>

        {/* Role-specific Primary CTA */}
        {isPlayer ? (
          <Button
            variant="primary"
            size="sm"
            icon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => navigateToAssessment()}
          >
            Upload Training Clip
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Crosshair className="w-3.5 h-3.5" />}
              onClick={() => navigateToAssessment()}
            >
              Run Assessment
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={onOpenNewPlayerModal}
              className="hidden md:inline-flex"
            >
              Add Cricketer
            </Button>
          </div>
        )}

        {/* Sign Out Pill */}
        <button
          onClick={logout}
          className="p-2 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
