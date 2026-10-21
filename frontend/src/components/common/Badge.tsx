import React from 'react';
import type { CricketRole, AssessmentStatus, ScoutRecommendation } from '../../types';

interface BadgeProps {
  role?: CricketRole;
  status?: AssessmentStatus;
  recommendation?: ScoutRecommendation;
  variant?: 'neon' | 'muted' | 'provisional' | 'live' | 'demo' | 'outline' | 'amber';
  label?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  role,
  status,
  recommendation,
  variant,
  label,
  size = 'md'
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (role) {
    const roleStyles: Record<CricketRole, { bg: string; text: string; border: string }> = {
      BATSMAN: { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60' },
      BOWLER: { bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-800/60' },
      ALL_ROUNDER: { bg: 'bg-cyan-950/60', text: 'text-cyan-400', border: 'border-cyan-800/60' },
      WICKET_KEEPER: { bg: 'bg-purple-950/60', text: 'text-purple-400', border: 'border-purple-800/60' },
    };
    const s = roleStyles[role] || { bg: 'bg-gray-800', text: 'text-gray-300', border: 'border-gray-700' };
    return (
      <span className={`inline-flex items-center font-mono font-semibold uppercase tracking-wider rounded-none border ${s.bg} ${s.text} ${s.border} ${sizeClasses}`}>
        {role.replace('_', ' ')}
      </span>
    );
  }

  if (status) {
    const statusStyles: Record<AssessmentStatus, { bg: string; text: string; border: string }> = {
      COMPLETED: { bg: 'bg-scout-darkGreen', text: 'text-scout-neon', border: 'border-scout-neon/40' },
      PROCESSING: { bg: 'bg-blue-950/70', text: 'text-blue-400', border: 'border-blue-700 animate-pulse' },
      QUEUED: { bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-700' },
      DRAFT: { bg: 'bg-gray-900', text: 'text-gray-400', border: 'border-gray-700' },
      FAILED: { bg: 'bg-rose-950/80', text: 'text-rose-400', border: 'border-rose-700' },
    };
    const s = statusStyles[status] || { bg: 'bg-gray-900', text: 'text-gray-400', border: 'border-gray-700' };
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-semibold uppercase tracking-wider border ${s.bg} ${s.text} ${s.border} ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {status}
      </span>
    );
  }

  if (recommendation) {
    const recStyles: Record<ScoutRecommendation, { bg: string; text: string; border: string }> = {
      SHORTLIST: { bg: 'bg-scout-neon/15', text: 'text-scout-neon', border: 'border-scout-neon/60 shadow-neon-sm' },
      ACADEMY_SELECT: { bg: 'bg-emerald-950/70', text: 'text-emerald-400', border: 'border-emerald-600' },
      MONITOR: { bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-700' },
      DEVELOPMENT_POOL: { bg: 'bg-blue-950/60', text: 'text-blue-400', border: 'border-blue-700' },
      REJECT: { bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-800' },
    };
    const s = recStyles[recommendation];
    return (
      <span className={`inline-flex items-center font-mono font-bold uppercase tracking-wider border ${s.bg} ${s.text} ${s.border} ${sizeClasses}`}>
        {recommendation.replace('_', ' ')}
      </span>
    );
  }

  // Variant badges
  if (variant === 'provisional') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        PROVISIONAL ESTIMATE
      </span>
    );
  }

  if (variant === 'live') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-bold text-scout-neon bg-scout-neon/10 border border-scout-neon/40 shadow-neon-sm ${sizeClasses}`}>
        <span className="w-2 h-2 rounded-full bg-scout-neon animate-ping" />
        LIVE BACKEND CONNECTED
      </span>
    );
  }

  if (variant === 'demo') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-semibold text-gray-300 bg-gray-800/80 border border-gray-600 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        DEMO SANDBOX
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-mono tracking-wider bg-scout-card text-scout-muted border border-scout-border ${sizeClasses}`}>
      {label}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: CricketRole }> = ({ role }) => {
  return <Badge role={role} size="sm" />;
};

export const RecommendationBadge: React.FC<{ recommendation: ScoutRecommendation }> = ({ recommendation }) => {
  return <Badge recommendation={recommendation} size="sm" />;
};

