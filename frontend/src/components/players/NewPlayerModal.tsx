import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { Button } from '../common/Button';
import { CricketRole, BattingHand, BowlingStyle } from '../../types';
import { X, UserPlus, ShieldAlert } from 'lucide-react';

interface NewPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerCreated?: () => void;
}

export const NewPlayerModal: React.FC<NewPlayerModalProps> = ({ isOpen, onClose, onPlayerCreated }) => {
  const { addToast, navigateToPlayer } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    primary_role: 'BATSMAN' as CricketRole,
    batting_hand: 'RIGHT_HAND' as BattingHand,
    bowling_style: 'NONE' as BowlingStyle,
    height_cm: 180,
    weight_kg: 74,
    current_team: '',
    nationality: 'India',
    scout_notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('First name and last name are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { player, isLive } = await ApiService.createPlayer({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        primary_role: formData.primary_role,
        batting_hand: formData.batting_hand,
        bowling_style: formData.bowling_style,
        height_cm: Number(formData.height_cm),
        weight_kg: Number(formData.weight_kg),
        current_team: formData.current_team.trim() || 'Unassigned Academy',
        nationality: formData.nationality.trim() || 'India',
        scout_notes: formData.scout_notes.trim(),
        is_synthetic: true,
      });

      addToast(
        'Player Profile Created',
        `${player.display_name} registered into ScoutAI ${isLive ? '(Live DB)' : '(Sandbox)'}`,
        'success'
      );

      if (onPlayerCreated) onPlayerCreated();
      onClose();
      navigateToPlayer(player.id);
    } catch (err: any) {
      setError(err?.message || 'Failed to create player profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-scout-card border border-scout-neon/50 shadow-neon-lg hud-border p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-scout-border">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-scout-neon" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
              REGISTER NEW PROSPECT DOSSIER
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-scout-dim hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-950/60 border border-rose-700 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-scout-muted mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full bg-scout-surface border border-scout-border focus:border-scout-neon focus:outline-none px-3 py-2 text-xs font-mono text-white"
                placeholder="e.g. Yashasvi"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-scout-muted mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full bg-scout-surface border border-scout-border focus:border-scout-neon focus:outline-none px-3 py-2 text-xs font-mono text-white"
                placeholder="e.g. Jaiswal"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-scout-muted mb-1">
                Primary Role
              </label>
              <select
                value={formData.primary_role}
                onChange={e => setFormData({ ...formData, primary_role: e.target.value as CricketRole })}
                className="w-full bg-scout-surface border border-scout-border focus:border-scout-neon focus:outline-none px-2.5 py-2 text-xs font-mono text-white"
              >
                <option value="BATSMAN">BATSMAN</option>
                <option value="BOWLER">BOWLER</option>
                <option value="ALL_ROUNDER">ALL ROUNDER</option>
                <option value="WICKET_KEEPER">WICKET KEEPER</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-scout-muted mb-1">
                Batting Hand
              </label>
              <select
                value={formData.batting_hand}
                onChange={e => setFormData({ ...formData, batting_hand: e.target.value as BattingHand })}
                className="w-full bg-scout-surface border border-scout-border focus:border-scout-neon focus:outline-none px-2.5 py-2 text-xs font-mono text-white"
              >
                <option value="RIGHT_HAND">RIGHT HAND</option>
                <option value="LEFT_HAND">LEFT HAND</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-scout-muted mb-1">
                Bowling Style
              </label>
              <select
                value={formData.bowling_style}
                onChange={e => setFormData({ ...formData, bowling_style: e.target.value as BowlingStyle })}
                className="w-full bg-scout-surface border border-scout-border focus:border-scout-neon focus:outline-none px-2 py-2 text-xs font-mono text-white"
              >
                <option value="NONE">NONE</option>
                <option value="RIGHT_ARM_FAST">RIGHT ARM FAST</option>
                <option value="RIGHT_ARM_FAST_MEDIUM">RIGHT ARM MED-FAST</option>
                <option value="RIGHT_ARM_OFF_SPIN">RIGHT ARM OFF SPIN</option>
                <option value="RIGHT_ARM_LEG_SPIN">RIGHT ARM LEG SPIN</option>
                <option value="LEFT_ARM_FAST">LEFT ARM FAST</option>
                <option value="LEFT_ARM_ORTHODOX">LEFT ARM ORTHODOX</option>
                <option value="LEFT_ARM_WRIST_SPIN">LEFT ARM WRIST SPIN</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-scout-muted mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                min="140"
                max="220"
                value={formData.height_cm}
                onChange={e => setFormData({ ...formData, height_cm: Number(e.target.value) })}
                className="w-full bg-scout-surface border border-scout-border focus:border-scout-neon focus:outline-none px-3 py-2 text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-scout-muted mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                min="45"
                max="130"
                value={formData.weight_kg}
                onChange={e => setFormData({ ...formData, weight_kg: Number(e.target.value) })}
                className="w-full bg-scout-surface border border-scout-border focus:border-scout-neon focus:outline-none px-3 py-2 text-xs font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-scout-muted mb-1">
                Current Team / Academy
              </label>
              <input
                type="text"
                value={formData.current_team}
                onChange={e => setFormData({ ...formData, current_team: e.target.value })}
                className="w-full bg-scout-surface border border-scout-border focus:border-scout-neon focus:outline-none px-3 py-2 text-xs font-mono text-white"
                placeholder="e.g. Mumbai Colts"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-scout-muted mb-1">
              Initial Scout Observation Notes
            </label>
            <textarea
              rows={3}
              value={formData.scout_notes}
              onChange={e => setFormData({ ...formData, scout_notes: e.target.value })}
              className="w-full bg-scout-surface border border-scout-border focus:border-scout-neon focus:outline-none p-3 text-xs font-mono text-white resize-none"
              placeholder="Notable technical instincts, bat speed observations, match temperament..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-scout-border">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={loading}>
              Commit Prospect Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
