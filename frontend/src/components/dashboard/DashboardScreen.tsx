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
  Sparkles,
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

  // Cohort comparison chart data
  const cohortData = [
    { name: 'Arjun V.', score: 87.0, knee: 142.0, stride: 77.0 },
    { name: 'Kabir K.', score: 89.5, knee: 172.5, stride: 80.0 },
    { name: 'Devendra P.', score: 78.4, knee: 135.0, stride: 71.0 },
    { name: 'Rohan I.', score: 82.0, knee: 140.0, stride: 75.0 },
    { name: 'Sameer D.', score: 84.5, knee: 138.0, stride: 73.0 },
  ];

  // Radar for spotlight
  const spotlightRadarData = [
    { subject: 'Knee Flexion', player: 88, benchmark: 70 },
    { subject: 'Stride Ratio', player: 86, benchmark: 65 },
    { subject: 'Head Alignment', player: 92, benchmark: 75 },
    { subject: 'Backlift Arc', player: 84, benchmark: 68 },
    { subject: 'Downswing Plane', player: 85, benchmark: 70 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Welcoming Scout Command Header */}
      <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-scout-neon/10 border border-scout-neon/20 text-scout-neon font-mono text-xs font-semibold">
            <Sparkles size={13} />
            <span>Talent Scouting & Biomechanics Command</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-black uppercase text-white tracking-tight">
            High-Performance Cricket Scouting
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Automated skeletal pose tracking, 17-point joint kinematics, and normative cohort benchmarking to assist coaching and talent selection decisions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={<Crosshair className="w-4 h-4" />}
            onClick={() => navigateToAssessment()}
          >
            Run Video Assessment
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<Users className="w-4 h-4" />}
            onClick={onOpenNewPlayerModal}
          >
            Add Cricketer
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Talents Scouted"
          value={players.length}
          subtitle="Tracked in academy pool"
          icon={<Users className="w-5 h-5 text-scout-neon" />}
          trend={{ value: "+3 this month", isPositive: true }}
          highlight
        />
        <StatCard
          title="Video Assessments"
          value={assessments.length}
          subtitle="Full kinematics runs"
          icon={<Crosshair className="w-5 h-5 text-cyan-400" />}
          trend={{ value: "100% verified", isPositive: true }}
        />
        <StatCard
          title="Top Technique Index"
          value={topProspect?.latest_score ?? 89.5}
          unit="/100"
          subtitle={topProspect ? `${topProspect.display_name} (${topProspect.primary_role})` : 'Cohort leader'}
          icon={<Award className="w-5 h-5 text-amber-400" />}
          trend={{ value: "P90 Tier", isPositive: true }}
        />
        <StatCard
          title="Elbow Legality"
          value="100%"
          subtitle="All bowlers compliant with ICC 15°"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
          trend={{ value: "ICC Compliant", isPositive: true }}
        />
      </div>

      {/* 3. Main Grid: Prospect Spotlight + Cohort Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Prospect Spotlight Hero Card (5 cols) */}
        {topProspect && (
          <div className="lg:col-span-5 bg-[#12141a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-scout-neon" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                    Prospect Spotlight
                  </span>
                </div>
                <Badge role={topProspect.primary_role} size="sm" />
              </div>

              {/* Player Info */}
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={topProspect.avatar_url}
                  alt={topProspect.display_name}
                  className="w-16 h-16 rounded-xl object-cover border border-scout-neon/50 shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-mono text-base font-bold text-white truncate">
                    {topProspect.display_name}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {topProspect.current_team}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-gray-400">
                    <span>{topProspect.batting_hand.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{topProspect.height_cm} cm</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-2xl font-black text-scout-neon">
                    {topProspect.latest_score?.toFixed(1)}
                  </div>
                  <span className="text-[10px] font-mono uppercase text-gray-500">
                    Provisional
                  </span>
                </div>
              </div>

              {/* Radar Biomechanics Summary */}
              <div className="mt-4 h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={spotlightRadarData}>
                    <PolarGrid stroke="#222733" />
                    <PolarAngleAxis dataKey="subject" stroke="#8C95A6" tick={{ fill: '#8C95A6', fontSize: 10, fontFamily: 'monospace' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#323746" tick={false} />
                    <Radar name={topProspect.display_name} dataKey="player" stroke="#CCFF00" fill="#CCFF00" fillOpacity={0.25} strokeWidth={2} />
                    <Radar name="Benchmark" dataKey="benchmark" stroke="#555C6D" fill="#555C6D" fillOpacity={0.15} strokeWidth={1} strokeDasharray="3 3" />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Scout summary snippet */}
              <div className="mt-3 p-3 rounded-xl bg-[#0e1015] border border-white/5 text-xs text-gray-300 leading-relaxed font-mono">
                <span className="text-scout-neon font-bold">SCOUT OBS: </span>
                {topProspect.scout_notes}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
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
                Open Full Dossier
              </Button>
            </div>
          </div>
        )}

        {/* Right: Cohort Comparison Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#12141a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Activity size={14} className="text-scout-neon" />
                  Cohort Performance Comparison
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Provisional overall technique scores across active academy players
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<GitCompare size={12} />}
                onClick={() => navigateToCompare()}
              >
                Compare Engine
              </Button>
            </div>

            <div className="mt-6 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohortData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis domain={[60, 100]} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a0c10', borderColor: '#222733', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="score" fill="#CCFF00" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-400">
            <span>Normalized 0–100 Scale</span>
            <span className="text-scout-neon">Ranked by overall kinematic score</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Scouting Activity */}
      <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-scout-neon" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Recent Assessment Activity ({assessments.length})
            </h3>
          </div>
        </div>

        <div className="space-y-2.5">
          {assessments.slice(0, 3).map(a => (
            <div
              key={a.id}
              className="p-3.5 rounded-xl bg-[#0e1015] border border-white/5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-xs truncate">
                    {a.session_name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-scout-neon/15 text-scout-neon">
                    {a.assessment_type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                  {a.scout_summary || 'Analysis complete'}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-mono font-bold text-scout-neon text-sm">
                  {a.overall_provisional_score?.toFixed(1) || '85.0'}
                </span>
                <span className="text-[10px] text-gray-500 block font-mono">
                  {a.assessment_date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
