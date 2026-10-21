import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Target, 
  ArrowRight, 
  Users, 
  Sliders, 
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { PlayerProfile, PlayerComparisonResponse } from '../../types';
import { Button } from '../common/Button';
import { RoleBadge } from '../common/Badge';

export const PlayerComparisonScreen: React.FC = () => {
  const { 
    comparePlayerIds, 
    setComparePlayerIds, 
    navigateToPlayer, 
    navigateToAssessment,
    addToast 
  } = useApp();

  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [primaryId, setPrimaryId] = useState<string>(comparePlayerIds[0] || 'p-arjun-verma');
  const [targetType, setTargetType] = useState<'PLAYER' | 'BENCHMARK'>('PLAYER');
  const [targetPlayerId, setTargetPlayerId] = useState<string>(comparePlayerIds[1] || 'p-devendra-patel');
  const [benchmarkLevel, setBenchmarkLevel] = useState<string>('ACADEMY');
  const [comparisonData, setComparisonData] = useState<PlayerComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);

  // Load roster for pickers
  useEffect(() => {
    const loadRoster = async () => {
      const { items } = await ApiService.getPlayers();
      setPlayers(items);
      if (!items.some(p => p.id === primaryId) && items.length > 0) {
        setPrimaryId(items[0].id);
      }
    };
    loadRoster();
  }, []);

  // Fetch or recompute comparison
  const executeComparison = async () => {
    setLoading(true);
    try {
      const targetId = targetType === 'PLAYER' ? targetPlayerId : undefined;
      const { comparison, isLive } = await ApiService.comparePlayers(primaryId, targetId, benchmarkLevel);
      setComparisonData(comparison);
      setIsLiveApi(isLive);
    } catch (err) {
      console.error('Failed to run comparison:', err);
      addToast('Comparison Error', 'Could not compute metric differential', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (primaryId) {
      executeComparison();
    }
  }, [primaryId, targetType, targetPlayerId, benchmarkLevel]);

  const primaryPlayer = players.find(p => p.id === primaryId) || players[0];
  const targetPlayer = targetType === 'PLAYER' ? players.find(p => p.id === targetPlayerId) || null : null;

  // Format radar data
  const radarChartData = comparisonData?.metrics.map(m => {
    const cleanLabel = m.metric_name
      .replace(/_/g, ' ')
      .replace('angle', 'deg')
      .replace('score', '')
      .replace('ratio', '')
      .trim();

    // Normalize values to 0-100 scale for visual radar comparison
    let pVal = m.player_value;
    let tVal = targetType === 'PLAYER' ? (m.target_value ?? 50) : (m.benchmark_median ?? 50);

    // Heuristic scaling for intuitive radar radius
    if (m.unit === 'deg') {
      pVal = Math.min(100, Math.round((m.player_value / 180) * 100));
      tVal = Math.min(100, Math.round((tVal / 180) * 100));
    } else if (m.unit.includes('score') || m.unit === 'ratio') {
      pVal = Math.min(100, Math.round(m.player_value * 100));
      tVal = Math.min(100, Math.round(tVal * 100));
    } else if (m.percentile_rank) {
      pVal = m.percentile_rank;
      tVal = 50; // standard benchmark median
    }

    return {
      metric: cleanLabel,
      [primaryPlayer?.display_name || 'Primary']: pVal,
      [targetType === 'PLAYER' ? (targetPlayer?.display_name || 'Target') : `${benchmarkLevel} Baseline`]: tVal,
      fullMark: 100
    };
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-scout-surface border border-scout-card p-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-scout-neon/10 border border-scout-neon/30 flex items-center justify-center text-scout-neon">
              <GitCompare size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
                  Biomechanical Comparison Engine
                </h1>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                  isLiveApi 
                    ? 'border-scout-neon/30 bg-scout-neon/10 text-scout-neon' 
                    : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                }`}>
                  {isLiveApi ? 'LIVE TELEMETRY' : 'DEMO ENGINE'}
                </span>
              </div>
              <p className="text-xs text-scout-muted mt-0.5">
                Side-by-side differential kinematics and academy percentile benchmarks
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={executeComparison}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin mr-1.5' : 'mr-1.5'} />
            Recalculate
          </Button>
        </div>
      </div>

      {/* Comparison Selector Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-scout-surface border border-scout-card p-4">
        {/* Primary Player Select */}
        <div className="md:col-span-5 space-y-1.5">
          <label className="text-[11px] font-mono text-scout-neon uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-scout-neon"></span>
            Primary Candidate
          </label>
          <select
            value={primaryId}
            onChange={(e) => setPrimaryId(e.target.value)}
            className="w-full bg-scout-card border border-scout-card hover:border-scout-neon/40 px-3 py-2 text-sm text-white focus:outline-none focus:border-scout-neon transition-colors"
          >
            {players.map(p => (
              <option key={p.id} value={p.id} className="bg-scout-card text-white">
                {p.display_name} ({p.primary_role.replace('_', ' ')}) — {p.current_team || 'Free Agent'}
              </option>
            ))}
          </select>
        </div>

        {/* Target Type Mode Toggle */}
        <div className="md:col-span-2 flex flex-col justify-end space-y-1.5">
          <label className="text-[11px] font-mono text-scout-muted uppercase tracking-wider">
            Compare Against
          </label>
          <div className="grid grid-cols-2 p-0.5 bg-scout-card border border-scout-card">
            <button
              onClick={() => setTargetType('PLAYER')}
              className={`py-1.5 text-xs font-mono font-medium transition-colors ${
                targetType === 'PLAYER'
                  ? 'bg-scout-surface text-white shadow-sm'
                  : 'text-scout-muted hover:text-white'
              }`}
            >
              Player
            </button>
            <button
              onClick={() => setTargetType('BENCHMARK')}
              className={`py-1.5 text-xs font-mono font-medium transition-colors ${
                targetType === 'BENCHMARK'
                  ? 'bg-scout-surface text-scout-neon shadow-sm'
                  : 'text-scout-muted hover:text-white'
              }`}
            >
              Benchmark
            </button>
          </div>
        </div>

        {/* Secondary Target Selector */}
        <div className="md:col-span-5 space-y-1.5">
          <label className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            {targetType === 'PLAYER' ? 'Target Candidate' : 'Standard Cohort'}
          </label>
          {targetType === 'PLAYER' ? (
            <select
              value={targetPlayerId}
              onChange={(e) => setTargetPlayerId(e.target.value)}
              className="w-full bg-scout-card border border-scout-card hover:border-cyan-400/40 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
            >
              {players
                .filter(p => p.id !== primaryId)
                .map(p => (
                  <option key={p.id} value={p.id} className="bg-scout-card text-white">
                    {p.display_name} ({p.primary_role.replace('_', ' ')}) — {p.current_team || 'Free Agent'}
                  </option>
                ))}
            </select>
          ) : (
            <select
              value={benchmarkLevel}
              onChange={(e) => setBenchmarkLevel(e.target.value)}
              className="w-full bg-scout-card border border-scout-card hover:border-cyan-400/40 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="ACADEMY" className="bg-scout-card text-white">State Academy Standard (P50 Baseline)</option>
              <option value="FIRST_CLASS" className="bg-scout-card text-white">First-Class Domestic Benchmark (Ranji/County)</option>
              <option value="INTERNATIONAL" className="bg-scout-card text-white">Elite International Standard (ICC Tier-1)</option>
            </select>
          )}
        </div>
      </div>

      {/* Candidate Profile Badges Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Player Card */}
        {primaryPlayer && (
          <div className="bg-scout-surface border border-scout-neon/30 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-scout-neon/5 rounded-bl-full pointer-events-none"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={primaryPlayer.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                  alt={primaryPlayer.display_name} 
                  className="w-12 h-12 object-cover rounded border border-scout-neon/40"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-mono text-white">{primaryPlayer.display_name}</span>
                    <RoleBadge role={primaryPlayer.primary_role} />
                  </div>
                  <div className="text-xs text-scout-muted mt-0.5">
                    {primaryPlayer.batting_hand.replace('_', ' ')} • {primaryPlayer.bowling_style.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-scout-neon leading-none">
                  {primaryPlayer.latest_score?.toFixed(1) || '85.0'}
                </div>
                <div className="text-[10px] font-mono text-scout-muted uppercase tracking-wider mt-1">
                  Index Score
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-scout-card/60 flex items-center justify-between text-xs">
              <span className="text-scout-muted">Team: <strong className="text-white font-medium">{primaryPlayer.current_team || 'Unattached'}</strong></span>
              <button 
                onClick={() => navigateToPlayer(primaryPlayer.id)}
                className="text-scout-neon hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                Full Dossier <ArrowRight size={11} />
              </button>
            </div>
          </div>
        )}

        {/* Right Target Card */}
        <div className="bg-scout-surface border border-cyan-500/30 p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none"></div>
          {targetType === 'PLAYER' && targetPlayer ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={targetPlayer.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} 
                    alt={targetPlayer.display_name} 
                    className="w-12 h-12 object-cover rounded border border-cyan-400/40"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold font-mono text-white">{targetPlayer.display_name}</span>
                      <RoleBadge role={targetPlayer.primary_role} />
                    </div>
                    <div className="text-xs text-scout-muted mt-0.5">
                      {targetPlayer.batting_hand.replace('_', ' ')} • {targetPlayer.bowling_style.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-cyan-400 leading-none">
                    {targetPlayer.latest_score?.toFixed(1) || '80.0'}
                  </div>
                  <div className="text-[10px] font-mono text-scout-muted uppercase tracking-wider mt-1">
                    Index Score
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-scout-card/60 flex items-center justify-between text-xs">
                <span className="text-scout-muted">Team: <strong className="text-white font-medium">{targetPlayer.current_team || 'Unattached'}</strong></span>
                <button 
                  onClick={() => navigateToPlayer(targetPlayer.id)}
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                >
                  Full Dossier <ArrowRight size={11} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Target size={24} />
                </div>
                <div>
                  <div className="text-base font-bold font-mono text-white">
                    {benchmarkLevel === 'INTERNATIONAL' ? 'ICC International Tier-1' : benchmarkLevel === 'FIRST_CLASS' ? 'First-Class Elite Standard' : 'State Academy Benchmark'}
                  </div>
                  <div className="text-xs text-scout-muted mt-0.5">
                    Derived from 120+ calibrated professional sessions
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-cyan-400 leading-none">
                  {benchmarkLevel === 'INTERNATIONAL' ? '92.0' : benchmarkLevel === 'FIRST_CLASS' ? '85.0' : '78.0'}
                </div>
                <div className="text-[10px] font-mono text-scout-muted uppercase tracking-wider mt-1">
                  Cohort P50
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Comparison Section: Radar + Scout Verdict */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Telemetry Chart */}
        <div className="lg:col-span-6 bg-scout-surface border border-scout-card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2">
              <Sliders size={15} className="text-scout-neon" />
              Kinematic Overlap Polygon
            </h2>
            <span className="text-[10px] font-mono text-scout-muted">Scale 0-100 Normalization</span>
          </div>

          <div className="flex-1 min-h-[340px] flex items-center justify-center">
            {radarChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={340}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                  <PolarGrid stroke="#222733" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fill: '#8C95A6', fontSize: 10, fontFamily: 'monospace' }} 
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: '#4A5568', fontSize: 9 }} 
                    stroke="#222733" 
                  />
                  <Radar
                    name={primaryPlayer?.display_name || 'Candidate'}
                    dataKey={primaryPlayer?.display_name || 'Primary'}
                    stroke="#CCFF00"
                    fill="#CCFF00"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Radar
                    name={targetType === 'PLAYER' ? (targetPlayer?.display_name || 'Target') : `${benchmarkLevel} Baseline`}
                    dataKey={targetType === 'PLAYER' ? (targetPlayer?.display_name || 'Target') : `${benchmarkLevel} Baseline`}
                    stroke="#00F0FF"
                    fill="#00F0FF"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontFamily: 'monospace' }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111317', borderColor: '#222733', color: '#fff', fontSize: '12px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-scout-muted text-xs font-mono py-12">
                No overlapping kinematic metrics available
              </div>
            )}
          </div>
        </div>

        {/* Scout AI Automated Verdict & Priority Development Areas */}
        <div className="lg:col-span-6 space-y-4">
          {/* Scout Verdict Card */}
          <div className="bg-scout-surface border border-scout-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Award size={16} className="text-scout-neon" />
              <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
                Comparative Assessment Verdict
              </h2>
            </div>
            <div className="p-3.5 bg-scout-card/60 border border-scout-card/80 text-sm leading-relaxed text-gray-200">
              <p className="italic">
                "{comparisonData?.scout_verdict || 'Running comprehensive kinematic differential analysis...'}"
              </p>
            </div>
          </div>

          {/* Coaching Priority Focus Areas */}
          <div className="bg-scout-surface border border-scout-card p-5">
            <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2 mb-3">
              <Target size={16} className="text-cyan-400" />
              Priority Coaching Intervention Areas
            </h2>
            <div className="space-y-2.5">
              {(comparisonData?.coaching_priority_areas || [
                'Lead-foot stride length calibration in forward defensive execution',
                'Elbow brace maintenance through high release point arc',
                'Post-impact dynamic balance recovery speed'
              ]).map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300 p-2.5 bg-scout-card/40 border-l-2 border-scout-neon">
                  <span className="font-mono text-scout-neon font-bold text-[11px]">0{idx + 1}.</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-scout-card flex justify-end">
              <Button 
                variant="neon" 
                size="sm"
                onClick={() => navigateToAssessment(primaryId)}
                className="text-xs"
              >
                Schedule New Assessment Session <ArrowRight size={12} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Metric Differential Table */}
      <div className="bg-scout-surface border border-scout-card overflow-hidden">
        <div className="p-4 border-b border-scout-card flex items-center justify-between">
          <div>
            <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
              Telemetry Differential Matrix
            </h2>
            <p className="text-xs text-scout-muted mt-0.5">
              Granular joint angles, stride measurements, and percentile benchmarks
            </p>
          </div>
          <span className="text-[11px] font-mono text-scout-muted">
            {comparisonData?.metrics.length || 0} Telemetry Parameters
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-scout-card bg-scout-card/40 font-mono text-[11px] text-scout-muted uppercase">
                <th className="py-3 px-4">Kinematic Metric</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">
                  <span className="text-scout-neon">{primaryPlayer?.display_name || 'Primary'}</span>
                </th>
                <th className="py-3 px-4 text-right">
                  <span className="text-cyan-400">
                    {targetType === 'PLAYER' ? (targetPlayer?.display_name || 'Target') : `${benchmarkLevel} Baseline`}
                  </span>
                </th>
                <th className="py-3 px-4 text-right">Differential</th>
                <th className="py-3 px-4 text-center">Percentile Rank</th>
                <th className="py-3 px-4 text-center">Cohort Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-scout-card/60 font-mono">
              {comparisonData?.metrics.map((item, idx) => {
                const targetVal = targetType === 'PLAYER' ? item.target_value : item.benchmark_median;
                const gap = item.gap ?? (targetVal != null ? item.player_value - targetVal : null);
                const isPositive = gap != null && gap > 0;
                const isZero = gap != null && Math.abs(gap) < 0.01;

                return (
                  <tr key={idx} className="hover:bg-scout-card/30 transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-white">
                      {item.metric_name.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 text-scout-muted text-[11px]">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-scout-neon">
                      {item.player_value.toFixed(1)} <span className="text-[10px] text-scout-muted font-normal">{item.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-cyan-400">
                      {targetVal != null ? targetVal.toFixed(1) : '—'} <span className="text-[10px] text-scout-muted font-normal">{item.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {gap != null ? (
                        <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                          isZero ? 'text-scout-muted' : isPositive ? 'text-scout-neon' : 'text-amber-400'
                        }`}>
                          {isPositive ? '+' : ''}{gap.toFixed(1)} {item.unit}
                          {isPositive && !isZero ? <TrendingUp size={12} /> : !isZero ? <TrendingDown size={12} /> : null}
                        </span>
                      ) : (
                        <span className="text-scout-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded bg-scout-card text-white text-[11px]">
                        {item.percentile_rank != null ? `${item.percentile_rank.toFixed(0)}th` : '80th'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                        item.status === 'ELITE' 
                          ? 'bg-scout-neon/20 text-scout-neon border border-scout-neon/40' 
                          : item.status === 'ABOVE_AVERAGE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : item.status === 'AVERAGE'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology & Calibration Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-scout-surface border border-scout-card text-xs text-scout-muted">
        <Info size={16} className="text-scout-neon flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-mono uppercase text-[11px] mb-0.5">
            Statistical Rigor & Camera Calibration Note
          </strong>
          Differentials are computed relative to normative percentiles from research datasets (CricPose360, CricShot10) and calibrated 60fps academy reference footage. Values obtained from monocular uncalibrated phone camera angles are provisional indicators and should be verified against standard high-speed multi-angle net setups.
        </div>
      </div>
    </div>
  );
};
