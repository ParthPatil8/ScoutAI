import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { PlayerProfile, AssessmentSession, ScoutEvaluation } from '../../types';
import { Button } from '../common/Button';
import { RoleBadge } from '../common/Badge';
import { 
  User, 
  Activity, 
  Upload, 
  Play, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Calendar, 
  FileVideo, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Info,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis
} from 'recharts';

export const PlayerPortalScreen: React.FC = () => {
  const { currentUser, selectedPlayerId, addToast, navigateToAssessment } = useApp();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [assessments, setAssessments] = useState<AssessmentSession[]>([]);
  const [evaluations, setEvaluations] = useState<ScoutEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Video Upload State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('Net Practice - Technique Review');

  const playerId = currentUser?.playerId || selectedPlayerId || 'p-arjun-verma';

  useEffect(() => {
    async function loadPlayerData() {
      setLoading(true);
      try {
        const [pRes, aRes, eRes] = await Promise.all([
          ApiService.getPlayerById(playerId),
          ApiService.getAssessments(playerId),
          ApiService.getEvaluations(playerId),
        ]);
        if (pRes.player) setPlayer(pRes.player);
        setAssessments(aRes.items);
        setEvaluations(eRes.items);
      } catch (err) {
        console.error('Failed to load player portal data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlayerData();
  }, [playerId]);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      addToast('Clip Selected', `${file.name} ready for biomechanical analysis`, 'info');
    }
  };

  const handleRunAnalysis = async () => {
    if (!player) return;
    setAnalyzing(true);
    addToast('Processing Video', 'Running pose estimation and stroke segmentation...', 'info');

    try {
      const { assessment } = await ApiService.createAndProcessAssessment(
        player.id,
        sessionTitle,
        player.primary_role === 'BOWLER' ? 'BOWLING_BIOMECHANICS' : 'BATTING_TECHNIQUE',
        videoFile
      );

      setAssessments(prev => [assessment, ...prev]);
      setVideoFile(null);
      setVideoPreview(null);
      addToast('Analysis Complete', `New technique score: ${assessment.overall_provisional_score}/100`, 'success');
    } catch (err) {
      console.error('Upload failed:', err);
      addToast('Analysis Failed', 'Could not process video clip', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  // Build Radar Data from latest assessment
  const latestAssessment = assessments[0];
  const radarData = latestAssessment?.metrics?.map(m => {
    const cleanLabel = m.metric_name
      .replace(/_/g, ' ')
      .replace('angle', 'deg')
      .replace('score', '')
      .replace('ratio', '')
      .trim();

    let val = m.value;
    if (m.unit === 'deg') {
      val = Math.min(100, Math.round((m.value / 180) * 100));
    } else if (m.unit.includes('score') || m.unit === 'ratio') {
      val = Math.min(100, Math.round(m.value * 100));
    }

    return {
      metric: cleanLabel,
      value: val,
      fullMark: 100,
    };
  }) || [
    { metric: 'Front Knee Flexion', value: 85, fullMark: 100 },
    { metric: 'Stride Proportion', value: 82, fullMark: 100 },
    { metric: 'Head Lock on Impact', value: 88, fullMark: 100 },
    { metric: 'Backlift Arc', value: 78, fullMark: 100 },
    { metric: 'Dynamic Balance', value: 86, fullMark: 100 },
  ];

  // Timeline progression
  const timelineData = [...assessments].reverse().map(a => ({
    date: a.assessment_date,
    score: a.overall_provisional_score || 80,
    name: a.session_name,
  }));

  if (loading && !player) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-scout-neon border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-gray-400">Loading your performance dossier...</p>
      </div>
    );
  }

  const p = player || {
    id: playerId,
    display_name: currentUser?.name || 'Arjun Verma',
    primary_role: 'BATSMAN',
    current_team: 'National Cricket Academy U-19',
    batting_hand: 'RIGHT_HAND',
    bowling_style: 'RIGHT_ARM_OFF_SPIN',
    latest_score: 87.0,
    avatar_url: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Hero Dossier Header */}
      <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5">
          <img
            src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={p.display_name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-scout-neon/40 shadow-lg"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-mono font-black text-white uppercase tracking-tight">
                {p.display_name}
              </h1>
              <RoleBadge role={p.primary_role as any} />
            </div>
            <p className="text-xs font-mono text-gray-400">
              {p.current_team} • {p.batting_hand.replace('_', ' ')} • {p.bowling_style.replace(/_/g, ' ')}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-scout-neon">
              <span className="w-2 h-2 rounded-full bg-scout-neon animate-pulse" />
              <span>Active Athlete Profile • Verified by Academy Staff</span>
            </div>
          </div>
        </div>

        {/* Big Score Tile */}
        <div className="flex items-center gap-4 bg-[#0a0c10] border border-white/5 rounded-2xl p-4 sm:p-5 text-right md:text-left self-start md:self-auto">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
              Overall Technique Index
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl sm:text-4xl font-mono font-black text-scout-neon leading-none">
                {latestAssessment?.overall_provisional_score?.toFixed(1) || p.latest_score?.toFixed(1) || '87.0'}
              </span>
              <span className="text-xs font-mono text-gray-500">/ 100</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> Top 15% Academy Cohort
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Action Cards: Technique Radar & Plain-English Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Biomechanical Radar (6 cols) */}
        <div className="lg:col-span-6 bg-[#12141a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity size={16} className="text-scout-neon" />
                Biomechanical Radar
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Key angular joint kinematics from your latest session
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-scout-neon/10 text-scout-neon border border-scout-neon/20">
              Latest Run
            </span>
          </div>

          <div className="py-4 h-64 sm:h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#222733" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#475569', fontSize: 9 }} 
                  stroke="#222733" 
                />
                <Radar
                  name={p.display_name}
                  dataKey="value"
                  stroke="#CCFF00"
                  fill="#CCFF00"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0c10', borderColor: '#222733', color: '#fff', fontSize: '12px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-gray-400 flex items-center justify-between">
            <span>Normalized 0-100 kinematic score</span>
            <span className="text-scout-neon">17-Point Pose Engine</span>
          </div>
        </div>

        {/* Right: Plain-English Coaching & AI Feedback (6 cols) */}
        <div className="lg:col-span-6 bg-[#12141a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-scout-neon" />
                Plain-English Coach & AI Advice
              </h2>
              <span className="text-xs font-mono text-gray-400">Actionable Notes</span>
            </div>

            <div className="mt-4 space-y-3">
              {/* Strength */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  ✓ What You Are Doing Right
                </span>
                <p className="text-xs text-gray-200 leading-relaxed">
                  {evaluations[0]?.strengths || 
                   'Excellent head lock directly above the contact point on off-drives. Clean follow-through arc with balanced shoulder plane.'}
                </p>
              </div>

              {/* Area to Improve */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  ⚠ Focus Areas for Next Net Session
                </span>
                <p className="text-xs text-gray-200 leading-relaxed">
                  {evaluations[0]?.development_areas || 
                   'Extend front-foot stride by 4–6 cm on full-pitched deliveries to avoid weight drifting onto back foot prematurely.'}
                </p>
              </div>

              {/* Coach Note */}
              <div className="p-3.5 rounded-xl bg-[#0e1015] border border-white/5 text-xs text-gray-400 flex items-start gap-2.5">
                <MessageSquare size={15} className="text-scout-neon flex-shrink-0 mt-0.5" />
                <p className="italic">
                  "{evaluations[0]?.detailed_notes || 
                    'Observed solid temperament and technical composure against spin bowling. Keep practicing the low center-of-gravity drill.'}"
                </p>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-gray-500 pt-2 border-t border-white/5">
            Evaluated by: <strong className="text-gray-300">{evaluations[0]?.evaluator_name || 'Coach Vikram'}</strong> ({evaluations[0]?.evaluator_organization || 'National Cricket Academy'})
          </div>
        </div>
      </div>

      {/* 3. Quick Video Upload & Self-Assessment */}
      <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-base font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Upload size={18} className="text-scout-neon" />
              Upload Net Session Video for Instant Assessment
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Upload batting or bowling video to calculate joint angles and refresh your technique rating
            </p>
          </div>
          <span className="text-[11px] font-mono text-scout-neon px-2.5 py-1 rounded bg-scout-neon/10 border border-scout-neon/20">
            OpenCV Kinematics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Dropzone */}
          <div className="md:col-span-7">
            <div className="border-2 border-dashed border-white/10 hover:border-scout-neon/60 rounded-2xl p-6 sm:p-8 text-center transition-colors bg-[#0e1015] relative">
              <input
                type="file"
                accept="video/mp4,video/mov,video/avi"
                onChange={handleVideoSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <FileVideo className="w-10 h-10 text-scout-neon mx-auto mb-2 opacity-80" />
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                {videoFile ? videoFile.name : 'Select or Drop Net Practice Video Clip'}
              </h4>
              <p className="text-[11px] text-gray-500 font-mono mt-1">
                Supports MP4, MOV up to 500 MB • 30/60 FPS recommended
              </p>
              {videoFile && (
                <span className="inline-block mt-3 px-2.5 py-1 rounded bg-scout-neon/20 text-scout-neon font-mono text-[11px] border border-scout-neon/40">
                  Ready to analyze: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              )}
            </div>

            {videoPreview && (
              <div className="mt-3 p-2 bg-black rounded-xl border border-white/10">
                <video src={videoPreview} controls className="w-full max-h-48 object-contain rounded-lg mx-auto" />
              </div>
            )}
          </div>

          {/* Action Trigger Card */}
          <div className="md:col-span-5 bg-[#0e1015] border border-white/10 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                Session Title / Drill Name
              </label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full bg-[#14161f] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-scout-neon font-mono"
              />
            </div>

            <div className="text-xs font-mono text-gray-400 space-y-1.5 p-3 rounded-xl bg-[#12141a]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-scout-neon" />
                <span>17-Point COCO Skeletal Extraction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-scout-neon" />
                <span>Stroke Phase Segmentation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-scout-neon" />
                <span>Immediate Database Sync</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              onClick={handleRunAnalysis}
              disabled={analyzing}
            >
              {analyzing ? (
                <span>Running Kinematics Pipeline...</span>
              ) : (
                <>
                  <Play size={14} className="mr-2 fill-current" />
                  <span>Analyze My Technique</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Past Practice Sessions & Progress Timeline */}
      <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div>
            <h2 className="text-base font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar size={18} className="text-scout-neon" />
              Practice Sessions & Progression History ({assessments.length})
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Historical progress tracking across your training sessions
            </p>
          </div>
        </div>

        {timelineData.length > 1 && (
          <div className="p-4 rounded-xl bg-[#0e1015] border border-white/5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
              Score Trajectory Over Time
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis domain={[60, 100]} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a0c10', borderColor: '#222733', color: '#fff', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="score" stroke="#CCFF00" strokeWidth={2.5} dot={{ fill: '#CCFF00', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {assessments.map(session => (
            <div
              key={session.id}
              className="p-4 rounded-xl bg-[#0e1015] border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-mono font-bold text-white">
                    {session.session_name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-scout-neon/15 text-scout-neon border border-scout-neon/30">
                    {session.assessment_type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 max-w-xl">
                  {session.scout_summary || 'Automated biomechanical evaluation complete.'}
                </p>
                <div className="text-[11px] font-mono text-gray-500">
                  Recorded on: {session.assessment_date}
                </div>
              </div>

              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                <span className="text-2xl font-mono font-black text-scout-neon leading-none">
                  {session.overall_provisional_score?.toFixed(1) || '85.0'}
                </span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mt-1">
                  Technique Score
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
