import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { 
  ShieldCheck, 
  User, 
  ArrowRight, 
  Crosshair, 
  Activity, 
  Award, 
  Lock, 
  Mail, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginAsScout, loginAsPlayer, loginCustom } = useApp();
  const [selectedRole, setSelectedRole] = useState<'SCOUT' | 'PLAYER'>('SCOUT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginCustom(email || (selectedRole === 'SCOUT' ? 'scout@scoutai.com' : 'player@scoutai.com'), selectedRole);
  };

  return (
    <div className="min-h-screen bg-[#08090b] text-gray-200 flex flex-col justify-between selection:bg-scout-neon selection:text-black">
      {/* Top Brand Bar */}
      <header className="px-6 py-5 border-b border-white/5 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="ScoutAI Logo" className="h-9 w-auto object-contain" />
          <div className="hidden sm:block border-l border-white/10 pl-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-scout-neon font-bold leading-none">
              Intelligence Engine
            </p>
            <p className="text-[11px] text-gray-500 font-mono mt-0.5">
              Cricket Talent Scouting & Biomechanics Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <span className="w-2 h-2 rounded-full bg-scout-neon animate-pulse" />
          <span>v1.0.0 Pro</span>
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-4xl w-full space-y-8">
          {/* Headline */}
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-scout-neon/10 border border-scout-neon/30 text-scout-neon font-mono text-xs font-semibold">
              <Sparkles size={12} />
              <span>Select Your Dedicated Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight uppercase">
              Welcome to ScoutAI
            </h1>
            <p className="text-sm text-gray-400">
              High-performance kinematic analysis and talent assessment. Choose your workflow to continue.
            </p>
          </div>

          {/* Portal Selector Cards (Scout vs Player) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Scout / Coach Card */}
            <div 
              onClick={() => setSelectedRole('SCOUT')}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                selectedRole === 'SCOUT'
                  ? 'bg-[#12141a] border-scout-neon shadow-lg shadow-scout-neon/5 ring-1 ring-scout-neon'
                  : 'bg-[#0e1015] border-white/10 hover:border-white/20 hover:bg-[#12141a]/60'
              }`}
            >
              {selectedRole === 'SCOUT' && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 size={20} className="text-scout-neon" />
                </div>
              )}

              <div>
                <div className="w-12 h-12 rounded-xl bg-scout-neon/10 border border-scout-neon/30 flex items-center justify-center text-scout-neon mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
                  Scout & Coach Portal
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  For talent scouts, academy selectors, high-performance directors, and cricket coaches.
                </p>

                <div className="mt-5 space-y-2 text-xs text-gray-300 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-scout-neon" />
                    <span>Searchable Roster & Talent Discovery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-scout-neon" />
                    <span>Head-to-Head Kinematic Comparisons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-scout-neon" />
                    <span>4-Pillar Qualitative & Technical Ratings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-scout-neon" />
                    <span>Normative First-Class & International Baselines</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/5">
                <Button
                  variant={selectedRole === 'SCOUT' ? 'primary' : 'outline'}
                  size="md"
                  className="w-full justify-between"
                  onClick={(e) => {
                    e.stopPropagation();
                    loginAsScout();
                  }}
                >
                  <span>1-Click Sign In as Coach Vikram</span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>

            {/* Player / Athlete Card */}
            <div 
              onClick={() => setSelectedRole('PLAYER')}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                selectedRole === 'PLAYER'
                  ? 'bg-[#12141a] border-scout-neon shadow-lg shadow-scout-neon/5 ring-1 ring-scout-neon'
                  : 'bg-[#0e1015] border-white/10 hover:border-white/20 hover:bg-[#12141a]/60'
              }`}
            >
              {selectedRole === 'PLAYER' && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 size={20} className="text-scout-neon" />
                </div>
              )}

              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                  <User size={24} />
                </div>
                <h3 className="text-lg font-mono font-bold text-white uppercase tracking-wider">
                  Player & Athlete Portal
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  For cricketers wanting to track their personal technique, progress, and review coach feedback.
                </p>

                <div className="mt-5 space-y-2 text-xs text-gray-300 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Personal Technique Index & Bio-Radar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Upload Net Session Videos for AI Diagnostics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Plain-English Feedback (Knee flex, Head lock, Stride)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Progression Timeline (Baseline vs Recent)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/5 space-y-2">
                <Button
                  variant={selectedRole === 'PLAYER' ? 'primary' : 'outline'}
                  size="md"
                  className="w-full justify-between"
                  onClick={(e) => {
                    e.stopPropagation();
                    loginAsPlayer('p-arjun-verma');
                  }}
                >
                  <span>1-Click Sign In as Arjun (Batter)</span>
                  <ArrowRight size={14} />
                </Button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    loginAsPlayer('p-kabir-khan');
                  }}
                  className="w-full py-1.5 text-center text-[11px] font-mono text-gray-400 hover:text-white transition-colors"
                >
                  Or sign in as Kabir Khan (Fast Bowler) →
                </button>
              </div>
            </div>
          </div>

          {/* Optional Direct Credentials Form */}
          <div className="p-6 bg-[#0e1015] border border-white/10 rounded-2xl max-w-lg mx-auto">
            <div className="text-center mb-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Or Sign In with Credentials
              </h4>
              <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                Access your {selectedRole === 'SCOUT' ? 'Scout' : 'Player'} account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'SCOUT' ? 'scout@scoutai.com' : 'player@scoutai.com'}
                    className="w-full bg-[#14161f] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-scout-neon font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#14161f] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-scout-neon font-mono"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="md"
                className="w-full mt-2"
              >
                Sign In to {selectedRole === 'SCOUT' ? 'Scout Hub' : 'Player Portal'}
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-white/5 text-center text-xs text-gray-500 font-mono">
        ScoutAI • AI-Powered Cricket Talent Scouting & Biomechanics Platform
      </footer>
    </div>
  );
};
