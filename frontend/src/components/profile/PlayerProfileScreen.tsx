import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { PlayerProfile, AssessmentSession, ScoutEvaluation } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Crosshair,
  Bookmark,
  GitCompare,
  ArrowLeft,
  Calendar,
  Activity,
  Award,
  Video,
  FileText,
  Clock,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export const PlayerProfileScreen: React.FC = () => {
  const { selectedPlayerId, setActiveTab, addToCompare, toggleShortlist, isShortlisted, navigateToAssessment } = useApp();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [assessments, setAssessments] = useState<AssessmentSession[]>([]);
  const [evaluations, setEvaluations] = useState<ScoutEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setProfileTab] = useState<'telemetry' | 'history' | 'evaluations' | 'media'>('telemetry');

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const [playerRes, assessmentsRes, evalRes] = await Promise.all([
        ApiService.getPlayerById(selectedPlayerId),
        ApiService.getAssessments(selectedPlayerId),
        ApiService.getEvaluations(selectedPlayerId),
      ]);
      setPlayer(playerRes.player);
      setAssessments(assessmentsRes.items);
      setEvaluations(evalRes.items);
      setLoading(false);
    }
    loadProfile();
  }, [selectedPlayerId]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3 font-mono text-xs text-scout-muted">
        <div className="w-8 h-8 border-2 border-scout-neon border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="uppercase tracking-widest">LOADING PROSPECT BIOMECHANICAL DOSSIER...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="bg-scout-card border border-scout-border p-12 text-center space-y-4">
        <p className="font-mono text-sm uppercase text-scout-muted">PROSPECT DOSSIER NOT FOUND</p>
        <Button variant="primary" size="sm" onClick={() => setActiveTab('players')}>
          Back to Roster
        </Button>
      </div>
    );
  }

  const latestAssessment = assessments[0];
  const metrics = latestAssessment?.metrics || [];

  // Progression Line Data
  const progressData = assessments
    .slice()
    .reverse()
    .map(a => ({
      date: a.assessment_date,
      score: a.overall_provisional_score || 70.0,
      session: a.session_name,
    }));

  // Radar Data
  const radarData = metrics.map(m => ({
    metric: m.metric_name.replace(/_/g, ' '),
    player: Math.min(100, Math.max(10, m.benchmark_percentile || (m.value > 100 ? m.value / 2 : m.value))),
    benchmark: 70,
  }));

  const shortlisted = isShortlisted(player.id);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('players')}
          className="inline-flex items-center gap-2 text-xs font-mono text-scout-muted hover:text-scout-neon transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Talent Roster</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant={shortlisted ? 'primary' : 'secondary'}
            size="sm"
            icon={<Bookmark className="w-3.5 h-3.5" />}
            onClick={() => toggleShortlist(player.id)}
          >
            {shortlisted ? 'In Watchlist' : 'Add to Watchlist'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<GitCompare className="w-3.5 h-3.5" />}
            onClick={() => addToCompare(player.id)}
          >
            Add to Compare
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Crosshair className="w-3.5 h-3.5" />}
            onClick={() => navigateToAssessment(player.id)}
          >
            Trigger New Assessment
          </Button>
        </div>
      </div>

      {/* Hero Dossier Banner */}
      <div className="relative bg-scout-card border border-scout-border hud-border p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={player.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={player.display_name}
              className="w-20 h-20 md:w-24 md:h-24 object-cover border-2 border-scout-neon shadow-neon-sm"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge role={player.primary_role} />
                <span className="font-mono text-xs text-scout-dim uppercase">
                  ID: {player.id}
                </span>
                <Badge variant="provisional" size="sm" />
              </div>

              <h1 className="text-2xl md:text-3xl font-mono font-black text-white uppercase tracking-tight">
                {player.display_name}
              </h1>

              <p className="text-xs font-mono text-scout-muted">
                {player.current_team} • {player.nationality}
              </p>

              <div className="flex items-center gap-4 text-xs font-mono text-scout-dim pt-1 flex-wrap">
                <span><b className="text-white">Hand:</b> {player.batting_hand.replace('_', ' ')}</span>
                <span>•</span>
                <span><b className="text-white">Style:</b> {player.bowling_style !== 'NONE' ? player.bowling_style.replace(/_/g, ' ') : 'Specialist Batsman'}</span>
                <span>•</span>
                <span><b className="text-white">Height:</b> {player.height_cm || 180} cm</span>
                <span>•</span>
                <span><b className="text-white">Weight:</b> {player.weight_kg || 72} kg</span>
              </div>
            </div>
          </div>

          {/* KPI Score Readout */}
          <div className="bg-scout-surface border border-scout-border p-4 min-w-[180px] text-center md:text-right">
            <span className="text-[10px] font-mono uppercase tracking-widest text-scout-muted block mb-1">
              PROVISIONAL TECHNIQUE RATING
            </span>
            <div className="text-4xl font-mono font-black text-scout-neon">
              {player.latest_score?.toFixed(1) || '87.0'}
              <span className="text-xs text-scout-dim font-normal">/100</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center justify-center md:justify-end gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Cohort Top 8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-scout-border bg-scout-card/50">
        {[
          { key: 'telemetry', label: 'Biomechanical Telemetry', icon: <Activity className="w-4 h-4" /> },
          { key: 'history', label: `Assessment History (${assessments.length})`, icon: <Clock className="w-4 h-4" /> },
          { key: 'evaluations', label: `Scout Evaluations (${evaluations.length})`, icon: <Award className="w-4 h-4" /> },
          { key: 'media', label: 'Media & Keypoints Video', icon: <Video className="w-4 h-4" /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setProfileTab(t.key as any)}
            className={`flex items-center gap-2 px-5 py-3.5 font-mono text-xs uppercase tracking-wider font-bold transition-all border-b-2 ${
              activeTab === t.key
                ? 'border-scout-neon text-scout-neon bg-scout-surface'
                : 'border-transparent text-scout-muted hover:text-white hover:bg-scout-surface/30'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Biomechanical Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar Chart (5 cols) */}
          <div className="lg:col-span-5 bg-scout-card border border-scout-border hud-border p-5">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white pb-3 border-b border-scout-border flex items-center gap-2">
              <Activity className="w-4 h-4 text-scout-neon" />
              <span>COHORT KINEMATICS RADAR</span>
            </h3>

            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData.length > 0 ? radarData : [
                  { metric: 'Knee Flexion', player: 88, benchmark: 70 },
                  { metric: 'Stride Ratio', player: 86, benchmark: 65 },
                  { metric: 'Head Alignment', player: 92, benchmark: 75 },
                  { metric: 'Backlift Angle', player: 84, benchmark: 68 },
                  { metric: 'Downswing Speed', player: 85, benchmark: 70 }
                ]}>
                  <PolarGrid stroke="#242833" />
                  <PolarAngleAxis dataKey="metric" stroke="#8C95A6" tick={{ fill: '#8C95A6', fontSize: 10, fontFamily: 'monospace' }} />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#323746" tick={false} />
                  <Radar name={player.display_name} dataKey="player" stroke="#CCFF00" fill="#CCFF00" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name="Academy Cohort" dataKey="benchmark" stroke="#555C6D" fill="#555C6D" fillOpacity={0.15} strokeWidth={1} strokeDasharray="3 3" />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] font-mono text-scout-dim text-center mt-2">
              Percentile rank comparison against National Cricket Academy cohort baselines.
            </p>
          </div>

          {/* Metric Tiles and Detailed Table (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-scout-card border border-scout-border hud-border p-5">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white pb-3 border-b border-scout-border flex items-center justify-between">
                <span>MEASURED BIOMECHANICAL INDICATORS</span>
                <span className="text-[10px] text-scout-neon font-normal">SESSION: {latestAssessment?.session_name || 'Latest'}</span>
              </h3>

              <div className="mt-4 space-y-3">
                {metrics.map(m => (
                  <div
                    key={m.id}
                    className="p-3.5 bg-scout-surface border border-scout-border/70 hover:border-scout-borderLight flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white uppercase">
                          {m.metric_name.replace(/_/g, ' ')}
                        </span>
                        <span className="px-1.5 py-0.5 bg-scout-card text-[10px] font-mono text-scout-muted border border-scout-border">
                          {m.category}
                        </span>
                      </div>
                      <p className="text-xs text-scout-muted mt-1 leading-snug">
                        {m.interpretation || 'Tracked via monocular automated pose estimation.'}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0 font-mono">
                      <div className="text-base font-black text-scout-neon">
                        {m.value} <span className="text-xs font-normal text-white">{m.unit}</span>
                      </div>
                      <div className="text-[11px] text-emerald-400">
                        {m.benchmark_percentile ? `${m.benchmark_percentile}th percentile` : 'Compliant'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Assessment History & Progression */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Progress Chart */}
          {progressData.length > 1 && (
            <div className="bg-scout-card border border-scout-border hud-border p-5">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white pb-3 border-b border-scout-border flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-scout-neon" />
                <span>TECHNIQUE SCORE PROGRESSION OVER TIME</span>
              </h3>
              <p className="text-xs text-scout-muted mt-2">
                Visualizing technical growth from baseline net session to quarterly review:
              </p>
              <div className="h-56 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <XAxis dataKey="date" stroke="#8C95A6" tick={{ fill: '#8C95A6', fontSize: 11, fontFamily: 'monospace' }} />
                    <YAxis domain={[50, 100]} stroke="#8C95A6" tick={{ fill: '#8C95A6', fontSize: 10, fontFamily: 'monospace' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111317', borderColor: '#CCFF00', color: '#fff', fontFamily: 'monospace', fontSize: '11px' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#CCFF00" strokeWidth={3} dot={{ fill: '#CCFF00', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* History List */}
          <div className="space-y-4">
            {assessments.map(a => (
              <div
                key={a.id}
                className="bg-scout-card border border-scout-border hud-border p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-scout-border">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-mono text-sm font-bold text-white uppercase">
                        {a.session_name}
                      </h4>
                      <Badge status={a.status} size="sm" />
                      <Badge variant="provisional" size="sm" />
                    </div>
                    <span className="text-xs font-mono text-scout-dim flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Date: {a.assessment_date} • Duration: {a.execution_duration_sec || 1.5}s
                    </span>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-2xl font-black text-scout-neon">
                      {a.overall_provisional_score?.toFixed(1) || 'PENDING'}
                    </span>
                    <span className="text-xs text-scout-dim block">Score</span>
                  </div>
                </div>

                <p className="text-xs text-scout-muted leading-relaxed font-mono">
                  <b className="text-white">Summary: </b>
                  {a.scout_summary}
                </p>

                {a.metrics && a.metrics.length > 0 && (
                  <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {a.metrics.map(m => (
                      <div key={m.id} className="p-2 bg-scout-surface border border-scout-border/60 text-xs font-mono">
                        <span className="text-scout-dim text-[10px] block truncate uppercase">
                          {m.metric_name.replace(/_/g, ' ')}
                        </span>
                        <span className="text-white font-bold">
                          {m.value} {m.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Scout Evaluations */}
      {activeTab === 'evaluations' && (
        <div className="space-y-4">
          {evaluations.length === 0 ? (
            <div className="bg-scout-card border border-scout-border p-10 text-center font-mono text-xs text-scout-muted">
              NO COACH EVALUATIONS RECORDED YET FOR THIS PROSPECT.
            </div>
          ) : (
            evaluations.map(ev => (
              <div
                key={ev.id}
                className="bg-scout-card border border-scout-border hud-border p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-scout-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-mono text-sm font-bold text-white">
                        {ev.evaluator_name}
                      </h4>
                      <Badge recommendation={ev.scout_recommendation} size="sm" />
                    </div>
                    <span className="text-xs font-mono text-scout-dim">
                      {ev.evaluator_organization} • {ev.evaluation_date}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs text-center">
                    <div className="p-2 bg-scout-surface border border-scout-border">
                      <span className="text-[10px] text-scout-dim block">TECH</span>
                      <span className="text-white font-bold">{ev.technical_rating}/10</span>
                    </div>
                    <div className="p-2 bg-scout-surface border border-scout-border">
                      <span className="text-[10px] text-scout-dim block">TACT</span>
                      <span className="text-white font-bold">{ev.tactical_rating}/10</span>
                    </div>
                    <div className="p-2 bg-scout-surface border border-scout-border">
                      <span className="text-[10px] text-scout-dim block">PHYS</span>
                      <span className="text-white font-bold">{ev.physical_rating}/10</span>
                    </div>
                    <div className="p-2 bg-scout-surface border border-scout-border">
                      <span className="text-[10px] text-scout-dim block">MENT</span>
                      <span className="text-white font-bold">{ev.mental_rating}/10</span>
                    </div>
                    <div className="p-2 bg-scout-surface border border-scout-neon/40 shadow-neon-sm">
                      <span className="text-[10px] text-scout-neon block font-bold">OVERALL</span>
                      <span className="text-scout-neon font-black">{ev.overall_rating}/10</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-scout-surface border border-scout-border">
                    <span className="text-emerald-400 font-bold block mb-1">OBSERVED STRENGTHS:</span>
                    <p className="text-scout-text leading-relaxed">{ev.strengths}</p>
                  </div>
                  <div className="p-3 bg-scout-surface border border-scout-border">
                    <span className="text-amber-400 font-bold block mb-1">DEVELOPMENT PRIORITY AREAS:</span>
                    <p className="text-scout-text leading-relaxed">{ev.development_areas}</p>
                  </div>
                </div>

                <div className="p-3 bg-scout-surface border border-scout-border/60 text-xs font-mono text-scout-muted leading-relaxed">
                  <b className="text-white">DETAILED SCOUT OPINION: </b>
                  {ev.detailed_notes}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Media & Keypoint Inspection */}
      {activeTab === 'media' && (
        <div className="bg-scout-card border border-scout-border hud-border p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-scout-border">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-scout-neon" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                VIDEO KEYFRAME POSE ESTIMATION OVERLAY
              </h3>
            </div>
            <span className="font-mono text-xs text-scout-dim">
              17-POINT COCO KEYPOINT TOPOLOGY
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visualizer Canvas Simulation */}
            <div className="lg:col-span-8 bg-black border border-scout-border aspect-video relative flex items-center justify-center overflow-hidden">
              {/* Telemetry Grid Overlay */}
              <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />

              {/* Athletic Silhouette Skeleton Drawing */}
              <svg className="w-full h-full max-h-96" viewBox="0 0 640 360">
                {/* Stick Skeleton Lines */}
                <line x1="320" y1="110" x2="320" y2="180" stroke="#CCFF00" strokeWidth="3" opacity="0.8" />
                <line x1="280" y1="120" x2="360" y2="120" stroke="#CCFF00" strokeWidth="3" opacity="0.8" />
                <line x1="280" y1="120" x2="250" y2="160" stroke="#CCFF00" strokeWidth="2.5" opacity="0.8" />
                <line x1="250" y1="160" x2="230" y2="200" stroke="#CCFF00" strokeWidth="2.5" opacity="0.8" />
                <line x1="360" y1="120" x2="390" y2="160" stroke="#CCFF00" strokeWidth="2.5" opacity="0.8" />
                <line x1="390" y1="160" x2="420" y2="200" stroke="#CCFF00" strokeWidth="2.5" opacity="0.8" />
                <line x1="320" y1="180" x2="290" y2="250" stroke="#CCFF00" strokeWidth="3" opacity="0.8" />
                <line x1="290" y1="250" x2="270" y2="310" stroke="#CCFF00" strokeWidth="3" opacity="0.8" />
                <line x1="320" y1="180" x2="350" y2="250" stroke="#CCFF00" strokeWidth="3" opacity="0.8" />
                <line x1="350" y1="250" x2="360" y2="310" stroke="#CCFF00" strokeWidth="3" opacity="0.8" />

                {/* Joints */}
                <circle cx="320" cy="80" r="16" fill="rgba(204,255,0,0.3)" stroke="#CCFF00" strokeWidth="2" />
                <circle cx="280" cy="120" r="5" fill="#CCFF00" />
                <circle cx="360" cy="120" r="5" fill="#CCFF00" />
                <circle cx="250" cy="160" r="4" fill="#CCFF00" />
                <circle cx="390" cy="160" r="4" fill="#CCFF00" />
                <circle cx="230" cy="200" r="4" fill="#CCFF00" />
                <circle cx="420" cy="200" r="4" fill="#CCFF00" />
                <circle cx="320" cy="180" r="6" fill="#CCFF00" />
                <circle cx="290" cy="250" r="5" fill="#CCFF00" />
                <circle cx="350" cy="250" r="5" fill="#CCFF00" />
                <circle cx="270" cy="310" r="5" fill="#CCFF00" />
                <circle cx="360" cy="310" r="5" fill="#CCFF00" />

                {/* Angle Annotations */}
                <text x="230" y="260" fill="#CCFF00" fontSize="12" fontFamily="monospace" fontWeight="bold">
                  142.0° Knee Flex
                </text>
                <text x="370" y="110" fill="#00A3FF" fontSize="12" fontFamily="monospace" fontWeight="bold">
                  36.5° Backlift
                </text>
              </svg>

              {/* HUD Frame Bar */}
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 border border-scout-neon/50 text-[10px] font-mono text-scout-neon">
                FRAME: 64 // IMPACT PHASE // 30 FPS
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 border border-scout-border text-[10px] font-mono text-white">
                DETECTION CONF: 0.94
              </div>
            </div>

            {/* Keyframe details */}
            <div className="lg:col-span-4 space-y-3 font-mono text-xs">
              <div className="p-3 bg-scout-surface border border-scout-border">
                <span className="text-[10px] text-scout-dim uppercase block">TRACKED ACTION</span>
                <span className="text-white font-bold text-sm">COVER DRIVE • FRONT FOOT</span>
              </div>

              <div className="p-3 bg-scout-surface border border-scout-border space-y-1.5">
                <span className="text-[10px] text-scout-dim uppercase block">TEMPORAL PHASES</span>
                <div className="flex justify-between text-[11px]">
                  <span className="text-scout-muted">Stance:</span>
                  <span className="text-white">Frames 12 - 28</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-scout-muted">Backlift:</span>
                  <span className="text-white">Frames 29 - 52</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-scout-neon font-bold">Impact Moment:</span>
                  <span className="text-scout-neon font-bold">Frame 64</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-scout-muted">Follow-through:</span>
                  <span className="text-white">Frames 65 - 104</span>
                </div>
              </div>

              <div className="p-3 bg-scout-surface border border-scout-border text-scout-muted text-[11px] leading-relaxed">
                Keypoints extracted via OpenCV Kinematic Silhouette Analysis in accordance with standard COCO-17 joint topology.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
