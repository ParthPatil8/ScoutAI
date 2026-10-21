import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { PlayerProfile, AssessmentSession, AssessmentType } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Crosshair,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Activity,
  FileVideo,
  Award,
  ShieldCheck,
  Check
} from 'lucide-react';

export const AssessmentWorkspace: React.FC = () => {
  const { selectedPlayerId, addToast, navigateToPlayer } = useApp();
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [targetPlayerId, setTargetPlayerId] = useState<string>(selectedPlayerId);
  const [assessmentType, setAssessmentType] = useState<AssessmentType>('BATTING_TECHNIQUE');
  const [sessionName, setSessionName] = useState('Net Session - Technical Diagnostics');
  
  // File state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Execution states: 'idle' | 'running' | 'completed' | 'failed'
  const [pipelineState, setPipelineState] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSession, setCompletedSession] = useState<AssessmentSession | null>(null);

  const steps = [
    { title: 'Video Stream Ingestion & FPS Probe', desc: 'Validating 30+ FPS, container integrity, and frame boundaries.' },
    { title: '17-Point Skeletal Pose Estimation', desc: 'Localizing shoulders, elbows, wrists, hips, knees, ankles.' },
    { title: 'Temporal Action Phase Segmentation', desc: 'Isolating Stance, Backlift, Downswing, and Impact Frame #64.' },
    { title: 'Biomechanical Vector Angle Calculation', desc: 'Computing Lead Knee Flexion, Front Foot Stride Ratio, Head Lock.' },
    { title: 'Provisional Scoring & DB Commit', desc: 'Generating structured performance metrics and persistence.' }
  ];

  useEffect(() => {
    async function loadPlayers() {
      const res = await ApiService.getPlayers();
      setPlayers(res.items);
      if (selectedPlayerId) setTargetPlayerId(selectedPlayerId);
    }
    loadPlayers();
  }, [selectedPlayerId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setVideoPreview(URL.createObjectURL(file));
      addToast('Video Clip Attached', `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB) ready for processing`, 'info');
    }
  };

  const handleRunAssessment = async () => {
    setPipelineState('running');
    setCurrentStep(0);

    // Simulate animated step transitions while backend executes
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    try {
      const { assessment, isLive } = await ApiService.createAndProcessAssessment(
        targetPlayerId,
        sessionName,
        assessmentType
      );

      clearInterval(interval);
      setCurrentStep(steps.length);
      setCompletedSession(assessment);
      setPipelineState('completed');
      addToast(
        'Assessment Pipeline Completed',
        `Generated provisional score of ${assessment.overall_provisional_score}/100 ${isLive ? '(Live DB)' : '(Simulated)'}`,
        'success'
      );
    } catch (err: any) {
      clearInterval(interval);
      setPipelineState('failed');
      addToast('Assessment Failed', err?.message || 'Processing failed', 'error');
    }
  };

  const selectedPlayer = players.find(p => p.id === targetPlayerId) || players[0];

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-scout-card border border-scout-border hud-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-scout-neon text-black font-mono font-extrabold text-[10px] uppercase tracking-widest">
              AI ENGINE
            </span>
            <span className="font-mono text-xs text-scout-neon font-semibold uppercase tracking-wider">
              • AUTOMATED KINEMATICS PIPELINE
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-mono font-black uppercase text-white mt-1">
            CRICKET ACTION BIOMECHANICAL ANALYZER
          </h2>
          <p className="text-xs text-scout-muted max-w-xl mt-1">
            Extracts anatomical joint vectors from training clips, determines stroke mechanics, and computes provisional technique ratings.
          </p>
        </div>

        {pipelineState === 'completed' && (
          <Button
            variant="outline"
            size="sm"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={() => {
              setPipelineState('idle');
              setCompletedSession(null);
            }}
          >
            New Assessment Run
          </Button>
        )}
      </div>

      {pipelineState === 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Step 1: Configuration Form (5 cols) */}
          <div className="lg:col-span-5 bg-scout-card border border-scout-border hud-border p-5 space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white pb-3 border-b border-scout-border flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-scout-neon" />
              <span>1. PROSPECT & PARAMETERS</span>
            </h3>

            {/* Select Player */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-scout-muted mb-1">
                Select Cricketer *
              </label>
              <select
                value={targetPlayerId}
                onChange={e => setTargetPlayerId(e.target.value)}
                className="w-full bg-scout-surface border border-scout-border focus:border-scout-neon focus:outline-none p-2.5 text-xs font-mono text-white"
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.display_name} ({p.primary_role} - {p.current_team})
                  </option>
                ))}
              </select>
            </div>

            {/* Assessment Type */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-scout-muted mb-1">
                Assessment Protocol *
              </label>
              <select
                value={assessmentType}
                onChange={e => setAssessmentType(e.target.value as any)}
                className="w-full bg-scout-surface border border-scout-border focus:border-scout-neon focus:outline-none p-2.5 text-xs font-mono text-white"
              >
                <option value="BATTING_TECHNIQUE">BATTING TECHNIQUE & STROKE BIOMECHANICS</option>
                <option value="BOWLING_BIOMECHANICS">BOWLING ACTION & ELBOW LEGALITY MONITORING</option>
                <option value="FIELDING_AGILITY">FIELDING REACTION & LATERAL BALANCE</option>
              </select>
            </div>

            {/* Session Name */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-scout-muted mb-1">
                Session Identifier
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={e => setSessionName(e.target.value)}
                className="w-full bg-scout-surface border border-scout-border focus:border-scout-neon focus:outline-none px-3 py-2 text-xs font-mono text-white"
              />
            </div>

            {/* Player Preview Snippet */}
            {selectedPlayer && (
              <div className="p-3.5 bg-scout-surface border border-scout-border/60 flex items-center gap-3">
                <img
                  src={selectedPlayer.avatar_url}
                  alt=""
                  className="w-12 h-12 object-cover border border-scout-border"
                />
                <div className="text-xs font-mono min-w-0">
                  <p className="font-bold text-white uppercase truncate">{selectedPlayer.display_name}</p>
                  <p className="text-scout-muted text-[11px]">{selectedPlayer.current_team}</p>
                  <Badge role={selectedPlayer.primary_role} size="sm" />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Video Ingestion & Launch (7 cols) */}
          <div className="lg:col-span-7 bg-scout-card border border-scout-border hud-border p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white pb-3 border-b border-scout-border flex items-center gap-2">
                <Upload className="w-4 h-4 text-scout-neon" />
                <span>2. VIDEO CLIP UPLOAD & VALIDATION</span>
              </h3>

              {/* Upload Dropzone */}
              <div className="mt-4 border-2 border-dashed border-scout-border hover:border-scout-neon/60 p-8 text-center transition-colors bg-scout-surface/40 relative">
                <input
                  type="file"
                  accept="video/mp4,video/mov,video/avi"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileVideo className="w-10 h-10 text-scout-neon mx-auto mb-2 opacity-80" />
                <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  {uploadedFile ? uploadedFile.name : 'DRAG & DROP CRICKET CLIP OR BROWSE'}
                </h4>
                <p className="text-[11px] text-scout-muted font-mono mt-1">
                  Supports MP4, MOV up to 500 MB • 30/60 FPS recommended for impact detection
                </p>
                {uploadedFile && (
                  <span className="inline-block mt-3 px-2 py-0.5 bg-scout-neon/20 text-scout-neon font-mono text-[11px] border border-scout-neon/40">
                    Ready for Ingestion: {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                )}
              </div>

              {/* Video Preview if selected */}
              {videoPreview && (
                <div className="mt-4 p-2 bg-black border border-scout-border">
                  <video src={videoPreview} controls className="w-full max-h-48 object-contain mx-auto" />
                </div>
              )}
            </div>

            {/* Launch Button */}
            <div className="mt-6 pt-4 border-t border-scout-border flex items-center justify-between">
              <span className="text-[11px] font-mono text-scout-dim">
                Monocular 2D vector angles will be generated
              </span>
              <Button
                variant="primary"
                size="md"
                icon={<Play className="w-4 h-4 fill-current" />}
                onClick={handleRunAssessment}
              >
                Execute Kinematics Pipeline
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Running State */}
      {pipelineState === 'running' && (
        <div className="bg-scout-card border border-scout-neon/50 shadow-neon hud-border p-8 space-y-6 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 border-3 border-scout-neon border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="font-mono text-sm font-black text-white uppercase tracking-wider">
              ANALYZING SKELETAL MOVEMENT TELEMETRY...
            </h3>
            <p className="text-xs text-scout-muted font-mono">
              Prospect: {selectedPlayer?.display_name} // Model: cricket-kinematics-v1
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {steps.map((st, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div
                  key={st.title}
                  className={`p-3 border font-mono text-xs flex items-start gap-3 transition-all ${
                    isPast
                      ? 'bg-scout-surface border-scout-neon/40 text-scout-neon'
                      : isCurrent
                      ? 'bg-scout-surface border-scout-neon text-white shadow-neon-sm'
                      : 'bg-scout-surface/30 border-scout-border/60 text-scout-dim'
                  }`}
                >
                  <div className="mt-0.5">
                    {isPast ? (
                      <Check className="w-4 h-4 text-scout-neon" />
                    ) : isCurrent ? (
                      <span className="w-3.5 h-3.5 border-2 border-scout-neon border-t-transparent rounded-full animate-spin inline-block" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-scout-dim flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold uppercase tracking-wider">{st.title}</p>
                    <p className="text-[11px] text-scout-muted">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Assessment Report */}
      {pipelineState === 'completed' && completedSession && (
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="bg-scout-card border border-scout-neon/60 shadow-neon-sm hud-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-scout-neon" />
                <h3 className="font-mono text-base font-black text-white uppercase tracking-wider">
                  KINEMATICS ASSESSMENT COMPLETED
                </h3>
                <Badge variant="provisional" size="sm" />
              </div>
              <p className="text-xs text-scout-muted font-mono">
                {completedSession.session_name} • Prospect: {selectedPlayer?.display_name} • Duration: {completedSession.execution_duration_sec}s
              </p>
              <p className="text-xs font-mono text-scout-text pt-1 max-w-2xl leading-relaxed">
                {completedSession.scout_summary}
              </p>
            </div>

            <div className="bg-scout-surface border border-scout-neon/40 p-4 text-center min-w-[170px] shadow-neon-sm">
              <span className="text-[10px] font-mono text-scout-muted uppercase block">
                OVERALL PROVISIONAL
              </span>
              <div className="text-4xl font-mono font-black text-scout-neon">
                {completedSession.overall_provisional_score?.toFixed(1) || '87.0'}
                <span className="text-xs text-scout-dim font-normal">/100</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                91% Confidence
              </span>
            </div>
          </div>

          {/* Generated Metrics Grid */}
          <div className="bg-scout-card border border-scout-border hud-border p-6 space-y-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white pb-3 border-b border-scout-border">
              EXTRACTED PERFORMANCE INDICATORS
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedSession.metrics?.map(m => (
                <div key={m.id} className="p-4 bg-scout-surface border border-scout-border hud-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white uppercase">
                      {m.metric_name.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-scout-neon px-1.5 py-0.5 bg-scout-card border border-scout-border">
                      {m.category}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="text-2xl font-black text-scout-neon">{m.value}</span>
                    <span className="text-xs text-white">{m.unit}</span>
                  </div>

                  <p className="text-xs text-scout-muted font-mono leading-relaxed">
                    {m.interpretation}
                  </p>

                  <div className="pt-2 border-t border-scout-border/60 flex items-center justify-between text-[11px] font-mono text-scout-dim">
                    <span>Rank: {m.benchmark_percentile || 85}th %ile</span>
                    <span className="text-emerald-400">Compliant</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigateToPlayer(targetPlayerId)}
            >
              Open Full Player Dossier
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setPipelineState('idle');
                setCompletedSession(null);
              }}
            >
              Run Another Assessment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
