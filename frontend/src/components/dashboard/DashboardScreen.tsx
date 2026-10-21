import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { PlayerProfile, AssessmentSession } from '../../types';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Users,
  Crosshair,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Flame,
  Award,
  Bookmark,
  GitCompare,
  Activity,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';

export const DashboardScreen: React.FC<{ onOpenNewPlayerModal: () => void }> = ({ onOpenNewPlayerModal }) => {
  const { navigateToPlayer, navigateToAssessment, navigateToCompare, isShortlisted, toggleShortlist } = useApp();
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [assessments, setAssessments] = useState<AssessmentSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      const [playersRes, assessmentsRes] = await Promise.all([
        ApiService.getPlayers(),
        ApiService.getAssessments(),
      ]);
      setPlayers(playersRes.items);
      setAssessments(assessmentsRes.items);
      setLoading(false);
    }
    loadDashboardData();
  }, []);

  const topProspect = players[0]; // Arjun Verma

  // Biomechanical cohort chart data
  const cohortData = [
    { name: 'Arjun Verma', knee: 142.0, stride: 77.0, head: 91.0, score: 87.0 },
    { name: 'Kabir Khan', knee: 172.5, stride: 80.0, head: 88.0, score: 89.5 },
    { name: 'Devendra P.', knee: 135.0, stride: 71.0, head: 82.0, score: 78.4 },
    { name: 'Rohan Iyer', knee: 140.0, stride: 75.0, head: 85.0, score: 82.0 },
    { name: 'Sameer D.', knee: 138.0, stride: 73.0, head: 84.0, score: 84.5 },
  ];

  // Radar for spotlight
  const spotlightRadarData = [
    { subject: 'Knee Flexion', player: 88, benchmark: 70 },
    { subject: 'Stride Ratio', player: 86, benchmark: 65 },
    { subject: 'Head Align', player: 92, benchmark: 75 },
    { subject: 'Backlift Arc', player: 84, benchmark: 68 },
    { subject: 'Downswing Speed', player: 85, benchmark: 70 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Performance Command Header */}
      <div className="relative bg-gradient-to-r from-scout-card via-[#11141A] to-scout-bg p-6 border border-scout-border hud-border overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-scout-neon/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-scout-neon text-black font-mono font-extrabold text-[10px] uppercase tracking-widest">
                SCOUT COMMAND
              </span>
              <span className="font-mono text-xs text-scout-neon font-semibold uppercase tracking-wider">
                • HIGH PERFORMANCE TELEMETRY ACTIVE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-mono font-black uppercase tracking-tight text-white">
              PRECISION CRICKET TALENT IDENTIFICATION
            </h1>
            <p className="text-xs text-scout-muted max-w-2xl leading-relaxed">
              Real-time biomechanical joint kinematics, 17-point pose telemetry, and role-specific cohort benchmarking.
              Empowering national scouts with interpretable, data-backed technical diagnostics.
            </p>
          </div>

          {/* Quick Action Matrix */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              icon={<Crosshair className="w-4 h-4" />}
              onClick={() => navigateToAssessment()}
            >
              Start AI Assessment
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<Users className="w-4 h-4" />}
              onClick={onOpenNewPlayerModal}
            >
              Register Prospect
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<GitCompare className="w-4 h-4" />}
              onClick={() => navigateToCompare()}
            >
              Telemetry Compare
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Overview Telemetry Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Talents Scouted"
          value={players.length}
          subtitle="Tracked in academy pool"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: "+3 this month", isPositive: true }}
          highlight
        />
        <StatCard
          title="Assessments Run"
          value={assessments.length}
          subtitle="Full kinematics analyses"
          icon={<Crosshair className="w-5 h-5" />}
          trend={{ value: "100% verified", isPositive: true }}
        />
        <StatCard
          title="Peak Technique Score"
          value={topProspect?.latest_score ?? 89.5}
          unit="/100"
          subtitle={topProspect ? `${topProspect.display_name} (${topProspect.primary_role})` : 'Cohort leader'}
          icon={<Award className="w-5 h-5 text-scout-neon" />}
          trend={{ value: "Elite Tier", isPositive: true }}
        />
        <StatCard
          title="Biomechanical Legality"
          value="100%"
          subtitle="All bowlers compliant with ICC 15°"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
          trend={{ value: "< 15° limit", isPositive: true }}
        />
      </div>

      {/* 3. Main Grid: Prospect Spotlight + Cohort Kinematics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Prospect Spotlight Hero Card (5 cols) */}
        {topProspect && (
          <div className="lg:col-span-5 bg-scout-card border border-scout-border hud-border p-5 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-scout-border">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-scout-neon" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                    PROSPECT SPOTLIGHT
                  </span>
                </div>
                <Badge role={topProspect.primary_role} size="sm" />
              </div>

              {/* Player Info */}
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={topProspect.avatar_url}
                  alt={topProspect.display_name}
                  className="w-16 h-16 object-cover border border-scout-neon/50 shadow-neon-sm"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-mono text-lg font-black text-white truncate uppercase">
                    {topProspect.display_name}
                  </h3>
                  <p className="text-xs text-scout-muted truncate">
                    {topProspect.current_team}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-scout-dim">
                    <span>{topProspect.batting_hand.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{topProspect.height_cm} cm</span>
                    <span>•</span>
                    <span>{topProspect.weight_kg} kg</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-2xl font-black text-scout-neon">
                    {topProspect.latest_score?.toFixed(1)}
                  </div>
                  <span className="text-[10px] font-mono uppercase text-scout-muted">
                    Provisional
                  </span>
                </div>
              </div>

              {/* Radar Biomechanics Summary */}
              <div className="mt-4 h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={spotlightRadarData}>
                    <PolarGrid stroke="#242833" />
                    <PolarAngleAxis dataKey="subject" stroke="#8C95A6" tick={{ fill: '#8C95A6', fontSize: 10, fontFamily: 'monospace' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#323746" tick={false} />
                    <Radar name={topProspect.display_name} dataKey="player" stroke="#CCFF00" fill="#CCFF00" fillOpacity={0.25} strokeWidth={2} />
                    <Radar name="Academy Benchmark" dataKey="benchmark" stroke="#555C6D" fill="#555C6D" fillOpacity={0.15} strokeWidth={1} strokeDasharray="3 3" />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Scout summary snippet */}
              <div className="mt-2 p-3 bg-scout-surface border border-scout-border/60 text-xs text-scout-muted leading-relaxed font-mono">
                <span className="text-scout-neon font-bold">KEY TELEMETRY: </span>
                {topProspect.scout_notes}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-5 pt-4 border-t border-scout-border flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                icon={<Bookmark className="w-3.5 h-3.5" />}
                onClick={() => toggleShortlist(topProspect.id)}
              >
                {isShortlisted(topProspect.id) ? 'Shortlisted' : 'Shortlist'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => navigateToPlayer(topProspect.id)}
              >
                Open Dossier
              </Button>
            </div>
          </div>
        )}

        {/* Right: Cohort Biomechanical Comparison Chart (7 cols) */}
        <div className="lg:col-span-7 bg-scout-card border border-scout-border hud-border p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-scout-border">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-scout-neon" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  COHORT TECHNIQUE SCORE TELEMETRY
                </span>
              </div>
              <span className="font-mono text-[11px] text-scout-dim uppercase">
                5 ACTIVE PROSPECTS
              </span>
            </div>

            <p className="text-xs text-scout-muted mt-3">
              Side-by-side composite technique ratings derived from lead-knee flexion, stride ratio, and head alignment:
            </p>

            {/* Bar Chart */}
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohortData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#8C95A6" tick={{ fill: '#8C95A6', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis domain={[0, 100]} stroke="#8C95A6" tick={{ fill: '#8C95A6', fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111317', borderColor: '#CCFF00', color: '#fff', fontFamily: 'monospace', fontSize: '11px' }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <Bar dataKey="score" name="Overall Technique Score" fill="#CCFF00" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Roster Links */}
          <div className="mt-4 pt-4 border-t border-scout-border grid grid-cols-2 sm:grid-cols-4 gap-2">
            {players.slice(0, 4).map(p => (
              <button
                key={p.id}
                onClick={() => navigateToPlayer(p.id)}
                className="p-2 bg-scout-surface border border-scout-border/60 hover:border-scout-neon/50 text-left transition-all"
              >
                <div className="font-mono text-xs font-bold text-white truncate">
                  {p.display_name}
                </div>
                <div className="text-[10px] font-mono text-scout-neon">
                  {p.latest_score?.toFixed(1) || '75.0'} pts
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Recent Scouting Activity & Assessment Timeline */}
      <div className="bg-scout-card border border-scout-border hud-border p-5">
        <div className="flex items-center justify-between pb-3 border-b border-scout-border mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-scout-neon" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              RECENT ASSESSMENT & SCOUTING ACTIVITY LOG
            </span>
          </div>
          <span className="font-mono text-[11px] text-scout-dim">
            LIVE AUDIT TRAIL
          </span>
        </div>

        <div className="space-y-3">
          {assessments.slice(0, 4).map((a, i) => (
            <div
              key={a.id || i}
              className="p-3.5 bg-scout-surface border border-scout-border hover:border-scout-borderLight flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-scout-card border border-scout-border text-scout-neon flex-shrink-0">
                  <Crosshair className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-white">
                      {a.session_name}
                    </span>
                    <Badge status={a.status} size="sm" />
                    <Badge variant="provisional" size="sm" />
                  </div>
                  <p className="text-xs text-scout-muted mt-1 leading-snug line-clamp-1">
                    {a.scout_summary || 'Biomechanical evaluation completed with kinematic joint tracking.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 text-xs font-mono flex-shrink-0">
                <span className="text-scout-dim">
                  {a.assessment_date}
                </span>
                <div className="text-right">
                  <span className="text-scout-neon font-bold text-sm">
                    {a.overall_provisional_score ? `${a.overall_provisional_score.toFixed(1)}/100` : 'PENDING'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToPlayer(a.player_id)}
                >
                  View Dossier
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
