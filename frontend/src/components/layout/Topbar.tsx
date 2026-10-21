import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Search,
  Plus,
  Crosshair,
  Bell,
  Activity,
  Menu,
} from 'lucide-react';

interface TopbarProps {
  onOpenNewPlayerModal: () => void;
  onToggleMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenNewPlayerModal, onToggleMobileSidebar }) => {
  const { activeTab, backendStatus, isDemoMode, navigateToAssessment } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const titles: Record<string, { main: string; subtitle: string }> = {
    dashboard: { main: 'TELEMETRY COMMAND HUB', subtitle: 'Real-time talent tracking & cohort technique benchmarks' },
    players: { main: 'TALENT ROSTER DIRECTORY', subtitle: 'Database of tracked cricketers, biometric profiles & assessment states' },
    profile: { main: 'CRICKETER BIOMECHANICAL DOSSIER', subtitle: 'Fine-grained joint kinematics, timeline progression & scout evaluations' },
    assessment: { main: 'AI PERFORMANCE WORKSPACE', subtitle: 'Automated 17-point pose estimation, stroke phase segmentation & scoring' },
    compare: { main: 'BIOMETRICS COMPARISON TELEMETRY', subtitle: 'Head-to-head cohort differential analysis & coaching gap identification' },
    scouting: { main: 'SCOUT WORKSPACE & WATCHLIST', subtitle: 'Qualitative coach evaluations, multi-factor ratings & recruitment recommendations' },
    datasets: { main: 'DATASETS & SYSTEM TELEMETRY', subtitle: '5 Ingested research archives, adapter pipelines & active ML model registry' },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="h-20 bg-scout-bg/90 backdrop-blur-md border-b border-scout-border sticky top-0 z-30 px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile trigger & Screen Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-scout-muted hover:text-white border border-scout-border bg-scout-surface"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-base font-extrabold uppercase tracking-wider text-white">
              {current.main}
            </h1>
            <span className="hidden sm:inline-block w-1.5 h-1.5 bg-scout-neon rounded-full" />
            <span className="hidden sm:inline-block font-mono text-[11px] text-scout-dim uppercase tracking-wider">
              SCOUTAI // {activeTab.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-scout-muted hidden md:block mt-0.5 truncate max-w-xl">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Telemetry status, Search, and Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Connection status badge */}
        <div className="hidden sm:block">
          {backendStatus.isOnline && !isDemoMode ? (
            <Badge variant="live" />
          ) : (
            <Badge variant="demo" />
          )}
        </div>

        {/* Global Action: New Assessment */}
        <Button
          variant="primary"
          size="sm"
          icon={<Crosshair className="w-3.5 h-3.5" />}
          onClick={() => navigateToAssessment()}
          className="shadow-neon-sm"
        >
          Run AI Assessment
        </Button>

        {/* Global Action: Register Player */}
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
    </header>
  );
};
