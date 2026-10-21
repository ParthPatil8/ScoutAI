import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { PlayerProfile, CricketRole } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  Plus,
  ArrowRight,
  GitCompare,
  Bookmark,
  Check,
  Award,
} from 'lucide-react';

export const PlayerDiscoveryScreen: React.FC<{ onOpenNewPlayerModal: () => void }> = ({ onOpenNewPlayerModal }) => {
  const { navigateToPlayer, addToCompare, comparePlayerIds, toggleShortlist, isShortlisted } = useApp();
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'height'>('score');

  const fetchPlayers = async () => {
    setLoading(true);
    const res = await ApiService.getPlayers(roleFilter, search);
    setPlayers(res.items);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
  }, [roleFilter, search]);

  // Sort
  const sortedPlayers = [...players].sort((a, b) => {
    if (sortBy === 'score') return (b.latest_score || 0) - (a.latest_score || 0);
    if (sortBy === 'name') return a.display_name.localeCompare(b.display_name);
    if (sortBy === 'height') return (b.height_cm || 0) - (a.height_cm || 0);
    return 0;
  });

  const roles: { key: string; label: string }[] = [
    { key: 'ALL', label: 'All Roles' },
    { key: 'BATSMAN', label: 'Batsmen' },
    { key: 'BOWLER', label: 'Pace & Spin Bowlers' },
    { key: 'ALL_ROUNDER', label: 'All-Rounders' },
    { key: 'WICKET_KEEPER', label: 'Wicketkeepers' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="bg-scout-card border border-scout-border hud-border p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-scout-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search talent by name, academy, squad..."
              className="w-full bg-scout-surface border border-scout-border focus:border-scout-neon focus:outline-none pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-scout-dim"
            />
          </div>

          {/* Action and View Toggles */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs font-mono text-scout-muted">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-scout-surface border border-scout-border focus:border-scout-neon focus:outline-none px-2.5 py-2 text-xs font-mono text-white"
              >
                <option value="score">Technique Rating</option>
                <option value="name">Player Name</option>
                <option value="height">Physical Height</option>
              </select>
            </div>

            {/* Grid vs Table View */}
            <div className="flex items-center border border-scout-border bg-scout-surface p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-scout-card text-scout-neon' : 'text-scout-muted hover:text-white'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 transition-colors ${viewMode === 'table' ? 'bg-scout-card text-scout-neon' : 'text-scout-muted hover:text-white'}`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Add Player */}
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={onOpenNewPlayerModal}
            >
              Add Cricketer
            </Button>
          </div>
        </div>

        {/* Role Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-scout-border/60">
          <span className="text-xs font-mono text-scout-dim uppercase mr-1">Filter Role:</span>
          {roles.map(r => (
            <button
              key={r.key}
              onClick={() => setRoleFilter(r.key)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
                roleFilter === r.key
                  ? 'bg-scout-neon text-black font-bold shadow-neon-sm'
                  : 'bg-scout-surface text-scout-muted hover:text-white border border-scout-border hover:border-scout-borderLight'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-scout-neon border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs uppercase tracking-widest text-scout-muted">
            SYNCING PROSPECT TELEMETRY ROSTER...
          </p>
        </div>
      ) : sortedPlayers.length === 0 ? (
        <div className="bg-scout-card border border-scout-border p-12 text-center space-y-3">
          <p className="font-mono text-sm uppercase text-scout-muted">
            NO CRICKETERS MATCHING THE CURRENT QUERY
          </p>
          <Button variant="outline" size="sm" onClick={() => { setSearch(''); setRoleFilter('ALL'); }}>
            Reset Filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedPlayers.map(p => {
            const inCompare = comparePlayerIds.includes(p.id);
            const shortlisted = isShortlisted(p.id);

            return (
              <div
                key={p.id}
                className="bg-scout-card border border-scout-border hover:border-scout-neon/50 transition-all duration-200 hud-border p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-scout-border">
                    <Badge role={p.primary_role} size="sm" />
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-scout-neon">
                        {p.latest_score?.toFixed(1) || '75.0'}
                      </span>
                      <span className="text-[10px] font-mono text-scout-muted uppercase">
                        PTS
                      </span>
                    </div>
                  </div>

                  {/* Player Hero */}
                  <div className="mt-4 flex items-center gap-4">
                    <img
                      src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={p.display_name}
                      className="w-14 h-14 object-cover border border-scout-border group-hover:border-scout-neon transition-colors"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-mono text-base font-black text-white truncate uppercase group-hover:text-scout-neon transition-colors">
                        {p.display_name}
                      </h3>
                      <p className="text-xs text-scout-muted truncate">
                        {p.current_team || 'Academy Pool'}
                      </p>
                      <p className="text-[11px] font-mono text-scout-dim mt-0.5 truncate">
                        {p.batting_hand.replace('_', ' ')} • {p.bowling_style !== 'NONE' ? p.bowling_style.replace(/_/g, ' ') : 'Specialist Bat'}
                      </p>
                    </div>
                  </div>

                  {/* Physical Telemetry Specs */}
                  <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 bg-scout-surface border border-scout-border/60 text-center font-mono text-[11px]">
                    <div>
                      <span className="text-scout-dim block text-[10px]">HEIGHT</span>
                      <span className="text-white font-bold">{p.height_cm || 180} cm</span>
                    </div>
                    <div>
                      <span className="text-scout-dim block text-[10px]">WEIGHT</span>
                      <span className="text-white font-bold">{p.weight_kg || 74} kg</span>
                    </div>
                    <div>
                      <span className="text-scout-dim block text-[10px]">ASSESSED</span>
                      <span className="text-scout-neon font-bold">{p.assessment_count || 1}x</span>
                    </div>
                  </div>

                  {/* Scout notes quote */}
                  {p.scout_notes && (
                    <p className="mt-3 text-xs text-scout-muted line-clamp-2 italic font-mono">
                      "{p.scout_notes}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3.5 border-t border-scout-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleShortlist(p.id)}
                      className={`p-2 border transition-colors ${
                        shortlisted 
                          ? 'bg-scout-neon text-black border-scout-neon shadow-neon-sm' 
                          : 'bg-scout-surface text-scout-muted hover:text-white border-scout-border'
                      }`}
                      title={shortlisted ? 'Remove from shortlist' : 'Add to scout shortlist'}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => inCompare ? null : addToCompare(p.id)}
                      disabled={inCompare}
                      className={`p-2 border transition-colors ${
                        inCompare
                          ? 'bg-cyan-950/80 text-cyan-400 border-cyan-700'
                          : 'bg-scout-surface text-scout-muted hover:text-white border-scout-border'
                      }`}
                      title={inCompare ? 'Already in comparison list' : 'Add to side-by-side compare'}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => navigateToPlayer(p.id)}
                  >
                    View Dossier
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-scout-card border border-scout-border hud-border overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-scout-surface border-b border-scout-border text-scout-muted uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Cricketer</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Style & Action</th>
                <th className="py-3 px-4">Squad / Academy</th>
                <th className="py-3 px-4">Height/Weight</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-scout-border/60">
              {sortedPlayers.map(p => (
                <tr key={p.id} className="hover:bg-scout-surface/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-scout-neon text-sm">
                    {p.latest_score?.toFixed(1) || '75.0'}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => navigateToPlayer(p.id)}
                      className="font-bold text-white hover:text-scout-neon transition-colors text-left flex items-center gap-2.5"
                    >
                      <img src={p.avatar_url} alt="" className="w-7 h-7 object-cover border border-scout-border" />
                      <span>{p.display_name}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <Badge role={p.primary_role} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-scout-muted">
                    {p.batting_hand.replace('_', ' ')} • {p.bowling_style !== 'NONE' ? p.bowling_style.replace(/_/g, ' ') : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-white truncate max-w-xs">
                    {p.current_team || 'Academy Pool'}
                  </td>
                  <td className="py-3 px-4 text-scout-dim">
                    {p.height_cm}cm / {p.weight_kg}kg
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => addToCompare(p.id)}
                      className="p-1.5 text-scout-muted hover:text-cyan-400 bg-scout-surface border border-scout-border"
                      title="Add to compare"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                    </button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigateToPlayer(p.id)}
                    >
                      Profile
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
