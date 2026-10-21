import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  UserCheck, 
  Plus, 
  Star, 
  Trash2, 
  ExternalLink, 
  GitCompare, 
  Activity, 
  Search, 
  Filter, 
  CheckCircle,
  X,
  MessageSquare,
  Shield,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { 
  PlayerProfile, 
  ScoutEvaluation, 
  ScoutRecommendation 
} from '../../types';
import { Button } from '../common/Button';
import { RoleBadge, RecommendationBadge } from '../common/Badge';

export const ScoutWorkspace: React.FC = () => {
  const { 
    shortlistIds, 
    toggleShortlist, 
    navigateToPlayer, 
    navigateToAssessment, 
    navigateToCompare,
    addToast 
  } = useApp();

  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [evaluations, setEvaluations] = useState<ScoutEvaluation[]>([]);
  const [filterRec, setFilterRec] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // New evaluation form state
  const [formPlayerId, setFormPlayerId] = useState<string>('');
  const [formEvaluator, setFormEvaluator] = useState<string>('Chief Talent Scout');
  const [formOrg, setFormOrg] = useState<string>('State Development Academy');
  const [formTech, setFormTech] = useState<number>(8.5);
  const [formTact, setFormTact] = useState<number>(8.0);
  const [formPhys, setFormPhys] = useState<number>(8.0);
  const [formMental, setFormMental] = useState<number>(8.5);
  const [formRec, setFormRec] = useState<ScoutRecommendation>('SHORTLIST');
  const [formStrengths, setFormStrengths] = useState<string>('');
  const [formDevAreas, setFormDevAreas] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, eRes] = await Promise.all([
        ApiService.getPlayers(),
        ApiService.getEvaluations()
      ]);
      setPlayers(pRes.items);
      setEvaluations(eRes.items);
      if (pRes.items.length > 0 && !formPlayerId) {
        setFormPlayerId(pRes.items[0].id);
      }
    } catch (err) {
      console.error('Failed to load scouting data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const shortlistedPlayers = players.filter(p => shortlistIds.includes(p.id));

  // Compute calculated overall rating
  const calculatedOverall = Number(((formTech * 0.35) + (formTact * 0.25) + (formPhys * 0.2) + (formMental * 0.2)).toFixed(1));

  // Handle form submission
  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlayerId) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<ScoutEvaluation> = {
        player_id: formPlayerId,
        evaluator_name: formEvaluator,
        evaluator_organization: formOrg,
        technical_rating: formTech,
        tactical_rating: formTact,
        physical_rating: formPhys,
        mental_rating: formMental,
        overall_rating: calculatedOverall,
        scout_recommendation: formRec,
        strengths: formStrengths || 'Solid kinetic fundamentals observed.',
        development_areas: formDevAreas || 'Maintain consistent conditioning regime.',
        detailed_notes: formNotes || 'Evaluated in competitive nets.',
        is_synthetic: true
      };

      const { evaluation, isLive } = await ApiService.createEvaluation(payload);
      setEvaluations(prev => [evaluation, ...prev]);
      addToast(
        'Evaluation Logged', 
        `Scout evaluation filed for ${players.find(p => p.id === formPlayerId)?.display_name || 'candidate'}`, 
        'success'
      );
      setIsModalOpen(false);

      // Reset qualitative fields
      setFormStrengths('');
      setFormDevAreas('');
      setFormNotes('');
    } catch (err) {
      console.error('Failed to save evaluation:', err);
      addToast('Error', 'Could not record evaluation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter evaluations
  const filteredEvaluations = evaluations.filter(ev => {
    const matchesRec = filterRec === 'ALL' || ev.scout_recommendation === filterRec;
    const player = players.find(p => p.id === ev.player_id);
    const matchesSearch = !searchQuery || 
      (player && player.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ev.evaluator_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.detailed_notes && ev.detailed_notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRec && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-scout-surface border border-scout-card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-scout-neon/10 border border-scout-neon/30 flex items-center justify-center text-scout-neon">
            <ClipboardList size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
              Scout Workspace & Watchlist
            </h1>
            <p className="text-xs text-scout-muted mt-0.5">
              Active talent watchlist, subjective scout reviews, and selection decisions
            </p>
          </div>
        </div>

        <Button 
          variant="neon" 
          onClick={() => setIsModalOpen(true)}
          className="text-xs"
        >
          <Plus size={15} className="mr-1.5" />
          Log Scout Evaluation
        </Button>
      </div>

      {/* Watchlist Section */}
      <div className="bg-scout-surface border border-scout-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-scout-neon" />
            <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
              Priority Watchlist ({shortlistedPlayers.length})
            </h2>
          </div>
          <span className="text-xs text-scout-muted font-mono">
            Directly queued for talent selection review
          </span>
        </div>

        {shortlistedPlayers.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-scout-card text-scout-muted">
            <p className="text-sm">Your watchlist is currently empty.</p>
            <p className="text-xs mt-1">Browse Player Discovery to add prospective candidates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shortlistedPlayers.map(player => (
              <div 
                key={player.id}
                className="bg-scout-card/60 border border-scout-card hover:border-scout-neon/40 p-4 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={player.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                        alt={player.display_name} 
                        className="w-12 h-12 object-cover rounded border border-scout-card"
                      />
                      <div>
                        <h3 className="font-bold font-mono text-white text-sm hover:text-scout-neon transition-colors cursor-pointer"
                            onClick={() => navigateToPlayer(player.id)}>
                          {player.display_name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <RoleBadge role={player.primary_role} />
                          <span className="text-[10px] text-scout-muted font-mono">{player.nationality}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleShortlist(player.id)}
                      className="text-scout-muted hover:text-rose-400 p-1 transition-colors"
                      title="Remove from Watchlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono bg-scout-surface p-2.5 border border-scout-card/60">
                    <div>
                      <div className="text-[10px] text-scout-muted uppercase">Batting</div>
                      <div className="text-white text-[11px] truncate">{player.batting_hand.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-scout-muted uppercase">Index Rating</div>
                      <div className="text-scout-neon font-bold text-xs">{player.latest_score?.toFixed(1) || '85.0'}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-scout-card/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => navigateToCompare([player.id])}
                    className="text-scout-muted hover:text-white flex items-center gap-1 font-mono text-[11px]"
                  >
                    <GitCompare size={12} /> Compare
                  </button>
                  <button
                    onClick={() => navigateToAssessment(player.id)}
                    className="text-scout-muted hover:text-white flex items-center gap-1 font-mono text-[11px]"
                  >
                    <Activity size={12} /> Assess
                  </button>
                  <button
                    onClick={() => navigateToPlayer(player.id)}
                    className="text-scout-neon hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    Dossier <ExternalLink size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evaluation Records & Feed */}
      <div className="bg-scout-surface border border-scout-card p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2">
              <ClipboardList size={16} className="text-scout-neon" />
              Scout Observation Records ({filteredEvaluations.length})
            </h2>
            <p className="text-xs text-scout-muted mt-0.5">
              Structured expert coach assessments and qualitative match logs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-scout-muted" />
              <input
                type="text"
                placeholder="Search notes or player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-scout-card border border-scout-card pl-8 pr-3 py-1.5 text-xs text-white placeholder-scout-muted focus:outline-none focus:border-scout-neon w-48 font-mono"
              />
            </div>

            {/* Recommendation Filter */}
            <div className="flex items-center gap-1 bg-scout-card p-0.5 border border-scout-card">
              {(['ALL', 'SHORTLIST', 'ACADEMY_SELECT', 'MONITOR'] as const).map(rec => (
                <button
                  key={rec}
                  onClick={() => setFilterRec(rec)}
                  className={`px-2 py-1 text-[11px] font-mono transition-colors ${
                    filterRec === rec
                      ? 'bg-scout-surface text-scout-neon shadow-sm'
                      : 'text-scout-muted hover:text-white'
                  }`}
                >
                  {rec.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Evaluations List */}
        <div className="space-y-3">
          {filteredEvaluations.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-scout-card text-scout-muted font-mono text-xs">
              No scout evaluations matching this criteria.
            </div>
          ) : (
            filteredEvaluations.map(ev => {
              const player = players.find(p => p.id === ev.player_id);
              return (
                <div 
                  key={ev.id}
                  className="bg-scout-card/40 border border-scout-card p-4 space-y-3 hover:border-scout-card/80 transition-colors"
                >
                  {/* Top Bar of Record */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-scout-card/60 pb-3">
                    <div className="flex items-center gap-3">
                      {player && (
                        <img 
                          src={player.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                          alt={player.display_name} 
                          className="w-10 h-10 object-cover rounded border border-scout-card"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span 
                            onClick={() => player && navigateToPlayer(player.id)}
                            className="font-mono font-bold text-white text-sm hover:text-scout-neon cursor-pointer"
                          >
                            {player?.display_name || 'Prospect'}
                          </span>
                          <RecommendationBadge recommendation={ev.scout_recommendation} />
                        </div>
                        <div className="text-[11px] text-scout-muted">
                          Evaluated by <strong className="text-gray-300 font-medium">{ev.evaluator_name}</strong> • {ev.evaluator_organization}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold font-mono text-scout-neon leading-none">
                          {ev.overall_rating.toFixed(1)} <span className="text-xs text-scout-muted font-normal">/ 10</span>
                        </div>
                        <div className="text-[10px] font-mono text-scout-muted uppercase mt-0.5">
                          {ev.evaluation_date}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4 Pillars Rating Strip */}
                  <div className="grid grid-cols-4 gap-2 text-center font-mono py-1 bg-scout-surface border border-scout-card/50">
                    <div className="p-1">
                      <span className="text-[10px] text-scout-muted block uppercase">Technical</span>
                      <span className="text-xs font-bold text-white">{ev.technical_rating.toFixed(1)}</span>
                    </div>
                    <div className="p-1 border-l border-scout-card/60">
                      <span className="text-[10px] text-scout-muted block uppercase">Tactical</span>
                      <span className="text-xs font-bold text-white">{ev.tactical_rating.toFixed(1)}</span>
                    </div>
                    <div className="p-1 border-l border-scout-card/60">
                      <span className="text-[10px] text-scout-muted block uppercase">Physical</span>
                      <span className="text-xs font-bold text-white">{ev.physical_rating.toFixed(1)}</span>
                    </div>
                    <div className="p-1 border-l border-scout-card/60">
                      <span className="text-[10px] text-scout-muted block uppercase">Mental</span>
                      <span className="text-xs font-bold text-white">{ev.mental_rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Qualitative Commentary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {ev.strengths && (
                      <div className="p-2.5 bg-scout-surface/80 border-l-2 border-scout-neon">
                        <strong className="text-scout-neon block uppercase font-mono text-[10px] mb-0.5">
                          Observed Strengths
                        </strong>
                        <p className="text-gray-300">{ev.strengths}</p>
                      </div>
                    )}
                    {ev.development_areas && (
                      <div className="p-2.5 bg-scout-surface/80 border-l-2 border-amber-400">
                        <strong className="text-amber-400 block uppercase font-mono text-[10px] mb-0.5">
                          Development Areas
                        </strong>
                        <p className="text-gray-300">{ev.development_areas}</p>
                      </div>
                    )}
                  </div>

                  {ev.detailed_notes && (
                    <div className="text-xs text-scout-muted italic border-t border-scout-card/50 pt-2 flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-scout-muted flex-shrink-0" />
                      <span>"{ev.detailed_notes}"</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Log Scout Evaluation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-scout-surface border border-scout-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-scout-card">
              <div className="flex items-center gap-2">
                <ClipboardList size={18} className="text-scout-neon" />
                <h3 className="text-base font-bold font-mono text-white uppercase">
                  Log New Scout Evaluation
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-scout-muted hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitEvaluation} className="p-5 space-y-4">
              {/* Player & Evaluator Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-scout-muted uppercase">Candidate Player *</label>
                  <select
                    value={formPlayerId}
                    onChange={(e) => setFormPlayerId(e.target.value)}
                    className="w-full bg-scout-card border border-scout-card px-3 py-2 text-xs text-white focus:outline-none focus:border-scout-neon"
                    required
                  >
                    {players.map(p => (
                      <option key={p.id} value={p.id} className="bg-scout-card text-white">
                        {p.display_name} ({p.primary_role.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-scout-muted uppercase">Recommendation *</label>
                  <select
                    value={formRec}
                    onChange={(e) => setFormRec(e.target.value as ScoutRecommendation)}
                    className="w-full bg-scout-card border border-scout-card px-3 py-2 text-xs text-white focus:outline-none focus:border-scout-neon"
                  >
                    <option value="SHORTLIST">SHORTLIST (High Priority Prospect)</option>
                    <option value="ACADEMY_SELECT">ACADEMY SELECT (Development Squad)</option>
                    <option value="MONITOR">MONITOR (Track in Next Tournament)</option>
                    <option value="DEVELOPMENT_POOL">DEVELOPMENT POOL (Grassroots Pool)</option>
                    <option value="REJECT">REJECT (Does Not Meet Benchmark)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-scout-muted uppercase">Evaluator Name</label>
                  <input
                    type="text"
                    value={formEvaluator}
                    onChange={(e) => setFormEvaluator(e.target.value)}
                    className="w-full bg-scout-card border border-scout-card px-3 py-2 text-xs text-white focus:outline-none focus:border-scout-neon font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-scout-muted uppercase">Organization / Panel</label>
                  <input
                    type="text"
                    value={formOrg}
                    onChange={(e) => setFormOrg(e.target.value)}
                    className="w-full bg-scout-card border border-scout-card px-3 py-2 text-xs text-white focus:outline-none focus:border-scout-neon font-mono"
                  />
                </div>
              </div>

              {/* 4 Pillars Slider Ratings */}
              <div className="p-4 bg-scout-card/40 border border-scout-card space-y-3">
                <div className="flex items-center justify-between border-b border-scout-card/60 pb-2">
                  <span className="text-xs font-mono font-bold uppercase text-white">Core Evaluation Pillars (1 - 10)</span>
                  <span className="text-xs font-mono font-bold text-scout-neon">
                    Calculated Overall: {calculatedOverall}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  {/* Technical */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-scout-muted text-[11px]">
                      <span>TECHNICAL (35%)</span>
                      <span className="text-scout-neon font-bold">{formTech.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" step="0.1" 
                      value={formTech} 
                      onChange={(e) => setFormTech(parseFloat(e.target.value))}
                      className="w-full accent-scout-neon cursor-pointer"
                    />
                  </div>

                  {/* Tactical */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-scout-muted text-[11px]">
                      <span>TACTICAL (25%)</span>
                      <span className="text-scout-neon font-bold">{formTact.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" step="0.1" 
                      value={formTact} 
                      onChange={(e) => setFormTact(parseFloat(e.target.value))}
                      className="w-full accent-scout-neon cursor-pointer"
                    />
                  </div>

                  {/* Physical */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-scout-muted text-[11px]">
                      <span>PHYSICAL (20%)</span>
                      <span className="text-scout-neon font-bold">{formPhys.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" step="0.1" 
                      value={formPhys} 
                      onChange={(e) => setFormPhys(parseFloat(e.target.value))}
                      className="w-full accent-scout-neon cursor-pointer"
                    />
                  </div>

                  {/* Mental */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-scout-muted text-[11px]">
                      <span>MENTAL (20%)</span>
                      <span className="text-scout-neon font-bold">{formMental.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" step="0.1" 
                      value={formMental} 
                      onChange={(e) => setFormMental(parseFloat(e.target.value))}
                      className="w-full accent-scout-neon cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Qualitative Observations */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-scout-muted uppercase">Observed Strengths</label>
                  <input
                    type="text"
                    value={formStrengths}
                    onChange={(e) => setFormStrengths(e.target.value)}
                    placeholder="e.g. Crisp bat swing plane, exceptional front-foot balance"
                    className="w-full bg-scout-card border border-scout-card px-3 py-2 text-xs text-white placeholder-scout-muted focus:outline-none focus:border-scout-neon"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-scout-muted uppercase">Development Focus Areas</label>
                  <input
                    type="text"
                    value={formDevAreas}
                    onChange={(e) => setFormDevAreas(e.target.value)}
                    placeholder="e.g. Work on wrist rotation during late cut, back-foot stability"
                    className="w-full bg-scout-card border border-scout-card px-3 py-2 text-xs text-white placeholder-scout-muted focus:outline-none focus:border-scout-neon"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-scout-muted uppercase">Detailed Match / Net Observations</label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Provide contextual observations, temperament under match pressure..."
                    className="w-full bg-scout-card border border-scout-card px-3 py-2 text-xs text-white placeholder-scout-muted focus:outline-none focus:border-scout-neon"
                  />
                </div>
              </div>

              {/* Form Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-scout-card">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="neon" 
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Record Evaluation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
