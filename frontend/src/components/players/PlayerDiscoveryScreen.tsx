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
  Plus,
  ArrowRight,
  GitCompare,
  Bookmark,
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

  const roles = [
    { key: 'ALL', label: 'All Players' },
    { key: 'BATSMAN', label: 'Batsmen' },
    { key: 'BOWLER', label: 'Bowlers' },
    { key: 'ALL_ROUNDER', label: 'All-Rounders' },
    { key: 'WICKET_KEEPER', label: 'Wicketkeepers' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Filter and Controls Bar */}
      <div className="bg-[#12141a] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by player name, team, academy..."
              className="w-full bg-[#14161f] border border-white/10 rounded-xl focus:border-scout-neon focus:outline-none pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-gray-500"
            />
          </div>

          {/* Action and View Toggles */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-[#14161f] border border-white/10 rounded-lg focus:border-scout-neon focus:outline-none px-3 py-2 text-xs font-mono text-white"
              >
                <option value="score">Technique Rating</option>
                <option value="name">Player Name</option>
                <option value="height">Height</option>
              </select>
            </div>

            {/* Grid vs Table View */}
            <div className="flex items-center border border-white/10 rounded-lg bg-[#14161f] p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#1e222d] text-scout-neon' : 'text-gray-400 hover:text-white'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-[#1e222d] text-scout-neon' : 'text-gray-400 hover:text-white'}`}
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
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
          <span className="text-xs font-mono text-gray-400 mr-1">Role:</span>
          {roles.map(r => (
            <button
              key={r.key}
              onClick={() => setRoleFilter(r.key)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                roleFilter === r.key
                  ? 'bg-scout-neon text-black font-bold shadow-sm'
                  : 'bg-[#14161f] text-gray-400 hover:text-white border border-white/5 hover:border-white/15'
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
          <p className="font-mono text-xs text-gray-400">Loading talent roster...</p>
        </div>
      ) : sortedPlayers.length === 0 ? (
        <div className="bg-[#12141a] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <p className="font-mono text-sm text-gray-400">No cricketers matching your search criteria.</p>
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
                className="bg-[#12141a] border border-white/10 hover:border-scout-neon/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <Badge role={p.primary_role} size="sm" />
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-base font-bold text-scout-neon">
                        {p.latest_score?.toFixed(1) || '75.0'}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 uppercase">
                        Score
                      </span>
                    </div>
                  </div>

                  {/* Player Basic Info */}
                  <div className="mt-4 flex items-center gap-3.5">
                    <img
                      src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={p.display_name}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <h3
                        onClick={() => navigateToPlayer(p.id)}
                        className="font-mono text-sm font-bold text-white hover:text-scout-neon cursor-pointer transition-colors truncate"
                      >
                        {p.display_name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {p.current_team || 'Academy Pool'}
                      </p>
                      <p className="text-[11px] font-mono text-gray-400 mt-1">
                        {p.batting_hand.replace('_', ' ')} • {p.bowling_style.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Attributes strip */}
                  <div className="mt-4 grid grid-cols-3 gap-2 bg-[#0e1015] p-2.5 rounded-xl border border-white/5 text-center font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Height</span>
                      <span className="font-bold text-white">{p.height_cm || '180'} cm</span>
                    </div>
                    <div className="border-x border-white/5">
                      <span className="text-[10px] text-gray-400 block">Weight</span>
                      <span className="font-bold text-white">{p.weight_kg || '74'} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Sessions</span>
                      <span className="font-bold text-scout-neon">{p.assessment_count || 1}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleShortlist(p.id)}
                      className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
                        shortlisted
                          ? 'bg-scout-neon/20 border-scout-neon text-scout-neon'
                          : 'bg-[#14161f] border-white/10 text-gray-400 hover:text-white'
                      }`}
                      title={shortlisted ? 'In Watchlist' : 'Add to Watchlist'}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => addToCompare(p.id)}
                      className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
                        inCompare
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                          : 'bg-[#14161f] border-white/10 text-gray-400 hover:text-white'
                      }`}
                      title="Compare Player"
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
                    Dossier
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#12141a] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5 bg-[#0e1015] text-[11px] text-gray-400 uppercase">
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Batting</th>
                  <th className="py-3 px-4">Bowling</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedPlayers.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={p.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-white hover:text-scout-neon cursor-pointer" onClick={() => navigateToPlayer(p.id)}>
                            {p.display_name}
                          </p>
                          <p className="text-[10px] text-gray-400">{p.nationality}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><Badge role={p.primary_role} size="sm" /></td>
                    <td className="py-3 px-4 text-gray-300">{p.current_team}</td>
                    <td className="py-3 px-4 text-gray-400">{p.batting_hand.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-gray-400">{p.bowling_style.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-center font-bold text-scout-neon text-sm">{p.latest_score?.toFixed(1) || '80.0'}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => navigateToPlayer(p.id)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
